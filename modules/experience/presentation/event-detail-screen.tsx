"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Calendar, CalendarClock, ChevronLeft, ChevronRight, CircleStar, Clock3, FileBadge2, MapPin, Medal, Share2, FileText, Trophy, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EventDetail } from "@/modules/experience/domain/dashboard.types";
import { ClaimDialog, ClaimSuccessModal, ClaimToastBanner } from "./components/claim-dialog";
import { buildClaimFormsForEvent } from "./experience-content.utils";
import { ClaimDialogForm, ClaimToast } from "./experience-content.types";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { VerifiedBadgeImage } from "@/components/ui/VerifiedBadgeImage";
import { getMockEventImages } from "./mock-event-images";

type Props = {
  eventId: string;
};

const BOOKMARK_STORAGE_KEY = "mv_bookmarked_event_ids";
const REGISTERED_STORAGE_KEY = "mv_registered_event_ids";
const CLAIMED_STORAGE_KEY = "mv_claimed_event_ids";

export function EventDetailScreen({ eventId }: Props) {
  const [data, setData] = useState<EventDetail | null>(null);
  const [credentialIndex, setCredentialIndex] = useState(0);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [showOutcomesDialog, setShowOutcomesDialog] = useState(false);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimDialogTab, setClaimDialogTab] = useState<"credential" | "event">("credential");
  const [claimForms, setClaimForms] = useState<ClaimDialogForm[]>([]);
  const [claimActiveIndex, setClaimActiveIndex] = useState(0);
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimSourceEventId, setClaimSourceEventId] = useState<string>("");
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [claimToast, setClaimToast] = useState<ClaimToast | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((item: unknown): item is string => typeof item === "string");
    } catch {
      return [];
    }
  });
  const [registeredIds, setRegisteredIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(REGISTERED_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((item: unknown): item is string => typeof item === "string");
    } catch {
      return [];
    }
  });
  const speakersScrollRef = useRef<HTMLDivElement>(null);
  const outcomesScrollRef = useRef<HTMLDivElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    window.localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(registeredIds));
  }, [registeredIds]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CLAIMED_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const ids = parsed.filter((item: unknown): item is string => typeof item === "string");
      setClaimedIds(ids);
    } catch {
      // Ignore invalid localStorage value
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CLAIMED_STORAGE_KEY, JSON.stringify(claimedIds));
  }, [claimedIds]);

  useEffect(() => {
    if (!claimToast) {
      return;
    }
    const timer = window.setTimeout(() => setClaimToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [claimToast]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/app/api/events/${eventId}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: withBackendAuthHeaders(),
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (payload.success) {
          setData(payload.data as EventDetail);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load event detail:", error);
      }
    }

    load();
    return () => controller.abort();
  }, [eventId]);

  const event = data?.event;
  const isBookmarked = Boolean(event && bookmarkedIds.includes(event.id));
  const isRegistered = Boolean(event && (event.isRegistered || registeredIds.includes(event.id)));
  const isHistoryMode = Boolean(event && event.isHistory);
  const isRegisterMode =
    Boolean(event) && isRegistered && !isHistoryMode;
  const isClaimed = Boolean(event && claimedIds.includes(event.id));
  const credentials = data?.credentials ?? [];
  const credentialCount = credentials.length;
  const safeCredentialIndex =
    credentialCount > 0 ? Math.min(credentialIndex, credentialCount - 1) : 0;
  const activeCredential = credentials[safeCredentialIndex] ?? null;
  const recommendedBySameType =
    data?.recommended
      .filter((item) => item.type === event?.type)
      .map((item) => ({
        ...item,
        isBookmarked: bookmarkedIds.includes(item.id),
      })) ?? [];
  const galleryImages = getMockEventImages(event?.title) ?? data?.gallery ?? [];

  function toggleBookmarkById(targetId: string) {
    setBookmarkedIds((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId],
    );
  }

  const claimForm = claimForms[claimActiveIndex] ?? null;

  function openClaimDialog() {
    if (!event) {
      return;
    }
    const forms = buildClaimFormsForEvent(event);
    setClaimForms(forms);
    setClaimActiveIndex(0);
    setClaimDialogTab("credential");
    setClaimSourceEventId(event.id);
    setShowClaimDialog(true);
  }

  function closeClaimDialog() {
    setShowClaimDialog(false);
    setClaimDialogTab("credential");
    setClaimActiveIndex(0);
    setIsClaimSubmitting(false);
    setClaimSourceEventId("");
  }

  async function handleClaimPrimaryAction() {
    if (claimDialogTab === "credential") {
      setClaimDialogTab("event");
      return;
    }

    setIsClaimSubmitting(true);
    try {
      const response = await fetch("/app/api/credentials", {
        method: "POST",
        headers: withBackendAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          recipientName: claimForm?.recipientName ?? "",
          credentialName: claimForm?.credentialName ?? "",
          credentialCategory: claimForm?.credentialCategory ?? "",
          organizationAbbreviation: claimForm?.organizationAbbreviation ?? "",
          organizationName: claimForm?.organizationName ?? "",
          rank: claimForm?.rank ?? "",
          issueDate: claimForm?.issueDate ?? "",
          keyLearning: claimForm?.keyLearning ?? "",
          visibility: "public",
          eventId: claimSourceEventId,
          eventField: claimForm?.eventField ?? "",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.success) {
        const rawError = payload?.error ?? "Unable to claim credential";
        setClaimToast({ type: "error", message: rawError });
        return;
      }

      closeClaimDialog();
      if (claimSourceEventId) {
        setClaimedIds((prev) =>
          prev.includes(claimSourceEventId) ? prev : [...prev, claimSourceEventId],
        );
      }
      setShowClaimSuccessModal(true);
      setClaimToast({ type: "success", message: "Credential claimed successfully" });
    } finally {
      setIsClaimSubmitting(false);
    }
  }

  return (
    <div className="px-2.5 pb-2.5 pt-3">
      <div className="mb-3 rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <Link
            href="/experience-hub"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-[#f7fbff] px-4 text-sm text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:bg-white"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-[#f7fbff] px-4 text-sm text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:bg-white" type="button">
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {!data ? (
        <EventDetailSkeleton />
      ) : (
        <div className="flex min-h-0 gap-4 overflow-hidden">
          <section className="min-w-0 flex-1 overflow-y-auto pr-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative h-[250px]">
                <Image src={event!.image} alt={event!.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h1 className="text-3xl font-medium text-slate-800">{event!.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{event!.university}</p>

                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-700">
                  <MetaRow icon={<CalendarClock size={18} />} label="Date & Time" value={`${event!.date} - ${event!.time}`} />
                  <MetaRow icon={<MapPin size={18} />} label="Location" value={event!.location} />
                  <MetaRow icon={<Calendar size={18} />} label="Registration Deadline" value={event!.date} />
                  <MetaRow icon={<Users size={18} />} label="Available seats" value={event!.seats} />
                </div>

                <Section title="Overview">
                  <OverviewBlock
                    text={data.overview}
                    expanded={overviewExpanded}
                    onToggle={() => setOverviewExpanded((prev) => !prev)}
                  />
                </Section>

                <Section title="Eligibility">
                  <div className="flex flex-wrap gap-2">
                    {data.eligibility.map((item) => (
                      <span key={item} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </Section>

                <Section title="Outcomes & Benefits">
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => outcomesScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll outcomes left"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => outcomesScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll outcomes right"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div ref={outcomesScrollRef} className="flex gap-3 overflow-x-auto pb-2">
                    {data.outcomes.map((item) => (
                      <div key={item} className="min-w-[260px] rounded-xl border border-[#bfdcff] bg-[#f7fbff] p-3 text-sm text-[#2d5c9b]">
                        {item}
                      </div>
                    ))}
                  </div>
                  {data.outcomes.length > 0 ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowOutcomesDialog(true)}
                        className="text-sm font-medium text-[#4A90E2] hover:text-blue-700"
                      >
                        Show more
                      </button>
                    </div>
                  ) : null}
                </Section>

                <Section title="Agenda">
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-white">
                    {data.agenda.map((row) => (
                      <div key={`${row.time}-${row.topic}`} className="grid grid-cols-[92px_1fr] gap-3 border-b border-slate-100 p-3 last:border-b-0">
                        <div className="inline-flex h-7 w-[84px] items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                          {row.time}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{row.topic}</p>
                          <p className="text-xs text-slate-500">{row.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Speakers">
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => speakersScrollRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll speakers left"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => speakersScrollRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll speakers right"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div ref={speakersScrollRef} className="flex gap-8 overflow-x-auto pb-2">
                    {data.speakers.map((speaker) => (
                      <div key={speaker.id} className="min-w-[300px] max-w-[520px] py-2">
                        <div className="flex items-center gap-4">
                          <Image src={speaker.avatar} alt={speaker.name} width={36} height={36} className="rounded-full" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{speaker.name}</p>
                            <p className="text-sm text-slate-600">{speaker.role}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-5 text-slate-600">
                          {speaker.bio ?? "A senior academic specializing in computer science research and education, with expertise in areas such as artificial intelligence."}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Organizer">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/40 px-6 py-5">
                    <div className="flex items-center gap-5">
                      <Image src={data.organizer.avatar} alt={data.organizer.name} width={96} height={96} className="rounded-full" />
                      <div>
                        <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
                          {data.organizer.name}
                          {data.organizer.verified ? <VerifiedBadgeImage size={24} /> : null}
                        </p>
                        <div className="mt-3 flex items-center text-slate-700">
                          <StatItem label="Followers" value={`${data.organizer.followers}`} />
                          <Divider />
                          <StatItem label="Events" value={`${data.organizer.events}`} />
                          <Divider />
                          <StatItem label="Hosting" value={`${data.organizer.hostingYears} Years`} />
                          <Divider />
                          <StatItem label="Credential Issued" value={`${data.organizer.events}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="h-10 min-w-[120px] rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.06)]" type="button">
                        Contact
                      </button>
                      <button className="h-10 min-w-[120px] rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(15,23,42,0.12)]" type="button">
                        Follow
                      </button>
                    </div>
                  </div>
                </Section>

                <Section title="Location">
                  <p className="text-sm font-semibold text-slate-700">{data.venue.name}</p>
                  <p className="text-sm text-slate-500">{data.venue.address}</p>
                  <div className="relative mt-3 h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image src="/app/assets/maps/bangkok-map.svg" alt="Bangkok map" fill className="object-cover" />
                  </div>
                </Section>

                <Section title="Gallery">
                  {galleryImages.length > 0 ? (
                    <>
                      <div className="mb-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => galleryScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                          aria-label="Scroll gallery left"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                          aria-label="Scroll gallery right"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div ref={galleryScrollRef} className="flex gap-2 overflow-x-auto pb-2">
                        {galleryImages.map((img, index) => (
                          <div key={`${img}-${index}`} className="relative h-[138px] min-w-[184px] overflow-hidden rounded-lg border border-slate-200">
                            <Image src={img} alt="Gallery" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No gallery images provided by organizer yet.
                    </div>
                  )}
                </Section>

                <Section title="Recommended Experiences">
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => recommendedScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll recommended left"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => recommendedScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                      aria-label="Scroll recommended right"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div ref={recommendedScrollRef} className="flex gap-4 overflow-x-auto pb-2">
                    {recommendedBySameType.map((item) => (
                      <RecommendedEventCard
                        key={item.id}
                        card={item}
                        onToggleBookmark={toggleBookmarkById}
                      />
                    ))}
                    {recommendedBySameType.length === 0 ? (
                      <p className="py-6 text-sm text-slate-500">No recommended experiences with the same tag yet.</p>
                    ) : null}
                  </div>
                </Section>
              </div>
            </div>
          </section>

          <aside className="w-[300px] shrink-0 overflow-y-auto">
            <div className="sticky top-0 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                {isHistoryMode ? (
                  <>
                    <div className="rounded-xl border border-slate-200 p-3 text-center">
                      <p className="text-lg font-semibold leading-tight text-slate-800">Event Completed</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {event!.date} {event!.time !== "Time to be announced" ? event!.time : ""}
                      </p>
                    </div>
                    {!isClaimed ? (
                      <button
                        className="mt-3 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                        type="button"
                        onClick={openClaimDialog}
                      >
                        Claim Credentials
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-center">{isRegisterMode ? "Start in" : "Time Remaining"}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                        <MiniStat label="Days" value="48" />
                        <MiniStat label="Hours" value="21" />
                        <MiniStat label="Minutes" value="21" />
                      </div>
                    </div>
                    <div>
                      <p className="mt-3 text-center text-sm text-slate-500">
                        {event!.date} {event!.time !== "Time to be announced" ? event!.time : ""}
                      </p>
                    </div>
                    {!isRegisterMode ? (
                      <div className="mt-3 rounded-xl border border-slate-200 p-3 text-center">
                        <p className="text-3xl font-semibold text-slate-800">{event!.price}</p>
                        <p className="text-xs text-slate-500">15 seats left</p>
                      </div>
                    ) : null}

                    <button
                      className="mt-3 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                      type="button"
                      onClick={() => {
                        if (!event) {
                          return;
                        }
                        if (isRegisterMode) {
                          return;
                        }
                        setRegisteredIds((prev) => (prev.includes(event.id) ? prev : [...prev, event.id]));
                      }}
                    >
                      {isRegisterMode ? "QR Code" : "Register Now"}
                    </button>
                  </>
                )}
                <button
                  className={`mt-3 h-11 w-full rounded-xl border text-sm font-semibold ${
                    isBookmarked ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700"
                  }`}
                  type="button"
                  onClick={() => event && toggleBookmarkById(event.id)}
                >
                  <Bookmark size={18} className="mr-1 inline" />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
                {!isHistoryMode ? (
                  <button className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700" type="button">
                    <Calendar size={18} className="mr-1 inline" />Google Calendar
                  </button>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    Credentials
                    <ChevronRight size={16} className="text-slate-400" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
                    <Bookmark size={12} />
                    {credentialCount > 0 ? `${safeCredentialIndex + 1}/${credentialCount}` : "0/0"}
                  </span>
                </div>
                {activeCredential ? (
                  <>
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="relative h-[86px] overflow-hidden rounded-xl bg-[#d7e3f2]">
                        <span className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-[#4A90E2]">
                          {activeCredential.type}
                        </span>
                      </div>
                      <div className="relative -mt-9 mb-2 ml-2 flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-white bg-[#8fb1d5]">
                        <Image src="/assets/icons/cone.svg" alt="Cone" width={50} height={50} className="h-[50px] w-[50px]" />
                      </div>
                      <p className="text-[16px] font-semibold leading-8 text-slate-800">{activeCredential.title}</p>
                      <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-slate-500">
                        {activeCredential.description}
                      </p>
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-400">Organization</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[18px] font-semibold text-slate-800">
                          {activeCredential.organization}
                          {activeCredential.verified ? <VerifiedBadgeImage size={18} /> : null}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-[#4A90E2]">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                        <FileText size={14} />
                        Requirement
                      </p>
                      <p className="mt-1 text-sm">{activeCredential.requirement}</p>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No credential available for this event.
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCredentialIndex((prev) => Math.max(0, prev - 1))}
                    disabled={safeCredentialIndex <= 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.max(credentialCount, 1) }).map((_, index) => (
                      <span
                        key={`credential-dot-${index}`}
                        className={`rounded-full ${
                          index === safeCredentialIndex ? "h-1.5 w-5 bg-blue-500" : "h-1.5 w-1.5 bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCredentialIndex((prev) =>
                        Math.min(Math.max(credentialCount - 1, 0), prev + 1),
                      )
                    }
                    disabled={safeCredentialIndex >= credentialCount - 1 || credentialCount === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showOutcomesDialog && data ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-3xl font-semibold leading-none text-slate-800">
                Outcomes &amp; Benefits
              </h3>
              <button
                type="button"
                onClick={() => setShowOutcomesDialog(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto bg-[#eaf4ff] px-4 py-4">
              <div className="space-y-2.5">
                {data.outcomes.map((item, index) => (
                  <div key={`${index}-${item}`} className="rounded-xl border border-[#bfdcff] bg-[#f7fbff] p-2.5">
                    <p className="text-sm leading-6 text-[#2d5c9b]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowOutcomesDialog(false)}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ClaimDialog
        open={showClaimDialog}
        forms={claimForms}
        activeIndex={claimActiveIndex}
        tab={claimDialogTab}
        isSubmitting={isClaimSubmitting}
        onClose={closeClaimDialog}
        onPrev={() => setClaimActiveIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setClaimActiveIndex((prev) =>
            Math.min(Math.max(claimForms.length - 1, 0), prev + 1),
          )
        }
        onTabChange={setClaimDialogTab}
        onKeyLearningChange={(value) =>
          setClaimForms((prev) =>
            prev.map((form, index) =>
              index === claimActiveIndex ? { ...form, keyLearning: value } : form,
            ),
          )
        }
        onPrimaryAction={handleClaimPrimaryAction}
      />
      <ClaimSuccessModal
        open={showClaimSuccessModal}
        onClose={() => setShowClaimSuccessModal(false)}
      />
      <ClaimToastBanner toast={claimToast} onClose={() => setClaimToast(null)} />
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="flex min-h-0 gap-4 overflow-hidden animate-pulse">
      <section className="min-w-0 flex-1 overflow-y-auto pr-1">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Skeleton className="h-[250px] rounded-none" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
              <Skeleton className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
              <Skeleton className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
              <Skeleton className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <Skeleton className="h-0.5 w-full rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-10/12 rounded" />
            </div>
            <Skeleton className="h-0.5 w-full rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <aside className="w-[300px] shrink-0 overflow-y-auto">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </aside>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#4A90E2]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">{label}</p>
        <p className="text-sm leading-6 text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function OverviewBlock({
  text,
  expanded,
  onToggle,
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) {
      return;
    }

    const checkOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, expanded]);

  return (
    <div>
      <div className="relative">
        <p ref={textRef} className={`${expanded ? "" : "line-clamp-6"} text-sm leading-8 text-slate-600`}>{text}</p>
        {!expanded && canExpand ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/85 to-transparent" />
        ) : null}
      </div>
      {canExpand ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 text-sm font-medium text-[#4A90E2] hover:text-blue-700"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 border-t border-slate-200 pt-5">
      <h2 className="mb-3 text-2xl font-medium text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function RecommendedEventCard({
  card,
  onToggleBookmark,
}: {
  card: EventDetail["event"];
  onToggleBookmark: (eventId: string) => void;
}) {
  return (
    <Link href={`/experience-hub/${card.id}`} className="block min-w-[280px]">
      <article className="group flex h-[362px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#d8e0ea] bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
        <div
          className={`relative h-[136px] shrink-0 bg-gradient-to-br ${card.theme}`}
          style={{
            backgroundImage: `linear-gradient(145deg, rgba(15,23,42,0.15), rgba(15,23,42,0.15)), url('${card.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {card.sponsored ? (
            <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/35 bg-white/22 px-3 py-0.5 text-[10px] font-medium tracking-[0.01em] text-white shadow-[0_4px_18px_rgba(15,23,42,0.25)] backdrop-blur-md">
              Sponsored
            </span>
          ) : null}
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            {[Medal, Trophy, CircleStar, FileBadge2].map((Icon, index) => (
              <span
                key={index}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/65 bg-white/8 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)] backdrop-blur-md"
              >
                <Icon size={14} className="drop-shadow-[0_1px_1px_rgba(15,23,42,0.35)]" />
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col px-3.5 py-3">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleBookmark(card.id);
            }}
            aria-label={card.isBookmarked ? "Remove bookmark" : "Bookmark card"}
            className={`absolute right-3 top-[10px] z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow ${
              card.isBookmarked ? "border-blue-200 text-[#4A90E2]" : "border-slate-100 text-slate-300"
            }`}
          >
            <Bookmark size={15} />
          </button>

          <div className="flex h-[62px] shrink-0 flex-col">
            <div className="flex flex-1 flex-col justify-center pr-10">
              <p className="line-clamp-2 text-sm font-medium leading-[1.32] text-slate-800">{card.title}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{card.university}</p>
            </div>
            <div className="h-px w-full bg-[#edf1f5]" />
          </div>

          <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-500">
            <li className="flex items-center gap-1.5">
              <MetaIconSmall><Calendar size={10} /></MetaIconSmall>{card.date}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIconSmall><Clock3 size={10} /></MetaIconSmall>{card.time}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIconSmall><MapPin size={10} /></MetaIconSmall>{card.location}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIconSmall><Users size={10} /></MetaIconSmall>{card.seats}
            </li>
          </ul>

          <p className={`mt-auto pt-3 text-[14px] font-semibold ${card.price.includes("Free") ? "text-emerald-600" : "text-cyan-700"}`}>{card.price}</p>
        </div>
      </article>
    </Link>
  );
}

function MetaIconSmall({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#e7edf4] bg-white text-[#4A90E2]">
      {children}
    </span>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <p className="text-lg font-semibold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-8 first:pl-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-none text-slate-800">{value}</p>
    </div>
  );
}

function Divider() {
  return <span className="h-10 w-px bg-slate-200" />;
}
