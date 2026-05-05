import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/auth/server-session";
import { ROUTES } from "@/shared/constants/routes";

export default async function HomePage() {
  const session = await getServerSession();
  redirect(session ? ROUTES.dashboard : ROUTES.login);
}
