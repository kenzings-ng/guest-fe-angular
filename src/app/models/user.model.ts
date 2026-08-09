export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Address {
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface Profile {
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: Address;
}

export interface UserProfile extends User {
  profile: Profile;
  createdAt?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: Address;
}
