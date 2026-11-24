import { FieldInput, Tabs } from "@/components/ui";

const day = 86400000;
const iso = (date) => date.toISOString().slice(0, 10);
export const PRESETS = [
  { value: "all", label: "All" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "365", label: "12 months" },
  { value: "custom", label: "Custom" },
];

// Turns a preset into { from, to } query params (to = end of day).
export const rangeOf = ({ preset, from, to }) => {
  if (preset === "custom") return { from: from || undefined, to: to ? `${to}T23:59:59` : undefined };
  if (preset === "all") return {};
  return { from: iso(new Date(Date.now() - (Number(preset) - 1) * day)) };
};

export default function DateFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={value.preset} onChange={(preset) => onChange({ ...value, preset })} items={PRESETS} />
      {value.preset === "custom" && (
        <div className="flex items-center gap-2">
          <FieldInput type="date" className="h-9 w-40" value={value.from || ""} onChange={(event) => onChange({ ...value, from: event.target.value })} />
          <span className="text-xs text-slate-400">to</span>
          <FieldInput type="date" className="h-9 w-40" value={value.to || ""} onChange={(event) => onChange({ ...value, to: event.target.value })} />
        </div>
      )}
    </div>
  );
}
