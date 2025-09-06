export interface IUser {
  fullName: string;
  email: string;
  isSocialAuth: boolean;
  avatar?: string;
  role: "admin" | "user";
  address?: string;
  phone?: string;

}
