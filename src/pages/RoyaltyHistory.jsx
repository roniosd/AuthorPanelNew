import { useState } from "react";
import { BadgeCheck, Coins, HandCoins, History, SlidersHorizontal, Wallet } from "lucide-react";
import { useHistory } from "@/lib/queries";
import { fmtDate, taka } from "@/lib/format";
import DateFilter, { rangeOf } from "@/components/DateFilter";
import { Card, Empty, ErrorBox, PageTitle, Pagination, Spinner, Tabs, cn } from "@/components/ui";

const TYPES = {
  royalty: { label: "Royalty", icon: Coins, tone: "bg-emerald-50 text-emerald-600" },
  advance: { label: "Advance", icon: HandCoins, tone: "bg-amber-50 text-amber-600" },
  adjustment: { label: "Adjustment", icon: SlidersHorizontal, tone: "bg-violet-50 text-violet-600" },
  withdraw: { label: "Withdraw", icon: Wallet, tone: "bg-brand-50 text-brand-600" },
  recovery: { label: "Recovery", icon: BadgeCheck, tone: "bg-teal-50 text-teal-600" },
};

// Royalty History: all money movements with the running balance (negative = advance still running).
export default function RoyaltyHistory() {
  const [type, setType] = useState("all");
  const [filter, setFilter] = useState({ preset: "all" });
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useHistory({ type: type === "all" ? undefined : type, ...rangeOf(filter), page, limit: 20 });
  const f = data?.finance;

  return (
    <>
      <PageTitle title="Royalty History" sub="Royalty, advance, adjustment and withdraw — with your balance after each one." />
      {f && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total earned", f.earned, "text-brand-700"],
            ["Received", f.received, "text-emerald-700"],
            ["On hold (requested)", f.pending, "text-amber-700"],
            ["Available", f.available, f.available < 0 ? "text-rose-600" : "text-ink"],
          ].map(([label, value, tone]) => (
            <Card key={label} className="p-4"><p className="text-xs text-slate-500">{label}</p><p className={cn("mt-1 text-2xl font-extrabold", tone)}>{taka(value)}</p></Card>
          ))}
        </div>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <Tabs value={type} onChange={(value) => { setType(value); setPage(1); }} items={[{ value: "all", label: "All" }, ...Object.entries(TYPES).map(([value, item]) => ({ value, label: item.label, count: data?.counts?.[value] }))]} />
          <DateFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} />
        </div>
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !data.rows.length ? <Empty icon={History} title="Nothing to show" /> : (
          <div className={cn("divide-y divide-slate-100", isFetching && "opacity-60")}>
            {data.rows.map((row) => {
              const meta = TYPES[row.type];
              return (
                <div key={`${row.type}-${row._id}`} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", meta.tone)}><meta.icon className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="bn truncate text-sm font-bold">{row.title}</p>
                    <p className="truncate text-xs text-slate-500">{fmtDate(row.date)} · {row.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-extrabold", row.amount > 0 ? "text-emerald-600" : row.amount < 0 ? "text-rose-600" : "text-slate-400")}>{row.amount > 0 ? "+" : ""}{taka(row.amount)}</p>
                    <p className="text-[11px] text-slate-400">Balance {taka(row.balance)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {data && <Pagination page={page} total={data.total} limit={data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
