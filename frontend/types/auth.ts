/**
 * AUTH TYPES: Contract Definitions for User Authentication & Profile (Session 8)
 */

export interface User {
  id: number;
  name: string;
  email: string;
  default_travel_style?: string;
  created_at: string;
}

export interface UserProfile extends User {
  total_trips: number;
  total_budget?: number;
  total_days?: number;
  destinations?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
