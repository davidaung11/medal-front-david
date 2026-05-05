import { notFound } from "next/navigation";

const SECTION_TEXT: Record<string, { title: string; description: string }> = {
  discovery: {
    title: "Discovery Center",
    description: "Explore opportunities and discover missions that match your profile.",
  },
  workspace: {
    title: "Mission Workspace",
    description: "Manage your active missions, collaboration flow, and progress.",
  },
  planner: {
    title: "Smart Planner",
    description: "Plan timelines and milestones with reusable templates.",
  },
  essay: {
    title: "Essay Studio",
    description: "Draft and polish essays with guided structures and tips.",
  },
};

export default async function MissionRoomSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = SECTION_TEXT[section];

  if (!content) {
    notFound();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h1 className="text-2xl font-semibold text-slate-800">{content.title}</h1>
      <p className="mt-2 text-slate-600">{content.description}</p>
    </div>
  );
}
