"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { clearBackendAccessToken } from "@/shared/auth/backend-access-token.client";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await fetch(ROUTES.apiLogout, { method: "POST" });
    clearBackendAccessToken();
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      type="button"
    >
      Sign out
    </button>
  );
}
