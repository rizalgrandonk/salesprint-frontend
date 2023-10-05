export type User = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  email: string;
  role: string;
  email_verified_at: string | null;
  phone_number: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};
