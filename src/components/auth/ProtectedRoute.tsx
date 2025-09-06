"use client";

import { useAuth } from "@/hooks/useAuth";
import GlobalLoader from "@/components/GlobalLoader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }

    if (!isLoading && isAuthenticated && allowedRoles?.length) {
      const hasRequiredRole = allowedRoles.includes(user?.role || "");
      if (!hasRequiredRole) {
        router.replace("/unauthorized");
      }
    }
  }, [isLoading, isAuthenticated, router, allowedRoles, user?.role]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role || "")) {
    return null;
  }

  return <>{children}</>;
}
