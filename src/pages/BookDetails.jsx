import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronLeft, ReceiptText, Search, Share2, Coins, XCircle } from "lucide-react";
import { useBook, useSales } from "@/lib/queries";
import { bookCover } from "@/lib/api";
import { bookName, dateShort, fmtDateTime, num, ordinal, taka } from "@/lib/format";
import { Badge, Card, Cover, Empty, ErrorBox, Pagination, Spinner, Tabs, cn, Est } from "@/components/ui";
import { BOOK_STATUS, shareBook } from "@/pages/Books";

const Stat = ({ label, value, green }) => (
  <div className="min-w-36 rounded-2xl bg-white/95 px-4 py-3 text-left shadow-sm">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={cn("text-2xl font-extrabold", green ? "text-emerald-700" : "text-ink")}>{value}</p>
  </div>
);

// Book Details (design 03): hero, edition cards, sales journal for this book.
export default function BookDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useBook(id);
  const [edition, setEdition] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const journal = useSales({ bookId: id, edition: edition === "all" ? undefined : edition, from: date || undefined, to: date ? `${date}T23:59:59` : undefined, page, limit: 30 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;
  const cover = bookCover(data.cover);
  const latest = data.editions[0];

  return (
    <>
      <Link to="/books" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"><ChevronLeft className="size-4" /> Back to My Books</Link>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-navy p-6 text-white md:p-8">
        {cover && <img src={cover} alt="" className="absolute inset-0 size-full scale-125 object-cover opacity-40 blur-2xl" />}
        <div className="absolute inset-0 bg-linear-to-r from-navy via-navy/70 to-brand-700/40" />
        <button onClick={() => shareBook(data, latest?.edition)} className="absolute top-5 right-5 flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur"><Share2 className="size-4" /> Share</button>
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative">
            <Cover cover={data.cover} className="h-40 w-28 border-2 border-white/80 shadow-2xl" />
            {latest && <span className="absolute -bottom-2 left-2 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold">{ordinal(latest.edition)}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="bn text-4xl font-bold">{data.nameInBangla || data.nameInEnglish}</h1>
            {data.nameInBangla && data.nameInEnglish && <p className="mt-1 text-white/70">{data.nameInEnglish}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1"><BookOpen className="size-4" /> {data.editions.length} {data.editions.length === 1 ? "edition" : "editions"}</span>
              {latest && <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Latest: {ordinal(latest.edition)} edition</span>}
              {data.role !== "writer" && <span className="rounded-full bg-amber-400 px-3 py-1 font-semibold text-navy">Translator / Editor · no royalty</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Stat label="Royalty earned" value={<>{taka(data.totals.royalty)}<Est show={data.totals.estimated} /></>} green />
            <Stat label="Copies sold" value={num(data.totals.sold)} />
            <Stat label="Copies left" value={num(data.totals.left)} />
          </div>
        </div>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><BookOpen className="size-5 text-brand-600" /> Editions <span className="text-sm text-brand-600">{data.editions.length}</span></h2>
      {!data.editions.length ? <Card className="mb-8"><Empty title="No editions yet" /></Card> : (
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.editions.map((row) => {
            const copies = row.authorCopy || row.quantity || 0;
            const percent = copies ? Math.min(100, (row.sold / copies) * 100) : 0;
            const status = BOOK_STATUS[row.status] || BOOK_STATUS.new;
            return (
              <div key={`${row.edition}-${row.bookType}`} className="card overflow-hidden">
                <div className="relative flex gap-4 overflow-hidden p-4">
                  {cover && <img src={cover} alt="" className="absolute inset-0 size-full scale-150 object-cover opacity-30 blur-2xl" />}
                  <div className="relative">
                    <Cover cover={data.cover} className="h-20 w-14" />
                    <span className={cn("absolute -bottom-1 left-1 rounded px-1.5 text-[10px] font-bold text-white", row.status === "new" ? "bg-orange-500" : row.status === "selling" ? "bg-brand-600" : "bg-slate-500")}>{ordinal(row.edition)}</span>
                  </div>
                  <div className="relative flex-1">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <p className="mt-1"><span className="text-3xl font-extrabold">{num(row.sold)}</span> <span className="text-sm text-slate-500">/ {num(copies)}</span></p>
                    <p className="text-xs text-slate-500">copies sold</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={cn("h-full rounded-full", row.status === "sold_out" ? "bg-slate-500" : "bg-brand-600")} style={{ width: `${percent}%` }} /></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 px-4 py-3 text-xs">
                  {[["MRP", taka(row.price)], ["Royalty", row.rate != null ? `${row.rate}%` : "—"], ["Left", num(row.left)], ["Added", dateShort(row.addedAt)]].map(([label, value]) => <div key={label}><p className="text-slate-400">{label}</p><p className="font-bold text-ink">{value}</p></div>)}
                </div>
                <div className="flex items-center justify-between bg-emerald-50 px-4 py-2.5 text-sm"><span className="flex items-center gap-1.5 font-semibold text-emerald-700"><Coins className="size-4" /> Royalty earned</span><span className="text-lg font-extrabold text-emerald-700">{taka(row.royaltyFromSales)}<Est show={row.estimated} /></span></div>
              </div>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ReceiptText className="size-5 text-brand-600" /> Sales Journal</h2>
            <Tabs value={edition} onChange={(value) => { setEdition(value); setPage(1); }} items={[{ value: "all", label: "All" }, ...data.editions.map((row) => ({ value: String(row.edition), label: ordinal(row.edition) }))]} />
          </div>
          <div className="relative"><Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" /><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} className="input h-10 w-52 pl-10 text-sm" title="Search by date" /></div>
        </div>
        {journal.isLoading ? <Spinner /> : !journal.data?.rows.length ? <Empty icon={ReceiptText} title="No sales yet" /> : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {journal.data.rows.map((row) => {
              const cancelled = row.status === "cancelled";
              return (
                <div key={`${row.status}-${row._id}`} className={cn("grid items-center gap-3 px-5 py-3.5 md:grid-cols-[1fr_auto_auto]", cancelled && "bg-slate-50/70")}>
                  <div className={cn(cancelled && "opacity-60")}>
                    <p className="font-bold">{fmtDateTime(row.date)}</p>
                    <p className="text-sm text-slate-500">Royalty Generated : <span className={cn("font-semibold text-emerald-700", cancelled && "strike text-rose-600")}>{row.royaltyFree ? "Royalty free" : taka(row.royalty)}</span><Est show={row.estimated} /></p>
                  </div>
                  {cancelled ? <span className="flex items-center gap-1.5 justify-self-start rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"><XCircle className="size-3.5" /> Order cancelled</span> : <span />}
                  <p className={cn("text-sm text-slate-500", cancelled && "opacity-60")}>Edition : <b className="text-ink">{ordinal(row.edition)}</b> &nbsp; Quantity : <b className={cn("text-ink", cancelled && "strike text-rose-600")}>{row.quantity}</b> &nbsp; Royalty : <b className="text-ink">{row.rate}%</b></p>
                </div>
              );
            })}
          </div>
        )}
        {journal.data && <Pagination page={page} total={journal.data.total} limit={journal.data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
