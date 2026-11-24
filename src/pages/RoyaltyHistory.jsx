import { useState } from "react";
import { toast } from "@/lib/toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftRight, Check, Download, FileText, History, ReceiptText, Wallet, WalletCards, XCircle } from "lucide-react";
import { useHistory } from "@/lib/queries";
import { downloadCsv, getAll } from "@/lib/api";
import { dateShort, taka, timeOnly } from "@/lib/format";
import DateFilter, { HISTORY_PRESETS, periodText, rangeOf } from "@/components/DateFilter";
import PrintStatement from "@/components/PrintStatement";
import { Button, Card, Empty, ErrorBox, PageTitle, Pagination, Spinner, cn, Est } from "@/components/ui";

const TYPES = {
  royalty: { pill: "Royalty", icon: ReceiptText, tone: "bg-emerald-50 text-emerald-600", pillTone: "bg-emerald-50 text-emerald-700", label: "Earned" },
  cancelled: { pill: "Order cancelled", icon: XCircle, tone: "bg-rose-50 text-rose-500", pillTone: "bg-rose-50 text-rose-600", label: "Not added" },
  advance: { pill: "Advance", icon: WalletCards, tone: "bg-amber-50 text-amber-600", pillTone: "bg-amber-50 text-amber-700", label: "Received", border: "border-l-amber-400 bg-amber-50/30" },
  withdraw: { pill: "Withdraw", icon: Wallet, tone: "bg-brand-50 text-brand-600", pillTone: "bg-brand-50 text-brand-700", label: "Received", border: "border-l-brand-500 bg-brand-50/30" },
  adjustment: { pill: "Adjustment", icon: ArrowLeftRight, tone: "bg-violet-50 text-violet-600", pillTone: "bg-violet-50 text-violet-700", border: "border-l-violet-400 bg-violet-50/30" },
  recovery: { pill: "Recovered", icon: Check, tone: "bg-slate-100 text-slate-500", pillTone: "bg-slate-100 text-slate-600" },
};

const Big = ({ className, label, value, sub, light }) => (
  <div className={cn("relative overflow-hidden rounded-2xl p-5", className)}>
    {!light && <span className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10" />}
    <p className={cn("relative text-sm font-semibold", light ? "text-amber-700" : "text-white/90")}>{label}</p>
    <p className={cn("display relative mt-1 text-3xl font-extrabold", light ? "text-orange-600" : "text-white")}>{value}</p>
    <p className={cn("relative mt-1 text-xs", light ? "text-slate-500" : "text-white/80")}>{sub}</p>
  </div>
);

// Royalty History (design 06): every money movement with the balance after it.
export default function RoyaltyHistory() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [type, setType] = useState(params.get("type") || "all");
  const [filter, setFilter] = useState({ preset: "all" });
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const query = { type: type === "all" ? undefined : type, ...rangeOf(filter) };
  const { data, isLoading, error, isFetching } = useHistory({ ...query, page, limit: 30 });
  const f = data?.finance;
  const c = data?.cards;

  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = await getAll("/author-panel/history", query);
      downloadCsv("royalty-history", [[(row) => dateShort(row.date), "Date"], [(row) => TYPES[row.type]?.pill, "Type"], ["title", "Title"], ["sub", "Details"], [(row) => (row.type === "cancelled" ? 0 : row.amount), "Amount"], ["balance", "Balance"]], rows);
      toast.success("Excel file downloaded.");
    } catch (err) {
      toast.error(err);
    } finally {
      setExporting(false);
    }
  };
  const open = (row) => {
    if (row.type === "advance") navigate(`/receipt/advance/${row._id}`);
    else if (row.type === "withdraw") navigate(`/receipt/withdraw/${row._id}`);
    else if (row.bookId) navigate(`/books/${row.bookId}`);
  };

  return (
    <>
      <PageTitle title="Royalty History" right={<div className="no-print flex flex-wrap gap-2"><Button variant="outline" loading={exporting} onClick={exportExcel}><Download className="size-4" /> Excel</Button><PrintStatement label="Download statement" title="Royalty Statement" url="/author-panel/history" params={query} period={periodText(filter)} columns={[["Date", (row) => dateShort(row.date)], ["Type", (row) => TYPES[row.type]?.pill || row.type], ["Details", (row) => `${row.title} — ${row.sub || ""}`], ["Amount", (row) => (row.type === "cancelled" ? "Not added" : taka(row.amount)), true], ["Balance", (row) => taka(row.balance), true]]} /></div>} />
      {f && c && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Big light className="border-2 border-amber-200 bg-white" label="Available balance" value={taka(f.available)} sub={f.advanceRemaining > 0 ? `Advance ${taka(f.advanceRemaining)} still to be earned back` : `${taka(f.pending)} on hold for withdraw`} />
          <Big className="bg-linear-to-br from-indigo-500 to-violet-700" label="Total received" value={taka(f.received)} sub={`Advance ${taka(c.advance)} · Withdrawn ${taka(c.withdrawn)} · Deducted ${taka(f.deductAdjustment)}`} />
          <Big className="bg-linear-to-br from-emerald-500 to-green-700" label="Total earned royalty" value={taka(f.earned)} sub={`Sales ${taka(c.salesRoyalty)} · Added ${taka(f.addAdjustment)}`} />
          <Big className="bg-linear-to-br from-amber-500 to-orange-600" label="Total advance" value={taka(c.advance)} sub={`${c.advanceCount} ${c.advanceCount === 1 ? "advance" : "advances"} · ${taka(f.advanceRemaining)} remaining`} />
          <Big className="bg-linear-to-br from-cyan-600 to-teal-700" label="Total withdrawn" value={taka(c.withdrawn)} sub={`${c.withdrawCount} ${c.withdrawCount === 1 ? "withdraw" : "withdraws"} paid`} />
        </div>
      )}
      <Card className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="no-scrollbar -mx-3 flex max-w-[calc(100%+1.5rem)] gap-2 overflow-x-auto px-3 sm:mx-0 sm:max-w-full sm:flex-wrap sm:px-0">
          {[["all", "All"], ["royalty", "Royalty"], ["advance", "Advance"], ["withdraw", "Withdraw"], ["adjustment", "Adjustment"]].map(([key, label]) => (
            <button key={key} onClick={() => { setType(key); setPage(1); }} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold whitespace-nowrap sm:py-1.5", type === key ? "border-navy bg-navy text-white" : "border-slate-200 text-slate-600")}>
              {label}{key === "all" && <span className="rounded-full bg-white/20 px-1.5 text-xs">{data?.counts?.all ?? 0}</span>}
            </button>
          ))}
        </div>
        <DateFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} presets={HISTORY_PRESETS} />
      </Card>
      <Card className="overflow-hidden">
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !data.rows.length ? <Empty icon={History} title="Nothing to show" /> : (
          <div className={cn("divide-y divide-slate-100", isFetching && "opacity-60")}>
            {data.rows.map((row) => {
              const meta = TYPES[row.type] || TYPES.recovery;
              const muted = row.type === "cancelled";
              const label = row.type === "adjustment" ? (row.direction === "add" ? "Added" : "Deducted") : meta.label;
              const amount = row.type === "cancelled" ? row.lost : Math.abs(row.amount);
              const red = row.type === "adjustment" && row.direction !== "add";
              return (
                <button key={`${row.type}-${row._id}`} onClick={() => open(row)} className={cn("grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-l-4 border-l-transparent px-4 py-3.5 text-left hover:bg-slate-50/60 active:bg-slate-50 md:gap-4 md:px-5 md:grid-cols-[auto_1fr_150px_120px_110px_100px]", meta.border, muted && "bg-slate-50/70")}>
                  <span className={cn("grid size-10 place-items-center rounded-xl", meta.tone)}><meta.icon className="size-4" /></span>
                  <div className={cn("min-w-0", muted && "opacity-50")}><p className="bn truncate font-bold">{row.title}</p><p className="truncate text-xs text-slate-500">{row.sub}</p></div>
                  <span className={cn("hidden justify-self-center rounded-full px-3 py-1 text-xs font-semibold md:inline", meta.pillTone)}>{meta.pill}</span>
                  <div className={cn("hidden md:block", muted && "opacity-50")}><p className="text-sm font-bold">{dateShort(row.date)}</p><p className="text-xs text-slate-400">{timeOnly(row.date)}</p></div>
                  <div className="text-right">
                    {row.type === "recovery" ? <p className="text-slate-300">—</p> : <p className={cn("text-lg font-extrabold", muted ? "strike text-slate-400" : red ? "text-rose-600" : row.type === "royalty" || row.direction === "add" ? "text-emerald-600" : row.type === "advance" ? "text-orange-600" : "text-brand-700")}>{taka(amount)}<Est show={row.estimated} /></p>}
                    {label && <p className="text-[11px] text-slate-400">{label}</p>}
                  </div>
                  <div className={cn("hidden text-right md:block", muted && "opacity-50")}><p className="text-[11px] text-slate-400">Balance</p><p className={cn("font-bold", row.balance < 0 ? "text-rose-600" : "text-ink")}>{taka(row.balance)}</p></div>
                </button>
              );
            })}
          </div>
        )}
        {data && <Pagination page={page} total={data.total} limit={data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
