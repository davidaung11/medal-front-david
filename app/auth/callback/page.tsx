"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { writeBackendAccessToken } from "@/shared/auth/backend-access-token.client";
import { ROUTES } from "@/shared/constants/routes";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then(() => {
        writeBackendAccessToken(token);
        router.replace(ROUTES.dashboard);
        router.refresh();
      });
    } else {
      router.replace(ROUTES.login);
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edf4fb]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#edf4fb]"><p className="text-sm font-medium text-slate-600">Loading...</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}
