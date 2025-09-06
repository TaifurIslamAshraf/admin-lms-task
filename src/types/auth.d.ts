import { IUser } from "./user";

// types/auth.ts
export interface RefreshResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: IUser;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
