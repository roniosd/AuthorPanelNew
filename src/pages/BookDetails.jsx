import { useParams } from "react-router-dom";
import { BookOpen, Coins, Layers, Package, ReceiptText } from "lucide-react";
import { useBook } from "@/lib/queries";
import { bookName, fmtDate, fmtDateTime, num, ordinal, taka } from "@/lib/format";
import { Badge, Card, CardHead, Cover, Empty, ErrorBox, PageTitle, Spinner } from "@/components/ui";
import { BOOK_STATUS } from "@/pages/Books";

const Stat = ({ icon: Icon, label, value, tone = "text-brand-600 bg-brand-50" }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
    <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
    <div><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-extrabold">{value}</p></div>
  </div>
);

export default function BookDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useBook(id);
  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;
  const writer = data.role === "writer";

  return (
    <>
      <PageTitle title="Book details" back="/books" />
      <Card className="mb-5 flex flex-col gap-6 p-6 sm:flex-row">
        <Cover cover={data.cover} className="h-52 w-36 shrink-0 self-center" />
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="bn text-2xl font-bold">{bookName(data)}</h2>
            {data.nameInEnglish && data.nameInBangla && <p className="text-sm text-slate-500">{data.nameInEnglish}</p>}
          </div>
          <div className="flex flex-wrap gap-2"><Badge tone="blue">{writer ? "Writer" : "Translator / Editor"}</Badge><Badge>{data.editions.length} editions</Badge></div>
          {!writer && <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">Royalty is paid to the writers of this book only.</p>}
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={BookOpen} label="Copies sold" value={num(data.totals.sold)} />
            <Stat icon={Package} label="In stock" value={num(data.totals.left)} tone="text-violet-600 bg-violet-50" />
            <Stat icon={ReceiptText} label="Copies with royalty" value={num(data.totals.copies)} tone="text-amber-600 bg-amber-50" />
            <Stat icon={Coins} label="Your royalty" value={taka(data.totals.royalty)} tone="text-emerald-600 bg-emerald-50" />
          </div>
        </div>
      </Card>

      <Card className="mb-5 overflow-hidden">
        <CardHead icon={Layers} title="Editions" className="p-5" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>{["Edition", "Added", "Type", "Price", "Printed", "Sold", "In stock", "Royalty rate", "Your royalty", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.editions.map((row) => (
                <tr key={`${row.edition}-${row.bookType}`}>
                  <td className="px-4 py-3 font-bold">{ordinal(row.edition)}</td>
                  <td className="px-4 py-3">{fmtDate(row.addedAt)}</td>
                  <td className="px-4 py-3 capitalize">{row.bookType || "—"}</td>
                  <td className="px-4 py-3">{taka(row.price)}</td>
                  <td className="px-4 py-3">{num(row.quantity)}</td>
                  <td className="px-4 py-3">{num(row.sold)}</td>
                  <td className="px-4 py-3">{num(row.left)}</td>
                  <td className="px-4 py-3">{row.rate != null ? `${row.rate}%` : "—"}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{taka(row.royaltyFromSales)}</td>
                  <td className="px-4 py-3"><Badge tone={BOOK_STATUS[row.status]?.tone}>{BOOK_STATUS[row.status]?.label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.editions.length && <Empty title="No editions yet" />}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHead icon={ReceiptText} title="Recent sales" sub={`last ${data.sales.length}`} className="p-5" />
        {!data.sales.length ? <Empty icon={ReceiptText} title="No sales yet" /> : (
          <div className="divide-y divide-slate-100">
            {data.sales.map((row) => (
              <div key={row._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <div><p className="font-semibold">{row.invoiceNo ? `Invoice #${row.invoiceNo}` : "Sale"}</p><p className="text-xs text-slate-500">{fmtDateTime(row.date)}</p></div>
                <p className="text-xs text-slate-500">Edition {ordinal(row.edition)} · {row.quantity} × {taka(row.coverPrice)}</p>
                <Badge tone={row.royalty ? "green" : "gray"}>{row.royaltyFree ? "Royalty free" : `Royalty ${taka(row.royalty)}`}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
