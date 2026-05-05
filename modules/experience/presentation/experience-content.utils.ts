import { DashboardEvent } from "@/modules/experience/domain/dashboard.types";
import { ClaimDialogForm, EventsState, ExperienceTab } from "./experience-content.types";

export const tabs: ExperienceTab[] = [
  { key: "all", label: "All" },
  { key: "bookmark", label: "Bookmarked" },
  { key: "register", label: "Registered" },
  { key: "history", label: "History" },
];

export function createEmptyState(): EventsState {
  return {
    items: [],
    total: 0,
    totalPages: 1,
    page: 1,
    pageSize: 10,
    filterOptions: {
      types: [],
      fields: [],
      levels: [],
    },
  };
}

export function buildPaginationItems(page: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export function isEventStillActive(dateLabel: string) {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) {
    return true;
  }
  const eventDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return eventDay >= today;
}

function toDateInputValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  const offsetDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function buildOrganizationAbbreviation(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildClaimFormsForEvent(card: DashboardEvent): ClaimDialogForm[] {
  const heldDate = toDateInputValue(card.date);
  const participationMode = card.location.toLowerCase().includes("online") ? "Online" : "Onsite";
  const organizationAbbreviation = buildOrganizationAbbreviation(card.university);

  const base: ClaimDialogForm = {
    credentialCode: `MDV${Math.floor(100000 + Math.random() * 900000)}`,
    recipientName: "Daniel Lee",
    credentialName: card.title,
    credentialCategory: "Trophy",
    organizationAbbreviation,
    organizationName: card.university,
    rank: "Participant",
    issueDate: heldDate,
    keyLearning: `Completed ${card.title} and gained practical experience in ${card.field}.`,
    eventName: card.title,
    heldStartDate: heldDate,
    heldEndDate: heldDate,
    venue: card.location,
    activityType: card.type,
    eventField: card.field,
    participationMode,
    competitionLevel: card.level,
    eventDescription: `${card.title} hosted by ${card.university}.`,
  };

  return [
    base,
    {
      ...base,
      credentialCode: `MDV${Math.floor(100000 + Math.random() * 900000)}`,
      credentialName: `${card.title} - Excellence Award`,
      credentialCategory: "Certificate",
      rank: "Top Performer",
      keyLearning: `Demonstrated advanced capability and leadership during ${card.title}.`,
    },
  ];
}
