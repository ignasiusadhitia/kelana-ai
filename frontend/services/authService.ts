/**
 * SERVICE LAYER: Centralized Client Authentication & Session Management.
 * Manages user registration, credential verification, profile updates,
 * and HttpOnly cookie-based session management.
 *
 * Security: Authentication tokens are stored securely in HttpOnly cookies
 * set by the Next.js BFF layer. Client JavaScript never touches raw JWTs,
 * preventing Cross-Site Scripting (XSS) token theft.
 */

import { AuthResponse, LoginCredentials, RegisterCredentials, UserProfile, User } from "@/types/auth";

/**
 * Backward compatibility stub: session tokens are stored in HttpOnly cookies.
 */
export function getAuthToken(): string | null {
  return null;
}

/**
 * Backward compatibility stub.
 */
export function setAuthToken(_token: string): void {
  // No-op: tokens are managed via HttpOnly cookies set by server
}

/**
 * Backward compatibility stub.
 */
export function removeAuthToken(): void {
  // No-op: cookie removal is handled via /api/v1/auth/logout
}

/**
 * Authenticates user via Next.js proxy route /api/v1/auth/login.
 * The server automatically sets the HttpOnly `kelana_token` session cookie.
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
  return data;
}

/**
 * Logs out user by requesting the BFF server to clear the HttpOnly session cookie.
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.warn("Error during logout request:", error);
  }
}

/**
 * Fetches current authenticated user profile and travel activity analytics.
 * The browser automatically passes the HttpOnly `kelana_token` cookie.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await fetch("/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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
  const response = await fetch("/api/v1/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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
  const response = await fetch("/api/v1/auth/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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
 * Permanently deletes authenticated user account and clears server session cookie.
 */
export async function deleteUserAccount(): Promise<{ message: string }> {
  const response = await fetch("/api/v1/auth/account", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete account. Please try again.");
  }

  return response.json();
}
