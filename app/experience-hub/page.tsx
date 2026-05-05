import { ExperienceContent } from "@/modules/experience/presentation/experience-content";

export default async function ExperienceHubPage() {
  return (
    <div className="px-2 pb-2 sm:px-2.5 sm:pb-2.5">
      <div
        className="h-[148px] overflow-hidden rounded-2xl border border-slate-200 bg-background-bg-brand-section sm:h-[196px] sm:rounded-3xl"
        style={{
          backgroundImage: "url('/app/assets/banners/dashboard.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <ExperienceContent />
    </div>
  );
}
