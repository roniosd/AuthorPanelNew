import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Hourglass, Search, Share2 } from "lucide-react";
import { useBooks } from "@/lib/queries";
import { bookCover } from "@/lib/api";
import { bookName, num, ordinal, taka } from "@/lib/format";
import { Card, Cover, Empty, ErrorBox, PageTitle, Spinner, Est } from "@/components/ui";

export const BOOK_STATUS = { new: { label: "New", tone: "orange" }, selling: { label: "Selling", tone: "blue" }, sold_out: { label: "Sold out", tone: "gray" } };

export const shareBook = (book, edition) => {
  const url = import.meta.env.VITE_SITE_URL || "https://nobokothon.com";
  const text = `${bookName(book)}${edition ? ` — ${ordinal(edition)} edition` : ""}`;
  if (navigator.share) navigator.share({ title: text, text, url }).catch(() => {});
  else navigator.clipboard?.writeText(`${text} ${url}`);
};

// My Books (design 02): blurred-cover banner, edition ribbon, MRP · Royalty, Sold / Left / Earned.
export default function Books() {
  const { data = [], isLoading, error } = useBooks();
  const [q, setQ] = useState("");
  const list = useMemo(() => data.filter((book) => `${book.nameInBangla} ${book.nameInEnglish}`.toLowerCase().includes(q.trim().toLowerCase())), [data, q]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;

  return (
    <>
      <PageTitle title="My Books" right={<div className="relative w-full max-w-sm sm:w-96"><Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(event) => setQ(event.target.value)} className="input pl-11" placeholder="Search books" /></div>} />
      {!list.length ? <Card><Empty icon={BookOpen} title="No books found" /></Card> : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((book) => {
            const latest = book.latest;
            const cover = bookCover(book.cover);
            return (
              <div key={book._id} className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl">
                <Link to={`/books/${book._id}`} className="block">
                  <div className="relative h-36 overflow-hidden bg-linear-to-br from-slate-300 to-slate-500">
                    {cover && <img src={cover} alt="" className="absolute inset-0 size-full scale-150 object-cover opacity-80 blur-2xl" />}
                  </div>
                  <div className="relative -mt-24 flex justify-center">
                    <div className="relative">
                      <Cover cover={book.cover} className="h-48 w-[134px] shadow-xl" />
                      {latest && <span className="absolute top-6 -right-2 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-bold text-white shadow">{ordinal(latest.edition)}</span>}
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-4 text-center">
                    <p className="bn truncate text-xl font-bold">{book.nameInBangla || book.nameInEnglish}</p>
                    {book.nameInBangla && book.nameInEnglish && <p className="truncate text-sm text-slate-400">{book.nameInEnglish}</p>}
                    {latest ? (
                      <>
                        <p className="mt-2 text-sm text-slate-500">MRP <b className="text-ink">{taka(latest.price)}</b> <span className="mx-1 text-slate-300">•</span> Royalty <b className="text-ink">{latest.rate != null ? `${latest.rate}%` : "—"}</b></p>
                        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-2.5">
                          <div><p className="text-lg font-bold">{num(book.sold)}</p><p className="text-xs text-slate-400">Sold</p></div>
                          <div><p className="text-lg font-bold">{num(book.left)}</p><p className="text-xs text-slate-400">Left</p></div>
                          <div><p className="text-lg font-bold text-emerald-600">{taka(book.earned)}<Est show={book.estimated} /></p><p className="text-xs text-slate-400">Earned</p></div>
                        </div>
                      </>
                    ) : <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700"><Hourglass className="size-4" /> No edition yet</span>}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">{book.editions.length ? <><BookOpen className="size-4" /> {book.editions.length} {book.editions.length === 1 ? "edition" : "editions"}</> : ""}</span>
                    <span className="flex items-center gap-1 font-semibold text-brand-700">View details <ChevronRight className="size-4" /></span>
                  </div>
                </Link>
                {latest && <button onClick={() => shareBook(book, latest.edition)} className="absolute top-3 right-3 grid size-9 place-items-center rounded-lg bg-white/80 text-slate-600 shadow-sm backdrop-blur hover:bg-white" title="Share"><Share2 className="size-4" /></button>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
