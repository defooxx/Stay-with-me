import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getSupabaseHeaders,
  supabaseUrl,
} from "../lib/supabase";

type ThemeMode = "light" | "dark";

interface UserSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  profileVisible: boolean;
  notifyOnLikes: boolean;
  notifyOnComments: boolean;
  notifyOnLetters: boolean;
  theme: ThemeMode;
}

interface User {
  email: string;
  nickname: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  countryName: string;
  createdAt: string;
  lastLoginAt: string;
  privatePinHash?: string;
  pinRecoveryQuestion?: string;
  pinRecoveryAnswerHash?: string;
  settings: UserSettings;
}

interface AuthResult {
  success: boolean;
  message?: string;
  sessionEstablished?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    countryCode: string;
    countryName: string;
    nickname?: string;
  }) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPrivateAccessConfigured: boolean;
  setupPrivateAccess: (pin: string, question: string, answer: string) => Promise<void>;
  verifyPrivatePin: (pin: string) => Promise<boolean>;
  verifyPinRecoveryAnswer: (answer: string) => Promise<boolean>;
  resetPrivatePin: (newPin: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateProfile: (profile: Partial<Pick<User, "firstName" | "lastName" | "nickname">>) => void;
}

type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  user: User;
};

type SupabaseAuthUser = {
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseSessionResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: SupabaseAuthUser;
  error_description?: string;
  msg?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "staywithme_supabase_session";
const THEME_STORAGE_KEY = "staywithme_theme";

const defaultUserSettings: UserSettings = {
  notificationsEnabled: true,
  emailNotifications: false,
  profileVisible: true,
  notifyOnLikes: true,
  notifyOnComments: true,
  notifyOnLetters: true,
  theme: "light",
};

const generateNickname = () => {
  const adjectives = [
    "Brave",
    "Kind",
    "Gentle",
    "Strong",
    "Peaceful",
    "Calm",
    "Bright",
    "Hope",
    "Noble",
    "Wise",
    "Swift",
    "Silent",
    "Serene",
    "Radiant",
  ];
  const nouns = [
    "Soul",
    "Heart",
    "Spirit",
    "Light",
    "Star",
    "Moon",
    "Sun",
    "Phoenix",
    "Dream",
    "Ocean",
    "Mountain",
    "River",
    "Cloud",
    "Butterfly",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashText = async (text: string) => {
  const value = text.trim();
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
  }
  return btoa(value);
};

const normalizeUser = (user: User): User => ({
  ...user,
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  nickname: user.nickname || generateNickname(),
  countryCode: user.countryCode || "US",
  countryName: user.countryName || "United States",
  settings: { ...defaultUserSettings, ...user.settings },
});

const mapSupabaseUser = (authUser: SupabaseAuthUser): User => {
  const metadata = authUser.user_metadata || {};
  return normalizeUser({
    email: normalizeEmail(authUser.email || ""),
    nickname:
      typeof metadata.nickname === "string" && metadata.nickname.trim()
        ? metadata.nickname
        : generateNickname(),
    firstName: typeof metadata.firstName === "string" ? metadata.firstName : "",
    lastName: typeof metadata.lastName === "string" ? metadata.lastName : "",
    countryCode:
      typeof metadata.countryCode === "string" ? metadata.countryCode : "US",
    countryName:
      typeof metadata.countryName === "string"
        ? metadata.countryName
        : "United States",
    createdAt: authUser.created_at || new Date().toISOString(),
    lastLoginAt: authUser.last_sign_in_at || authUser.created_at || new Date().toISOString(),
    privatePinHash:
      typeof metadata.privatePinHash === "string"
        ? metadata.privatePinHash
        : undefined,
    pinRecoveryQuestion:
      typeof metadata.pinRecoveryQuestion === "string"
        ? metadata.pinRecoveryQuestion
        : undefined,
    pinRecoveryAnswerHash:
      typeof metadata.pinRecoveryAnswerHash === "string"
        ? metadata.pinRecoveryAnswerHash
        : undefined,
    settings:
      typeof metadata.settings === "object" && metadata.settings
        ? (metadata.settings as UserSettings)
        : defaultUserSettings,
  });
};

const readStoredSession = (): StoredSession | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const buildAuthMessage = (payload: Record<string, unknown>) => {
  const description = payload.error_description;
  if (typeof description === "string" && description.trim()) {
    return description;
  }

  const message = payload.msg;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const error = payload.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "Authentication request failed.";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    applyTheme(preferredTheme || defaultUserSettings.theme);
  };

  const saveSession = (
    nextAccessToken: string,
    nextRefreshToken: string | null,
    authUser: SupabaseAuthUser
  ) => {
    const nextUser = mapSupabaseUser(authUser);
    const storedSession: StoredSession = {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      user: nextUser,
    };

    setUser(nextUser);
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession));
    applyTheme(nextUser.settings.theme);
  };

  const fetchCurrentUser = async (token: string) => {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: getSupabaseHeaders(token),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SupabaseAuthUser;
  };

  const refreshAuthSession = async (token: string) => {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ refresh_token: token }),
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SupabaseSessionResponse;
  };

  useEffect(() => {
    const run = async () => {
      const stored = readStoredSession();
      if (!stored) {
        const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        applyTheme(preferredTheme || defaultUserSettings.theme);
        return;
      }

      const currentUser = await fetchCurrentUser(stored.accessToken);
      if (currentUser) {
        saveSession(stored.accessToken, stored.refreshToken, currentUser);
        return;
      }

      if (stored.refreshToken) {
        const refreshed = await refreshAuthSession(stored.refreshToken);
        if (refreshed?.access_token && refreshed.user) {
          saveSession(
            refreshed.access_token,
            refreshed.refresh_token || stored.refreshToken,
            refreshed.user
          );
          return;
        }
      }

      clearSession();
    };

    void run();
  }, []);

  const signup: AuthContextType["signup"] = async ({
    email,
    password,
    firstName,
    lastName,
    countryCode,
    countryName,
    nickname,
  }) => {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          countryCode,
          countryName,
          nickname: nickname?.trim() || generateNickname(),
          settings: defaultUserSettings,
        },
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    > &
      SupabaseSessionResponse;

    if (!response.ok) {
      return { success: false, message: buildAuthMessage(payload) };
    }

    if (payload.access_token && payload.user) {
      saveSession(
        payload.access_token,
        payload.refresh_token || null,
        payload.user
      );
      return { success: true, sessionEstablished: true };
    }

    return {
      success: true,
      sessionEstablished: false,
      message:
        "Account created. Check your email to confirm it before logging in.",
    };
  };

  const login: AuthContextType["login"] = async (email, password) => {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          email: normalizeEmail(email),
          password,
        }),
      }
    );

    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    > &
      SupabaseSessionResponse;

    if (!response.ok || !payload.access_token || !payload.user) {
      return {
        success: false,
        message: buildAuthMessage(payload),
      };
    }

    saveSession(payload.access_token, payload.refresh_token || null, payload.user);
    return { success: true, sessionEstablished: true };
  };

  const logout = () => {
    const token = accessToken;
    clearSession();

    if (!token) {
      return;
    }

    void fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: getSupabaseHeaders(token),
    });
  };

  const updateRemoteUser = async (metadata: Record<string, unknown>) => {
    if (!accessToken) {
      return;
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: getSupabaseHeaders(accessToken),
      body: JSON.stringify({ data: metadata }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as SupabaseAuthUser;
    saveSession(accessToken, refreshToken, payload);
  };

  const setupPrivateAccess: AuthContextType["setupPrivateAccess"] = async (
    pin,
    question,
    answer
  ) => {
    if (!user) {
      return;
    }

    const pinHash = await hashText(pin);
    const answerHash = await hashText(answer.toLowerCase());
    await updateRemoteUser({
      ...user,
      email: undefined,
      createdAt: undefined,
      lastLoginAt: undefined,
      privatePinHash: pinHash,
      pinRecoveryQuestion: question.trim(),
      pinRecoveryAnswerHash: answerHash,
    });
  };

  const verifyPrivatePin: AuthContextType["verifyPrivatePin"] = async (pin) => {
    if (!user?.privatePinHash) {
      return false;
    }
    const pinHash = await hashText(pin);
    return pinHash === user.privatePinHash;
  };

  const verifyPinRecoveryAnswer: AuthContextType["verifyPinRecoveryAnswer"] = async (
    answer
  ) => {
    if (!user?.pinRecoveryAnswerHash) {
      return false;
    }
    const answerHash = await hashText(answer.toLowerCase());
    return answerHash === user.pinRecoveryAnswerHash;
  };

  const resetPrivatePin: AuthContextType["resetPrivatePin"] = async (newPin) => {
    if (!user) {
      return;
    }

    const pinHash = await hashText(newPin);
    await updateRemoteUser({
      ...user,
      email: undefined,
      createdAt: undefined,
      lastLoginAt: undefined,
      privatePinHash: pinHash,
    });
  };

  const updateUserSettings: AuthContextType["updateUserSettings"] = (settings) => {
    if (!user) {
      return;
    }

    const nextSettings = {
      ...defaultUserSettings,
      ...user.settings,
      ...settings,
    };

    void updateRemoteUser({
      ...user,
      email: undefined,
      createdAt: undefined,
      lastLoginAt: undefined,
      settings: nextSettings,
    });
  };

  const updateProfile: AuthContextType["updateProfile"] = (profile) => {
    if (!user) {
      return;
    }

    void updateRemoteUser({
      ...user,
      email: undefined,
      createdAt: undefined,
      lastLoginAt: undefined,
      ...profile,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        hasPrivateAccessConfigured: !!user?.privatePinHash,
        setupPrivateAccess,
        verifyPrivatePin,
        verifyPinRecoveryAnswer,
        resetPrivatePin,
        updateUserSettings,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
