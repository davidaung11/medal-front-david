"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { DashboardEvent, TabKey } from "@/modules/experience/domain/dashboard.types";
import { DateRangePicker, TextInput } from "@/components/ui";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { ClaimDialog, ClaimSuccessModal, ClaimToastBanner } from "./components/claim-dialog";
import { EventCard, RegisterEventCard } from "./components/experience-cards";
import { FilterCheckbox, FilterSection } from "./components/experience-filters";
import { ClaimDialogForm, ClaimToast, EventsState } from "./experience-content.types";
import { buildClaimFormsForEvent, buildPaginationItems, createEmptyState, tabs } from "./experience-content.utils";

const BOOKMARK_STORAGE_KEY = "mv_bookmarked_event_ids";
const UNBOOKMARK_STORAGE_KEY = "mv_unbookmarked_event_ids";
const REGISTERED_STORAGE_KEY = "mv_registered_event_ids";
const CLAIMED_STORAGE_KEY = "mv_claimed_event_ids";

export function ExperienceContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventsState, setEventsState] = useState<EventsState>(createEmptyState);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [unbookmarkedIds, setUnbookmarkedIds] = useState<string[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimDialogTab, setClaimDialogTab] = useState<"credential" | "event">("credential");
  const [claimForms, setClaimForms] = useState<ClaimDialogForm[]>([]);
  const [claimActiveIndex, setClaimActiveIndex] = useState(0);
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimSourceEventId, setClaimSourceEventId] = useState<string>("");
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [claimToast, setClaimToast] = useState<ClaimToast | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const ids = parsed.filter((item: unknown): item is string => typeof item === "string");
      setBookmarkedIds(ids);
    } catch {
      // Ignore invalid localStorage value
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(UNBOOKMARK_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const ids = parsed.filter((item: unknown): item is string => typeof item === "string");
      setUnbookmarkedIds(ids);
    } catch {
      // Ignore invalid localStorage value
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REGISTERED_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const ids = parsed.filter((item: unknown): item is string => typeof item === "string");
      setRegisteredIds(ids);
    } catch {
      // Ignore invalid localStorage value
    }
  }, []);

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
    window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    window.localStorage.setItem(UNBOOKMARK_STORAGE_KEY, JSON.stringify(unbookmarkedIds));
  }, [unbookmarkedIds]);

  useEffect(() => {
    window.localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(registeredIds));
  }, [registeredIds]);

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
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tab: activeTab,
          page: String(page),
          pageSize: String(pageSize),
          search,
          sort: "latest",
          types: selectedTypes.join(","),
          fields: selectedFields.join(","),
          levels: selectedLevels.join(","),
          location,
          bookmarkedIds: bookmarkedIds.join(","),
          unbookmarkedIds: unbookmarkedIds.join(","),
          registeredIds: registeredIds.join(","),
          startDate,
          endDate,
        });

        const response = await fetch(`/app/api/events?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: withBackendAuthHeaders(),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          return;
        }

        const next = payload.data as EventsState;
        setEventsState({
          ...next,
          items: next.items.map((item) =>
            ({
              ...item,
              isBookmarked: (item.isBookmarked && !unbookmarkedIds.includes(item.id)) || bookmarkedIds.includes(item.id),
              isRegistered: item.isRegistered || registeredIds.includes(item.id),
            }),
          ),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, [activeTab, page, pageSize, search, selectedTypes, selectedFields, selectedLevels, location, bookmarkedIds, unbookmarkedIds, registeredIds, startDate, endDate]);

  const activeFilterCount =
    selectedTypes.length + selectedFields.length + selectedLevels.length + (location.trim() ? 1 : 0);

  function toggleSelection(value: string, selected: string[], setSelected: (next: string[]) => void) {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
      setPage(1);
      return;
    }

    setSelected([...selected, value]);
    setPage(1);
  }

  function onChangeTab(tab: TabKey) {
    setActiveTab(tab);
    setPage(1);
  }

  function clearFilters() {
    setSelectedTypes([]);
    setSelectedFields([]);
    setSelectedLevels([]);
    setLocation("");
    setPage(1);
  }

  async function toggleBookmark(eventId: string) {
    const target = eventsState.items.find((item) => item.id === eventId);
    const nextBookmarked = !(target?.isBookmarked ?? bookmarkedIds.includes(eventId));
    const wasBookmarkedByDefault = Boolean(target?.isBookmarked && !bookmarkedIds.includes(eventId));

    setEventsState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === eventId ? { ...item, isBookmarked: nextBookmarked } : item,
      ),
    }));

    setBookmarkedIds((prev) => {
      if (nextBookmarked) {
        if (prev.includes(eventId)) {
          return prev;
        }
        return [...prev, eventId];
      }
      return prev.filter((id) => id !== eventId);
    });

    setUnbookmarkedIds((prev) => {
      if (nextBookmarked) {
        return prev.filter((id) => id !== eventId);
      }
      if (wasBookmarkedByDefault) {
        if (prev.includes(eventId)) {
          return prev;
        }
        return [...prev, eventId];
      }
      return prev.filter((id) => id !== eventId);
    });
  }

  function handleClaimCredential(card: DashboardEvent) {
    const forms = buildClaimFormsForEvent(card);
    setClaimForms(forms);
    setClaimActiveIndex(0);
    setClaimDialogTab("credential");
    setClaimSourceEventId(card.id);
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

  const claimForm = claimForms[claimActiveIndex] ?? null;

  const paginationItems = useMemo(
    () => buildPaginationItems(eventsState.page, eventsState.totalPages),
    [eventsState.page, eventsState.totalPages],
  );

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="h-11 w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Search Event"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(value) => {
              setStartDate(value);
              setPage(1);
            }}
            onEndDateChange={(value) => {
              setEndDate(value);
              setPage(1);
            }}
            onClear={() => setPage(1)}
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-border-brand-solid bg-background-bg-brand-solid px-4 text-body-md-medium text-white transition duration-300 hover:bg-background-bg-brand-solid-hover hover:shadow-lg active:scale-95"
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter size={16} />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs text-blue-700">{activeFilterCount}</span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="mt-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto text-sm text-slate-400 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChangeTab(tab.key)}
                className={
                  isActive
                    ? "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-text-brand-primary"
                    : "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-text-tertiary hover:text-text-brand-primary"
                }
                type="button"
              >
                <span>{tab.label}</span>
                <span
                  className={`absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-text-brand-primary ${isActive ? "block" : "hidden"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex min-h-[520px] flex-col gap-3 lg:min-h-[560px] lg:flex-row">
        <section
          className={`order-2 grid min-h-full min-w-0 flex-1 content-start auto-rows-max gap-3 transition-all duration-300 lg:order-1 ${
            showFilters
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          {loading
            ? Array.from({ length: showFilters ? 8 : 10 }).map((_, index) => (
                <article
                  key={`experience-skeleton-${index}`}
                  className="h-[362px] overflow-hidden rounded-[22px] border border-[#d8e0ea] bg-white p-3"
                >
                  <div className="h-[136px] animate-pulse rounded-xl bg-slate-200" />
                  <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </article>
              ))
            : eventsState.items.map((card) =>
                activeTab === "history" ? (
                  <RegisterEventCard
                    key={card.id}
                    card={card}
                    isClaimed={claimedIds.includes(card.id)}
                    onToggleBookmark={toggleBookmark}
                    onClaim={handleClaimCredential}
                  />
                ) : (
                  <EventCard
                    key={card.id}
                    card={card}
                    onToggleBookmark={toggleBookmark}
                  />
                ),
              )}

          {!loading && eventsState.items.length === 0 ? (
            <div className="col-span-full flex min-h-[340px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
              No events found for this filter.
            </div>
          ) : null}
        </section>

        {showFilters ? (
          <aside className="order-1 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:order-2 lg:w-[285px]">
            <div className="h-full overflow-y-auto p-3">
              <FilterSection title="Type" count={selectedTypes.length}>
                {eventsState.filterOptions.types.map((type) => (
                  <FilterCheckbox
                    key={type}
                    label={type}
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Fields" count={selectedFields.length}>
                {eventsState.filterOptions.fields.map((field) => (
                  <FilterCheckbox
                    key={field}
                    label={field}
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleSelection(field, selectedFields, setSelectedFields)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Level" count={selectedLevels.length}>
                {eventsState.filterOptions.levels.map((level) => (
                  <FilterCheckbox
                    key={level}
                    label={level}
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleSelection(level, selectedLevels, setSelectedLevels)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Location" count={location.trim() ? 1 : 0}>
                <TextInput
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Bangkok, Thailand"
                  className="h-10 rounded-lg text-sm focus:border-[#4A90E2] focus:ring-0"
                />
              </FilterSection>

              <button
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-[#4A90E2] hover:bg-[#EEF5FC] hover:text-[#3C7ACB]"
                type="button"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="mt-3 grid grid-cols-1 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-slate-500 sm:grid-cols-[1fr_auto_1fr]">
        <span className="text-center text-sm sm:text-left">
          Page {eventsState.page} of {eventsState.totalPages}
        </span>
        <div className="flex items-center justify-center gap-2 text-sm sm:justify-self-center">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={eventsState.page <= 1}
          >
            <ChevronLeft size={16} />
          </button>

          {paginationItems.map((item, index) => {
            if (item === "...") {
              return <span key={`ellipsis-${index}`}>...</span>;
            }

            const isActive = item === eventsState.page;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-8 w-8 rounded-full transition ${
                  isActive ? "bg-[#EEF5FC] text-[#3C7ACB]" : "hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40"
            onClick={() => setPage((prev) => Math.min(eventsState.totalPages, prev + 1))}
            disabled={eventsState.page >= eventsState.totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="hidden sm:block" />
      </footer>

      <ClaimDialog
        open={showClaimDialog}
        forms={claimForms}
        activeIndex={claimActiveIndex}
        tab={claimDialogTab}
        isSubmitting={isClaimSubmitting}
        onClose={closeClaimDialog}
        onPrev={() => setClaimActiveIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setClaimActiveIndex((prev) => Math.min(claimForms.length - 1, prev + 1))}
        onTabChange={setClaimDialogTab}
        onPrimaryAction={handleClaimPrimaryAction}
        onKeyLearningChange={(value) =>
          setClaimForms((prev) =>
            prev.map((item, index) =>
              index === claimActiveIndex ? { ...item, keyLearning: value } : item,
            ),
          )
        }
      />

      <ClaimSuccessModal
        open={showClaimSuccessModal}
        onClose={() => setShowClaimSuccessModal(false)}
      />

      <ClaimToastBanner toast={claimToast} onClose={() => setClaimToast(null)} />
    </>
  );
}
