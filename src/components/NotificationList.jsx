import { useLocation, useNavigate } from "react-router-dom";
import { Ban, BookOpen, Check, ChevronRight, Clock3, Pencil, ReceiptText, Wallet, WalletCards } from "lucide-react";
import { timeOnly } from "@/lib/format";
import { cn } from "@/components/ui";

const KIND = {
  sale: [ReceiptText, "bg-brand-50 text-brand-600"],
  cancelled: [Ban, "bg-rose-50 text-rose-500"],
  edition: [BookOpen, "bg-teal-50 text-teal-600"],
  advance: [WalletCards, "bg-amber-50 text-amber-600"],
  adjustment: [Pencil, "bg-amber-50 text-amber-600"],
  requested: [Clock3, "bg-brand-50 text-brand-600"],
  paid: [Wallet, "bg-emerald-50 text-emerald-600"],
  cancel: [Ban, "bg-rose-50 text-rose-500"],
  note: [Check, "bg-violet-50 text-violet-600"],
};

const dayGroup = (date) => {
  const day = new Date(date).toDateString();
  if (day === new Date().toDateString()) return "Today";
  if (day === new Date(Date.now() - 86400000).toDateString()) return "Yesterday";
  return "Earlier";
};

// Grouped feed (Today / Yesterday / Earlier) used by the bell panel and the Notifications page.
export default function NotificationList({ rows = [], onOpen, compact }) {
  const navigate = useNavigate();
  const location = useLocation();
  const groups = ["Today", "Yesterday", "Earlier"].map((label) => [label, rows.filter((row) => dayGroup(row.date) === label)]).filter(([, list]) => list.length);
  const open = (row) => {
    onOpen?.(row);
    // Advance, withdraw and new-edition items open their popup on the current page (design 16).
    if (row.popup) navigate(location.pathname + location.search, { state: { popup: row.popup } });
    else if (row.link?.startsWith("/")) navigate(row.link);
  };

  return groups.map(([label, list]) => (
    <div key={label}>
      <p className={cn("px-5 pt-4 pb-2 text-sm font-semibold text-slate-500", compact && "px-4")}>{label}</p>
      <div className="space-y-1.5 px-3">
        {list.map((row) => {
          const [Icon, tone] = KIND[row.kind] || KIND.note;
          return (
            <button key={row._id} onClick={() => open(row)} className={cn("flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50", !row.isRead && "border border-brand-100 bg-brand-50/50")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="bn text-[15px] leading-snug font-semibold">{row.title}</p>
                {row.sub && <p className={cn("mt-0.5 truncate text-sm", row.kind === "cancelled" ? "text-slate-500" : "text-slate-500")}>{row.sub}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-xs text-slate-400">{label === "Earlier" ? new Date(row.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : timeOnly(row.date)}</span>
                {!row.isRead ? <span className="size-2.5 rounded-full bg-brand-600" /> : row.popup ? <span className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-500"><ChevronRight className="size-3.5" /></span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  ));
}
