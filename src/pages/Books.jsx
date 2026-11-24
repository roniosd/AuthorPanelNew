import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { useBooks } from "@/lib/queries";
import { bookName, num, ordinal, taka } from "@/lib/format";
import { Badge, Card, Cover, Empty, ErrorBox, PageTitle, Spinner, Tabs } from "@/components/ui";

export const BOOK_STATUS = { new: { label: "New", tone: "blue" }, selling: { label: "Selling", tone: "green" }, sold_out: { label: "Sold out", tone: "red" } };

export default function Books() {
  const { data = [], isLoading, error } = useBooks();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const list = useMemo(() => data.filter((book) => (role === "all" || book.role === role) && `${book.nameInBangla} ${book.nameInEnglish}`.toLowerCase().includes(q.trim().toLowerCase())), [data, q, role]);
  const total = (key) => data.reduce((sum, book) => sum + Number(book[key] || 0), 0);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;

  return (
    <>
      <PageTitle title="My Books" sub={`${data.length} books · ${num(total("sold"))} copies sold · ${taka(total("earned"))} royalty`} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs"><Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(event) => setQ(event.target.value)} className="input pl-10" placeholder="Search books" /></div>
        <Tabs value={role} onChange={setRole} items={[{ value: "all", label: "All", count: data.length }, { value: "writer", label: "Writer", count: data.filter((book) => book.role === "writer").length }, { value: "contributor", label: "Translator / Editor", count: data.filter((book) => book.role !== "writer").length }]} />
      </div>
      {!list.length ? <Card><Empty icon={BookOpen} title="No books found" /></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((book) => {
            const status = BOOK_STATUS[book.latest?.status] || BOOK_STATUS.new;
            return (
              <Link key={book._id} to={`/books/${book._id}`} className="card group flex gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <Cover cover={book.cover} className="h-32 w-22 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="bn line-clamp-2 font-bold group-hover:text-brand-700">{bookName(book)}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{book.role === "writer" ? "Writer" : "Translator / Editor"} · {book.editions.length} editions{book.latest ? ` · latest ${ordinal(book.latest.edition)}` : ""}</p>
                  <div className="mt-auto grid grid-cols-3 gap-2 pt-3 text-center">
                    <div className="rounded-lg bg-slate-50 py-1.5"><p className="text-[10px] text-slate-400">Sold</p><p className="text-sm font-bold">{num(book.sold)}</p></div>
                    <div className="rounded-lg bg-slate-50 py-1.5"><p className="text-[10px] text-slate-400">In stock</p><p className="text-sm font-bold">{num(book.left)}</p></div>
                    <div className="rounded-lg bg-emerald-50 py-1.5"><p className="text-[10px] text-emerald-600">Royalty</p><p className="text-sm font-bold text-emerald-700">{taka(book.earned)}</p></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
