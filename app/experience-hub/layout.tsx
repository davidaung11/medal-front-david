import { redirect } from "next/navigation";
import Image from "next/image";
import { AppMainSidebar } from "@/components/AppMainSidebar";
import { getServerSession } from "@/shared/auth/server-session";
import { ROUTES } from "@/shared/constants/routes";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  // if (!session) {
  //   redirect(ROUTES.login);
  // }

  return (
    <div className="relative h-screen w-full overflow-hidden p-2">
      
      <Image
        src="/app/assets/backgrounds/bg-CredentialCloud.jpg" 
        alt="Main Layout Background"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
          zIndex: 0, 
        }}
      />

      <div className="relative z-10 flex h-full overflow-hidden rounded-2xl shadow-sm">
        <AppMainSidebar userName={session?.name ||""} />
        <main className="flex min-w-0 flex-1 overflow-hidden px-1.5">
          <div className="min-w-0 flex-1 overflow-auto rounded-3xl px-2 pb-2">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}