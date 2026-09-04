"use client";

/**
 * PROVIDER: Centralized Authentication & User Session Context
 * Supplies user profile, authentication state, and session mutation methods.
 * Session state is governed by HttpOnly cookies managed securely by the BFF layer.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, LoginCredentials, RegisterCredentials } from "@/types/auth";
import {
  loginUser,
  logoutUser,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Refresh user profile from backend via HttpOnly cookie
  const refreshUser = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state on mount safely
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const profile = await getCurrentUser();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        if (isMounted) {
          setUser(null);
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
      await refreshUser();
      toast.success(`Welcome back, ${res.user?.name || "Traveler"}!`, { title: "Signed In" });
      router.push(redirectTo || "/trips");
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler: creates account, does not auto-login, redirects to /login
  const register = async (credentials: RegisterCredentials, redirectTo?: string) => {
    setIsLoading(true);
    try {
      await registerUser(credentials);
      toast.success("Account created successfully! Please sign in with your credentials.", {
        title: "Registration Complete",
      });
      const queryParams = new URLSearchParams();
      queryParams.set("registered", "true");
      if (credentials.email) {
        queryParams.set("email", credentials.email);
      }
      if (redirectTo && redirectTo !== "/trips") {
        queryParams.set("redirect", redirectTo);
      }
      router.push(`/login?${queryParams.toString()}`);
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
    setUser(null);
    toast.info("Your account has been permanently deleted.", { title: "Account Deleted" });
    router.push("/");
  };

  // Logout handler
  const logout = async () => {
    await logoutUser();
    setUser(null);
    toast.info("You have been signed out successfully.", { title: "Signed Out" });
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token: user ? "cookie_authenticated" : null,
    isAuthenticated: !!user,
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
