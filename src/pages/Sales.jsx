import { useState } from "react";
import { BookOpen, Coins, FileText, ReceiptText, ShoppingBag } from "lucide-react";
import { useBooks, useSales } from "@/lib/queries";
import { bookName, fmtDateTime, num, ordinal, taka } from "@/lib/format";
import DateFilter, { rangeOf } from "@/components/DateFilter";
import { Badge, Card, Cover, Empty, ErrorBox, PageTitle, Pagination, Select, Spinner } from "@/components/ui";

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
    <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
    <div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-extrabold">{value}</p></div>
  </div>
);

// Sales History (= Invoice History): every invoice line of the author's books.
export default function Sales() {
  const [filter, setFilter] = useState({ preset: "all" });
  const [bookId, setBookId] = useState("");
  const [page, setPage] = useState(1);
  const books = useBooks();
  const { data, isLoading, error, isFetching } = useSales({ ...rangeOf(filter), bookId: bookId || undefined, page, limit: 20 });
  const change = (fn) => (value) => { fn(value); setPage(1); };

  return (
    <>
      <PageTitle title="Sales History" sub="Every sale of your books with the royalty you earned." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FileText} label="Invoices" value={num(data?.summary.invoices)} tone="bg-brand-50 text-brand-600" />
        <Stat icon={BookOpen} label="Copies sold" value={num(data?.summary.copies)} tone="bg-violet-50 text-violet-600" />
        <Stat icon={ShoppingBag} label="Sales value" value={taka(data?.summary.sales)} tone="bg-amber-50 text-amber-600" />
        <Stat icon={Coins} label="Your royalty" value={taka(data?.summary.royalty)} tone="bg-emerald-50 text-emerald-600" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <DateFilter value={filter} onChange={change(setFilter)} />
          <Select className="h-9 w-56" value={bookId} onChange={(event) => change(setBookId)(event.target.value)}>
            <option value="">All books</option>
            {(books.data || []).map((book) => <option key={book._id} value={book._id}>{bookName(book)}</option>)}
          </Select>
        </div>
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !data.rows.length ? <Empty icon={ReceiptText} title="No sales in this period" /> : (
          <div className={`overflow-x-auto ${isFetching ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>{["Date", "Invoice", "Book", "Edition", "Price", "Qty", "Rate", "Royalty"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.rows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDateTime(row.date)}</td>
                    <td className="px-4 py-3 font-semibold">{row.invoiceNo ? `#${row.invoiceNo}` : "—"}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Cover cover={row.book?.cover} className="h-10 w-7" /><span className="bn font-semibold">{bookName(row.book)}</span></div></td>
                    <td className="px-4 py-3">{ordinal(row.edition)}</td>
                    <td className="px-4 py-3">{taka(row.coverPrice)}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">{row.rate ? `${row.rate}%` : "—"}</td>
                    <td className="px-4 py-3">{row.royaltyFree ? <Badge>Royalty free</Badge> : <span className="font-bold text-emerald-700">{taka(row.royalty)}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} total={data.total} limit={data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
