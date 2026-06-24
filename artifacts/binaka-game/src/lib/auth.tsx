import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "@workspace/api-client-react";
import { getMe, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Set token getter for all api-client-react calls
    setAuthTokenGetter(() => localStorage.getItem("binaka_token"));

    const initAuth = async () => {
      const token = localStorage.getItem("binaka_token");
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          console.error("Auth init failed:", error);
          localStorage.removeItem("binaka_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("binaka_token", token);
    setUser(userData);
    if (userData.isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("binaka_token");
    setUser(null);
    setLocation("/login");
  };

  const refetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refetch user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
