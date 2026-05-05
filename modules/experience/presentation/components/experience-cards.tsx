"use client";

import Link from "next/link";
import { Bookmark, Calendar, CircleStar, Clock3, FileBadge2, MapPin, Medal, Trophy, Users } from "lucide-react";
import { DashboardEvent } from "@/modules/experience/domain/dashboard.types";
import { isEventStillActive } from "../experience-content.utils";

function MetaIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#e7edf4] bg-white text-[#4A90E2]">
      {children}
    </span>
  );
}

function CardHero({ card }: { card: DashboardEvent }) {
  return (
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
            key={`${card.id}-${index}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/65 bg-white/8 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)] backdrop-blur-md"
          >
            <Icon size={14} className="drop-shadow-[0_1px_1px_rgba(15,23,42,0.35)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

function CardHeader({
  card,
  onToggleBookmark,
}: {
  card: DashboardEvent;
  onToggleBookmark: (eventId: string) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={card.isBookmarked ? "Remove bookmark" : "Bookmark card"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleBookmark(card.id);
        }}
        className={`absolute right-3 top-[10px] z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow transition duration-300 hover:scale-105 ${
          card.isBookmarked
            ? "border-blue-200 text-blue-600"
            : "border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-600"
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
    </>
  );
}

export function EventCard({
  card,
  onToggleBookmark,
}: {
  card: DashboardEvent;
  onToggleBookmark: (eventId: string) => void;
}) {
  return (
    <Link href={`/experience-hub/${card.id}`} className="block">
      <article className="group flex h-[362px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#d8e0ea] bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
        <CardHero card={card} />
        <div className="relative flex min-h-0 flex-1 flex-col px-3.5 py-3">
          <CardHeader card={card} onToggleBookmark={onToggleBookmark} />
          <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-500">
            <li className="flex items-center gap-1.5">
              <MetaIcon><Calendar size={10} /></MetaIcon>{card.date}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIcon><Clock3 size={10} /></MetaIcon>{card.time}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIcon><MapPin size={10} /></MetaIcon>{card.location}
            </li>
            <li className="flex items-center gap-1.5">
              <MetaIcon><Users size={10} /></MetaIcon>{card.seats}
            </li>
          </ul>
          <p className={`mt-auto pt-3 text-[14px] font-semibold ${card.price.includes("Free") ? "text-emerald-600" : "text-cyan-700"}`}>{card.price}</p>
        </div>
      </article>
    </Link>
  );
}

export function RegisterEventCard({
  card,
  isClaimed,
  onToggleBookmark,
  onClaim,
}: {
  card: DashboardEvent;
  isClaimed: boolean;
  onToggleBookmark: (eventId: string) => void;
  onClaim: (card: DashboardEvent) => void;
}) {
  const isClaimReady = !isEventStillActive(card.date);
  const claimStatus: "pending" | "claimable" | "claimed" = isClaimed
    ? "claimed"
    : isClaimReady
      ? "claimable"
      : "pending";

  return (
    <Link href={`/experience-hub/${card.id}`} className="block">
      <article className="group flex h-[362px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#d8e0ea] bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
        <CardHero card={card} />
        <div className="relative flex min-h-0 flex-1 flex-col px-3.5 py-3">
          <CardHeader card={card} onToggleBookmark={onToggleBookmark} />
          <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-500">
            <li className="flex items-center gap-1.5"><MetaIcon><Calendar size={10} /></MetaIcon>{card.date}</li>
            <li className="flex items-center gap-1.5"><MetaIcon><Clock3 size={10} /></MetaIcon>{card.time}</li>
            <li className="flex items-center gap-1.5"><MetaIcon><MapPin size={10} /></MetaIcon>{card.location}</li>
            <li className="flex items-center gap-1.5">
              <MetaIcon><FileBadge2 size={10} /></MetaIcon>
              Credential Issued
              <span className={claimStatus === "pending" ? "text-slate-400" : "text-text-brand-primary"}>
                {claimStatus === "pending" ? "Pending" : card.date}
              </span>
            </li>
          </ul>

          {claimStatus !== "claimed" ? (
            <button
              type="button"
              disabled={claimStatus !== "claimable"}
              className={`mt-auto h-8 w-full rounded-lg text-sm font-semibold ${
                claimStatus === "claimable"
                  ? "bg-background-bg-brand-solid text-white hover:bg-background-bg-brand-solid-hover"
                  : "bg-slate-100 text-slate-400"
              }`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (claimStatus === "claimable") {
                  onClaim(card);
                }
              }}
            >
              Claim Credentials
            </button>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
