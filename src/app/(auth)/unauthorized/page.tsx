import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mt-4 text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
        <Link href="/login" className="mt-4 text-blue-500 hover:underline">
          Return to Login
        </Link>
      </div>
    </div>
  );
}
