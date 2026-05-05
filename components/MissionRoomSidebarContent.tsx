"use client";

import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Folder, FolderPlus, PenTool, Plus, Rocket } from "lucide-react";
import { SidebarFrame } from "@/components/SidebarFrame";
import { SidebarHeader } from "@/components/SidebarHeader";
import { SidebarItem } from "@/components/SidebarItem";

const MISSION_MENU = [
  { href: "/mission-room/discovery", label: "Discovery Center", icon: BookOpen, enabled: false },
  { href: "/mission-room/workspace", label: "Mission Workspace", icon: Rocket, enabled: false },
  { href: "/mission-room/planner", label: "Smart Planner", icon: ClipboardList, enabled: false },
  { href: "/mission-room/essay", label: "Essay Studio", icon: PenTool , enabled: false},
];

export function MissionRoomSidebarContent() {
  const pathname = usePathname();

  return (
    <SidebarFrame>
      {/* <SidebarHeader title="Mission Room" /> */}

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <nav className="mb-8 flex flex-col gap-1">
          {MISSION_MENU.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname.startsWith(item.href)}
              isEnabled={item.enabled} // Disable all items for now, as the features are not implemented yet
            />
          ))}
        </nav>

        <div className="mb-8 px-2">
          <div className="group mb-2 flex cursor-pointer items-center justify-between px-2 text-gray-900">
            <span className="text-sm font-medium">Folder</span>
            <button className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" type="button">
              <FolderPlus size={16} />
            </button>
          </div>
          <div className="space-y-1">
            <FolderItem label="New folder 1" />
            <FolderItem label="New folder 2" />
          </div>
        </div>

        <div className="px-2">
          <div className="mb-2 flex items-center justify-between px-2 text-gray-900">
            <span className="text-sm font-medium">History</span>
            <button className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" type="button">
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 space-y-3 px-2">
            <HistoryItem text="Art Program in NUS Sing..." />
            <HistoryItem text="Thammasat University I..." />
            <HistoryItem text="What are the criteria for..." />
          </div>
        </div>
      </div>
    </SidebarFrame>
  );
}

function FolderItem({ label }: { label: string }) {
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900">
      <Folder size={18} strokeWidth={1.5} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function HistoryItem({ text }: { text: string }) {
  return <div className="cursor-pointer truncate text-sm text-gray-500 hover:text-gray-900 hover:underline">{text}</div>;
}
