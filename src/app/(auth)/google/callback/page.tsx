"use client";

import { useVerifyGoogleAuthMutation } from "@/redux/features/auth/googleAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAuthCallback() {
  const [verifyGoogleAuth] = useVerifyGoogleAuthMutation();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await verifyGoogleAuth({}).unwrap();
        router.push("/dashboard"); // Redirect to dashboard or home page
      } catch (error) {
        console.error("Google auth verification failed", error);
        router.push("/login");
      }
    };

    verifyAuth();
  }, [verifyGoogleAuth, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <p>Authenticating...</p>
      </div>
    </div>
  );
}
