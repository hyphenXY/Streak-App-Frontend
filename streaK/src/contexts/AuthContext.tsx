import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";

interface User {
  email: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from refresh-token cookie using /refresh
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.post("/auth/refresh");
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    setAccessToken(res.data.accessToken);
    (global as any).accessToken = res.data.accessToken;  // for axios interceptor
    setUser(res.data.user);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    (global as any).accessToken = null;
    api.post("/auth/logout");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
