import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, send, TOKEN_KEY } from "@/lib/api";

const AuthContext = createContext(null);
const USER_KEY = "writer_user";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readUser);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("author:logout", logout);
    return () => window.removeEventListener("author:logout", logout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/author-login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    setToken(data.token);
    setUser(data.data);
    return data.data;
  };

  const resetPassword = (token, password) => send("post", "/auth/reset-password", { token, password });
  const forgotPassword = (email) => send("post", "/auth/forgot-password", { email, account: "author" });

  return <AuthContext.Provider value={{ token, user, login, logout, resetPassword, forgotPassword, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
