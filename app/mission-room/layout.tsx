import React from "react";
import { redirect } from "next/navigation";
import { AppMainSidebar } from "@/components/AppMainSidebar";
import { MissionRoomSidebarContent } from "@/components/MissionRoomSidebarContent";
import { getServerSession } from "@/shared/auth/server-session";
import { ROUTES } from "@/shared/constants/routes";

export default async function MissionRoomLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect(ROUTES.login);
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-[#eaf4ff] to-[#dff2e9] p-2">
      <div className="flex h-full overflow-hidden rounded-2xl shadow-sm">
        <AppMainSidebar userName={session.name} />
        <main className="flex min-w-0 flex-1 overflow-hidden px-1.5">
          <div className="flex h-full w-full overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <MissionRoomSidebarContent />

            <section className="flex-1 overflow-y-auto bg-white p-8">{children}</section>
          </div>
        </main>
      </div>
    </div>
  );
}
