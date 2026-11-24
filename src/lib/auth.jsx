import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, isViewOnly, send, tokenOf, TOKEN_KEY, VIEW_KEY } from "@/lib/api";

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
  const [token, setToken] = useState(tokenOf);
  const [user, setUser] = useState(readUser);
  const [viewOnly, setViewOnly] = useState(isViewOnly);

  const logout = useCallback(() => {
    // Leaving the admin view never touches the author's own sign-in on this browser.
    if (isViewOnly()) sessionStorage.removeItem(VIEW_KEY);
    else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
    setViewOnly(false);
    setToken(tokenOf());
    queryClient.clear();
  }, [queryClient]);

  const startView = useCallback((viewToken) => {
    sessionStorage.setItem(VIEW_KEY, viewToken);
    setViewOnly(true);
    setToken(viewToken);
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

  return <AuthContext.Provider value={{ token, user, viewOnly, login, logout, startView, resetPassword, forgotPassword, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// "Skip for now" on onboarding lasts for this sign-in only; the next login shows it again.
const SKIP_KEY = "writer_onboarding_skip";
export const skipOnboarding = (token) => localStorage.setItem(SKIP_KEY, token || "");
export const onboardingSkipped = (token) => Boolean(token) && localStorage.getItem(SKIP_KEY) === token;
