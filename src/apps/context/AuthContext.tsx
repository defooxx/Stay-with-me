import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

interface AccountRecord extends User {
  passwordHash: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "staywithme_user";
const ACCOUNT_STORAGE_KEY = "staywithme_accounts";
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
    "Brave", "Kind", "Gentle", "Strong", "Peaceful", "Calm", "Bright",
    "Hope", "Noble", "Wise", "Swift", "Silent", "Serene", "Radiant",
  ];
  const nouns = [
    "Soul", "Heart", "Spirit", "Light", "Star", "Moon", "Sun",
    "Phoenix", "Dream", "Ocean", "Mountain", "River", "Cloud", "Butterfly",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeUser = (user: User): User => ({
  ...user,
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  countryCode: user.countryCode || "US",
  countryName: user.countryName || "United States",
  settings: { ...defaultUserSettings, ...user.settings },
});

const getAccounts = (): AccountRecord[] => {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: AccountRecord[]) => {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
};

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
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

const accountToUser = (account: AccountRecord): User => {
  const { passwordHash: _passwordHash, ...user } = account;
  return normalizeUser(user);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedUser) {
      const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      applyTheme(preferredTheme || defaultUserSettings.theme);
      return;
    }

    try {
      const parsed = JSON.parse(savedUser) as User;
      const normalized = normalizeUser(parsed);
      const accounts = getAccounts();
      const existsInAccounts = accounts.some((account) => account.email === normalized.email);
      if (!existsInAccounts) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        applyTheme(preferredTheme || defaultUserSettings.theme);
        return;
      }
      setUser(normalized);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
      applyTheme(normalized.settings.theme);
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      applyTheme(preferredTheme || defaultUserSettings.theme);
    }
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
    const normalizedEmail = normalizeEmail(email);
    const accounts = getAccounts();
    const existing = accounts.some((account) => account.email === normalizedEmail);
    if (existing) {
      return { success: false, message: "Account already exists. Please log in." };
    }

    const now = new Date().toISOString();
    const passwordHash = await hashText(password);
    const createdAccount: AccountRecord = {
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryCode,
      countryName,
      nickname: nickname?.trim() || generateNickname(),
      createdAt: now,
      lastLoginAt: now,
      settings: defaultUserSettings,
      passwordHash,
    };

    const updatedAccounts = [...accounts, createdAccount];
    saveAccounts(updatedAccounts);

    const nextUser = accountToUser(createdAccount);
    setUser(nextUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
    applyTheme(nextUser.settings.theme);
    return { success: true };
  };

  const login: AuthContextType["login"] = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((account) => account.email === normalizedEmail);
    if (accountIndex === -1) {
      return {
        success: false,
        message: "This email is not registered yet. Please register first.",
      };
    }

    const submittedHash = await hashText(password);
    const account = accounts[accountIndex];
    if (submittedHash !== account.passwordHash) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    const updatedAccount = {
      ...account,
      lastLoginAt: new Date().toISOString(),
      settings: { ...defaultUserSettings, ...account.settings },
    };
    accounts[accountIndex] = updatedAccount;
    saveAccounts(accounts);

    const nextUser = accountToUser(updatedAccount);
    setUser(nextUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
    applyTheme(nextUser.settings.theme);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    applyTheme(preferredTheme || defaultUserSettings.theme);
  };

  const updateAccountAndSession = (updater: (current: AccountRecord) => AccountRecord) => {
    if (!user) {
      return;
    }

    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((account) => account.email === user.email);
    if (accountIndex === -1) {
      return;
    }

    const updated = updater(accounts[accountIndex]);
    accounts[accountIndex] = updated;
    saveAccounts(accounts);

    const nextUser = accountToUser(updated);
    setUser(nextUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
    applyTheme(nextUser.settings.theme);
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
    updateAccountAndSession((current) => ({
      ...current,
      privatePinHash: pinHash,
      pinRecoveryQuestion: question.trim(),
      pinRecoveryAnswerHash: answerHash,
    }));
  };

  const verifyPrivatePin: AuthContextType["verifyPrivatePin"] = async (pin) => {
    if (!user?.privatePinHash) {
      return false;
    }
    const pinHash = await hashText(pin);
    return pinHash === user.privatePinHash;
  };

  const verifyPinRecoveryAnswer: AuthContextType["verifyPinRecoveryAnswer"] = async (answer) => {
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
    updateAccountAndSession((current) => ({
      ...current,
      privatePinHash: pinHash,
    }));
  };

  const updateUserSettings: AuthContextType["updateUserSettings"] = (settings) => {
    updateAccountAndSession((current) => ({
      ...current,
      settings: { ...defaultUserSettings, ...current.settings, ...settings },
    }));
  };

  const updateProfile: AuthContextType["updateProfile"] = (profile) => {
    updateAccountAndSession((current) => ({
      ...current,
      ...profile,
    }));
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
