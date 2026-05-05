/** Must match `basePath` in next.config.ts */
export const APP_BASE_PATH = "/app" as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  dashboard: "/credentials-cloud/credentials",
  apiLogin: "/api/auth/login",
  apiCheckEmail: "/api/auth/check-email",
  apiSignup: "/api/auth/signup",
  apiLogout: "/api/auth/logout",
} as const;
