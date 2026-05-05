import { ContentPageSkeleton } from "@/components/skeletons/ContentPageSkeleton";

export default function Loading() {
  return <ContentPageSkeleton showHeader={false} rows={3} cards={10} />;
}
