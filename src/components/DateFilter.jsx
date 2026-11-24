import { CalendarDays } from "lucide-react";
import { cn } from "@/components/ui";

const day = 86400000;
const iso = (date) => date.toISOString().slice(0, 10);
const startOf = (unit) => {
  const now = new Date();
  return unit === "month" ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
};

// Preset sets used by the designs.
export const SALES_PRESETS = [["today", "Today"], ["7", "7 days"], ["30", "30 days"], ["365", "12 months"], ["all", "All time"]];
export const HISTORY_PRESETS = [["month", "This month"], ["90", "Last 3 months"], ["year", "This year"], ["all", "All time"]];
export const WITHDRAW_PRESETS = [["month", "This month"], ["year", "This year"], ["all", "All time"]];

// Turns a preset into { from, to } query params (to = end of day).
export const rangeOf = ({ preset, from, to }) => {
  if (preset === "custom") return { from: from || undefined, to: to ? `${to}T23:59:59` : undefined };
  if (preset === "all") return {};
  if (preset === "today") return { from: iso(new Date()) };
  if (preset === "month" || preset === "year") return { from: iso(startOf(preset)) };
  return { from: iso(new Date(Date.now() - (Number(preset) - 1) * day)) };
};

export default function DateFilter({ value, onChange, presets = SALES_PRESETS }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1 sm:flex-wrap">
        {[...presets, ["custom", "Custom"]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => onChange({ ...value, preset: key })} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition sm:py-1.5", value.preset === key ? "bg-white font-semibold text-brand-700 shadow-sm" : "text-slate-500 hover:text-ink")}>
            {key === "custom" && <CalendarDays className="size-4" />}
            {label}
          </button>
        ))}
      </div>
      {value.preset === "custom" && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input type="date" className="input h-10 min-w-0 flex-1 px-3 text-sm sm:w-40 sm:flex-none sm:px-4" value={value.from || ""} onChange={(event) => onChange({ ...value, from: event.target.value })} />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" className="input h-10 min-w-0 flex-1 px-3 text-sm sm:w-40 sm:flex-none sm:px-4" value={value.to || ""} onChange={(event) => onChange({ ...value, to: event.target.value })} />
        </div>
      )}
    </div>
  );
}

// Readable period for printed statements.
export const periodText = (value) => {
  const range = rangeOf(value);
  const show = (date) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return range.from ? `${show(range.from)} – ${show(range.to || new Date())}` : "All time";
};
