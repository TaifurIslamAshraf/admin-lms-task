import { useUserInfoQuery } from "@/redux/features/apiSlice/apiSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/features/auth/authSlice";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isLoading, refetch } = useUserInfoQuery({});

  useEffect(() => {
    if (!user && isAuthenticated) {
      refetch();
    }
  }, [user, isAuthenticated, refetch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === "admin",
  };
}
