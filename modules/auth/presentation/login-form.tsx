"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/ui/TextInput";
import { ROUTES } from "@/shared/constants/routes";
import { writeBackendAccessToken } from "@/shared/auth/backend-access-token.client";

type FormState = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialState: FormState = {
  email: "admin@medalverse.io",
  password: "P@ssword123",
  rememberMe: true,
};

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(ROUTES.apiLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Login failed.");
        return;
      }

      const token = payload?.data?.backendAccessToken;
      if (typeof token === "string" && token) {
        writeBackendAccessToken(token);
      }

      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Work Email
        </label>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.rememberMe}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              rememberMe: event.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
        />
        Keep me signed in for 30 days
      </label>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
