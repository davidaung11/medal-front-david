import { EventDetailScreen } from "@/modules/experience/presentation/event-detail-screen";

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailScreen eventId={id} />;
}
