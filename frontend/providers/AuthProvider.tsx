"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, LoginCredentials, RegisterCredentials } from "@/types/auth";
import {
  getAuthToken,
  removeAuthToken,
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "@/services/authService";
import { toast } from "@/components/ui/toast";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, redirectTo?: string) => Promise<void>;
  register: (credentials: RegisterCredentials, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; default_travel_style?: string }) => Promise<void>;
  changePassword: (data: { current_password: string; new_password: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Refresh user profile from backend
  const refreshUser = useCallback(async () => {
    const activeToken = getAuthToken();
    if (!activeToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getCurrentUser();
      setUser(profile);
      setTokenState(activeToken);
    } catch {
      removeAuthToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state on mount safely
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const activeToken = getAuthToken();
      if (!activeToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await getCurrentUser();
        if (isMounted) {
          setUser(profile);
          setTokenState(activeToken);
        }
      } catch {
        removeAuthToken();
        if (isMounted) {
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler supporting custom return URL
  const login = async (credentials: LoginCredentials, redirectTo?: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser(credentials);
      setTokenState(res.access_token);
      await refreshUser();
      toast.success(`Welcome back, ${res.user.name}!`, { title: "Signed In" });
      router.push(redirectTo || "/trips");
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler supporting custom return URL
  const register = async (credentials: RegisterCredentials, redirectTo?: string) => {
    setIsLoading(true);
    try {
      const res = await registerUser(credentials);
      setTokenState(res.access_token);
      await refreshUser();
      toast.success(`Account created! Welcome to KelanaAI, ${res.user.name}.`, { title: "Registration Complete" });
      router.push(redirectTo || "/trips");
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile name & travel preferences
  const updateProfile = async (data: { name?: string; default_travel_style?: string }) => {
    const updated = await updateUserProfile(data);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: updated.name ?? prev.name,
            default_travel_style: updated.default_travel_style ?? prev.default_travel_style,
          }
        : null
    );
    toast.success("Profile saved successfully!", { title: "Profile Saved" });
  };

  // Change account password
  const changePassword = async (data: { current_password: string; new_password: string }) => {
    await changeUserPassword(data);
    toast.success("Password changed successfully!", { title: "Security Updated" });
  };

  // Delete account permanently (GDPR / Privacy)
  const deleteAccount = async () => {
    await deleteUserAccount();
    removeAuthToken();
    setUser(null);
    setTokenState(null);
    toast.info("Your account has been permanently deleted.", { title: "Account Deleted" });
    router.push("/");
  };

  // Logout handler
  const logout = () => {
    removeAuthToken();
    setUser(null);
    setTokenState(null);
    toast.info("You have been signed out successfully.", { title: "Signed Out" });
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
