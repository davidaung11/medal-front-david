"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, Cloud, Cloudy, Compass, Goal, Grid3X3, LayoutGrid } from "lucide-react";
import { UserMenuPopover } from "@/components/UserMenuPopover";

type Props = {
  userName: string;
  isSubmenuOpen?: boolean;
  onCredentialCloudClick?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/credentials-cloud") {
    return pathname.startsWith("/credentials-cloud");
  }
  if (href === "/experience-hub") {
    return pathname.startsWith("/experience-hub");
  }
  if (href === "/mission-room") {
    return pathname.startsWith("/mission-room");
  }
  return pathname === href;
}

export function AppMainSidebar({ userName, isSubmenuOpen = false, onCredentialCloudClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnCredentialCloud = isActive(pathname, "/credentials-cloud");

  const handleCredentialCloudClick = () => {
    if (onCredentialCloudClick) {
      onCredentialCloudClick();
      return;
    }
    router.push("/credentials-cloud/credentials");
  };

  return (
    <aside
      className={[
        "relative z-[10000] flex w-[86px] shrink-0 flex-col items-center border-r border-slate-200 bg-white/90 px-2 py-4",
        "transition-[border-radius,box-shadow,background-color] duration-300 ease-out",
        isSubmenuOpen ? "rounded-none shadow-none" : "rounded-r-2xl bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex w-full justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
          <Image src="/app/assets/logos/medalverse-logo.svg" alt="Medalverse Logo" width={26} height={26} />
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        <nav className="flex w-full flex-col gap-3">
          <SidebarItem href="/credentials-cloud" icon={Cloudy} label="Credential Cloud" active={isActive(pathname, "/credentials-cloud")} />
          <SidebarItem href="/mission-room" icon={Goal} label="Mission Room" active={isActive(pathname, "/mission-room")} />
          <SidebarItem href="/experience-hub" icon={LayoutGrid} label="Experience Hub" active={isActive(pathname, "/experience-hub")} />
        </nav>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-1">
        <button className="text-slate-500 transition hover:text-slate-700" type="button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <UserMenuPopover name={userName} />
      </div>
    </aside>
  );
}

function itemClass(active: boolean) {
  return `flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] leading-tight transition ${
    active ? "bg-[#eaf4ff] text-blue-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
  }`;
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-caption-caption-sm transition-colors duration-200 ${active
          ? "bg-background-bg-brand-primary text-text-brand-primary"
          : "text-text-tertiary hover:bg-background-bg-active hover:text-text-secondary-hover"
        }`}
    >
      <Icon
        size={18}
        className={`transition-colors duration-200 ${active
            ? "text-foreground-fg-brand-primary"
            : "text-foreground-fg-secondary group-hover:text-foreground-fg-secondary-hover"
          }`}
      />
      <span>{label}</span>
    </Link>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={itemClass(active)} aria-label={label}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
