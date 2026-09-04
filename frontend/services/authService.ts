/**
 * SERVICE LAYER: Centralized Client Authentication & Session Management.
 * Manages JWT storage (localStorage + Http/Lax cookies), user registration,
 * credential verification, profile updates, and logout flows.
 */

import { AuthResponse, LoginCredentials, RegisterCredentials, UserProfile, User } from "@/types/auth";

const TOKEN_KEY = "kelana_auth_token";

/**
 * Retrieves stored JWT token from client storage.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Persists JWT token into localStorage and cookies for client/server sync.
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Set cookie for 7 days
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Removes JWT token from client storage and clears cookie.
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Authenticates user via Next.js proxy route /api/v1/auth/login.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password. Please try again.");
  }

  const data: AuthResponse = await response.json();
  setAuthToken(data.access_token);
  return data;
}

/**
 * Registers a new user account via Next.js proxy route /api/v1/auth/register.
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create account. Please check your information.");
  }

  const data: AuthResponse = await response.json();
  setAuthToken(data.access_token);
  return data;
}

/**
 * Fetches current authenticated user profile and travel activity analytics.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found.");
  }

  const response = await fetch("/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to retrieve user profile.");
  }

  return response.json();
}

/**
 * Updates traveler profile display name & default travel style.
 */
export async function updateUserProfile(data: {
  name?: string;
  default_travel_style?: string;
}): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found.");
  }

  const response = await fetch("/api/v1/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update profile name.");
  }

  return response.json();
}

/**
 * Changes authenticated user account password.
 */
export async function changeUserPassword(data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found.");
  }

  const response = await fetch("/api/v1/auth/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to change password. Please check your current password.");
  }

  return response.json();
}

/**
 * Permanently deletes authenticated user account and clears local credentials.
 */
export async function deleteUserAccount(): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found.");
  }

  const response = await fetch("/api/v1/auth/account", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete account. Please try again.");
  }

  removeAuthToken();
  return response.json();
}
