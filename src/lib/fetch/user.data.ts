import { env } from "../env";

export const refreshToken = async () => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/user/refresh`, {
      credentials: "include" as const,
      cache: "no-cache",
    });
    const data = res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getUserInfo = async () => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/user/me`, {
      credentials: "include" as const,
      cache: "no-cache",
    });
    const data = res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getAllUsers = async () => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/user/all-users`, {
      credentials: "include",
    });
    const data = res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
