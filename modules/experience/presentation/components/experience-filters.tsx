"use client";

import { ChevronDown } from "lucide-react";

export function FilterSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <button type="button" className="mb-2 flex w-full items-center justify-between text-left text-sm font-semibold text-slate-700">
        <span>{title}</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {count > 0 ? <span className="rounded bg-[#EEF5FC] px-1.5 py-0.5 text-[#3C7ACB]">{count}</span> : null}
          <ChevronDown size={14} />
        </div>
      </button>
      <div className="max-h-[210px] space-y-1 overflow-auto">{children}</div>
    </div>
  );
}

export function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-slate-600 hover:bg-white">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-300" />
      <span>{label}</span>
    </label>
  );
}
