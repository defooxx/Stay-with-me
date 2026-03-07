import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  email: string;
  nickname: string;
  journalPin?: string;
  confessionPin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setJournalPin: (pin: string) => void;
  setConfessionPin: (pin: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate random nickname
const generateNickname = () => {
  const adjectives = [
    "Brave", "Kind", "Gentle", "Strong", "Peaceful", "Calm", "Bright",
    "Hope", "Noble", "Wise", "Swift", "Silent", "Serene", "Radiant"
  ];
  const nouns = [
    "Soul", "Heart", "Spirit", "Light", "Star", "Moon", "Sun",
    "Phoenix", "Dream", "Ocean", "Mountain", "River", "Cloud", "Butterfly"
  ];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  
  return `${adj}${noun}${num}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("staywithme_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string) => {
    const newUser: User = {
      email,
      nickname: generateNickname(),
    };
    setUser(newUser);
    localStorage.setItem("staywithme_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("staywithme_user");
  };

  const setJournalPin = (pin: string) => {
    if (user) {
      const updatedUser = { ...user, journalPin: pin };
      setUser(updatedUser);
      localStorage.setItem("staywithme_user", JSON.stringify(updatedUser));
    }
  };

  const setConfessionPin = (pin: string) => {
    if (user) {
      const updatedUser = { ...user, confessionPin: pin };
      setUser(updatedUser);
      localStorage.setItem("staywithme_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        setJournalPin,
        setConfessionPin,
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
