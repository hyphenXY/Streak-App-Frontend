import React, { createContext, useEffect, useMemo, useState } from "react";
import authApi from "../api/authClient";
import api from "../api/api";
import { LoginResponse, User } from "../types/auth";
import { normalizeApiError } from "../utils/error";
import { getItem, setItem, removeItem } from "../services/storage";
import { ACCESS_TOKEN_KEY } from "../constants";

/**
 * Auth flow assumptions:
 * - /auth/login returns { accessToken, user } and sets HttpOnly refresh cookie
 * - /auth/refresh uses refresh cookie to return { accessToken, user }
 * - /auth/logout clears refresh cookie
 *
 * We will:
 * - store accessToken in-memory via authClient.setAccessToken
 * - optionally persist accessToken in SecureStore for instant app resume
 * - run refresh on app startup to populate user if cookie exists
 */

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  accessToken: string | null;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  accessToken: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenLocal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // helper to sync token with auth client
  const setAccessToken = (token: string | null) => {
    setAccessTokenLocal(token);
    // write to authClient in-memory
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authClientModule = require("../api/authClient");
    authClientModule.setAccessToken(token);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Try to refresh using cookie-based refresh token
        const resp = await api.post("/auth/refresh"); // uses withCredentials
        const { accessToken: t, user: u } = resp.data as LoginResponse;
        setAccessToken(t);
        setUser(u);
        // optionally persist token
        await setItem(ACCESS_TOKEN_KEY, t);
      } catch (err) {
        // no cookie or refresh failed
        setAccessToken(null);
        setUser(null);
        await removeItem(ACCESS_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post("/auth/login", { email, password });
      const { accessToken: t, user: u } = resp.data as LoginResponse;
      setAccessToken(t);
      setUser(u);
      await setItem(ACCESS_TOKEN_KEY, t);
    } catch (err) {
      const e = normalizeApiError(err);
      throw e;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const resp = await api.post("/auth/signup", { email, password });
      const { accessToken: t, user: u } = resp.data as LoginResponse;
      setAccessToken(t);
      setUser(u);
      await setItem(ACCESS_TOKEN_KEY, t);
    } catch (err) {
      const e = normalizeApiError(err);
      throw e;
    }
  };

  const logout = async () => {
    try {
      // ask backend to clear refresh cookie
      await api.post("/auth/logout");
    } catch (err) {
      // ignore errors on logout
      console.warn("logout error", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      await removeItem(ACCESS_TOKEN_KEY);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, accessToken }),
    [user, loading, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
