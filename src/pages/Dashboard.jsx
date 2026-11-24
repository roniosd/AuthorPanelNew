import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Bell, BookOpen, CalendarDays, CalendarRange, Check, ChevronRight, Eye, EyeOff, Hourglass, Layers, ReceiptText, Sun, TrendingUp, Undo2, Wallet, XCircle } from "lucide-react";
import { useSummary } from "@/lib/queries";
import { authorName, bookName, fmtDate, fmtDateTime, fmtMonth, greeting, methodSub, methodTitle, num, ordinal, taka } from "@/lib/format";
import { AreaChart, Donut, PALETTE, SparkBars } from "@/components/charts";
import { Badge, Card, CardHead, Cover, Empty, ErrorBox, MethodIcon, Ring, Spinner, Tabs, cn } from "@/components/ui";
import { Receipt } from "@/components/Receipts";

const PERIODS = [
  { key: "today", label: "Today", icon: Sun, color: "#16a34a", bg: "from-emerald-50" },
  { key: "last7", label: "Last 7 days", icon: CalendarDays, color: "#2456c7", bg: "from-brand-50" },
  { key: "last30", label: "Last 30 days", icon: CalendarRange, color: "#7c3aed", bg: "from-violet-50" },
  { key: "last12m", label: "Last 12 months", icon: TrendingUp, color: "#d97706", bg: "from-amber-50" },
];

function MoneyCard({ label, value, icon: Icon, tone }) {
  const tones = { orange: "from-amber-50 border-amber-100 text-amber-700 [&_.chip]:bg-amber-500", blue: "from-brand-50 border-brand-100 text-brand-700 [&_.chip]:bg-brand-600", green: "from-emerald-50 border-emerald-100 text-emerald-700 [&_.chip]:bg-emerald-600" };
  return (
    <div className={cn("flex items-center justify-between rounded-2xl border bg-linear-to-br to-white p-4", tones[tone])}>
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">{taka(value)}</p>
      </div>
      <span className="chip grid size-11 place-items-center rounded-xl text-white shadow-md"><Icon className="size-5" /></span>
    </div>
  );
}

function AvailableCard({ value }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-2xl bg-linear-to-br from-brand-600 to-navy p-4 text-white shadow-lg shadow-brand-600/25">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/80">Available balance</p>
        <Link to="/withdraw" className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700"><ArrowUp className="size-3" /> Withdraw</Link>
      </div>
      <button onClick={() => setShow(!show)} className="mt-1 flex items-center gap-2 text-left">
        <span className="text-2xl font-extrabold">{show ? taka(value) : "৳ ••••"}</span>
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px]">{show ? <><EyeOff className="size-3" /> Hide</> : <><Eye className="size-3" /> Tap to see</>}</span>
      </button>
    </div>
  );
}

function Recovery({ finance }) {
  const r = finance.recovery;
  if (!r || r.state === "none") return null;
  const done = r.state === "covered";
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-600"><Hourglass className="size-4" /></span>
          <p className="text-sm font-bold">Advance Recovery</p>
          {done && <Badge tone="green"><Check className="size-3" /> Recovered</Badge>}
        </div>
        <Ring percent={r.percent} size={52} stroke={5} color={done ? "#16a34a" : "#f59e0b"} track={done ? "#dcfce7" : "#fde7c4"} />
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-amber-100">
        <div className="h-full rounded-full bg-[repeating-linear-gradient(135deg,#16a34a_0_10px,#22c55e_10px_20px)] transition-all duration-700" style={{ width: `${r.percent}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" /> Recovered <b>{taka(r.covered)}</b></span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-400" /> Remaining <b>{taka(finance.advanceRemaining)}</b></span>
        </div>
        <div className="flex gap-2">
          <Badge>Advance {taka(finance.advance)}</Badge>
          <Badge>Adjustment {taka(finance.deductAdjustment - finance.addAdjustment)}</Badge>
          <Badge tone="orange">Total {taka(r.target)}</Badge>
        </div>
      </div>
    </Card>
  );
}

function RecentSales({ rows, total }) {
  return (
    <Card className="p-5">
      <CardHead icon={ReceiptText} title={`Recent Sales (${total.count})`} right={<div className="text-right text-[11px] text-slate-500"><p>Total Books Sold : <b className="text-ink">{num(total.copies)}</b></p><p>Total Royalty : <b className="text-ink">{taka(total.royalty)}</b></p></div>} />
      <div className="mt-4 space-y-2.5">
        {!rows.length && <Empty icon={ReceiptText} title="No sales yet" text="Your sales will show here as soon as a copy is sold." />}
        {rows.map((row) => (
          <div key={row._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
            <Cover cover={row.book?.cover} className="h-14 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="bn truncate text-sm font-bold">{bookName(row.book)}</p>
              <p className="text-[11px] text-slate-500">Price: <b>{taka(row.coverPrice)}</b> · Royalty: <b>{row.rate}%</b></p>
            </div>
            <div className="text-right text-[11px]">
              <p className="text-slate-500">Edition : <b className="text-ink">{ordinal(row.edition)}</b> · Qty : <b className="text-ink">{row.quantity}</b></p>
              <p className="font-semibold">{fmtDateTime(row.date)}</p>
              <span className="mt-0.5 inline-block rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">Royalty {taka(row.royalty)}</span>
            </div>
          </div>
        ))}
      </div>
      {total.count > rows.length && <Link to="/sales" className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-brand-600">See more <ChevronRight className="size-3" /></Link>}
    </Card>
  );
}

function BookStatus({ books }) {
  const top = books.slice(0, 5);
  const rest = books.slice(5);
  const list = rest.length ? [...top, { _id: "others", nameInEnglish: `Others`, others: rest.length, royalty: rest.reduce((sum, book) => sum + book.royalty, 0), copies: rest.reduce((sum, book) => sum + book.copies, 0) }] : top;
  const total = books.reduce((sum, book) => sum + book.royalty, 0);
  return (
    <Card className="p-5">
      <CardHead icon={BookOpen} title="Book Royalty Status" />
      {!books.length ? <Empty icon={BookOpen} title="No books yet" /> : (
        <>
          <div className="my-5 grid place-items-center">
            <Donut segments={list.map((book, index) => ({ value: book.royalty || 0.0001, color: PALETTE[index] }))}>
              <p className="text-[11px] text-slate-500">Total royalty</p>
              <p className="text-2xl font-extrabold">{taka(total)}</p>
              <p className="text-[11px] text-slate-400">{books.length} books</p>
            </Donut>
          </div>
          <div className="space-y-2">
            {list.map((book, index) => (
              <Link key={book._id} to={book.others ? "/books" : `/books/${book._id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
                <span className="grid size-6 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: PALETTE[index] }}>{book.others ? "•" : index + 1}</span>
                <Cover cover={book.cover} className="h-10 w-7" />
                <div className="min-w-0 flex-1">
                  <p className="bn truncate text-sm font-bold">{book.others ? "Others" : bookName(book)}</p>
                  <p className="text-[11px] text-slate-400">{book.others ? `${book.others} books · ` : ""}{num(book.copies)} copies sold</p>
                </div>
                <span className="text-sm font-bold">{taka(book.royalty)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function RoyaltyChart({ data }) {
  const [range, setRange] = useState("year");
  const day = (offset, count) => new Date(Date.now() - (count - 1 - offset) * 86400000);
  const sets = {
    week: { label: "Last 7 days", points: data.sales.last7.series.map((value, index) => ({ value, label: day(index, 7).toLocaleDateString("en-GB", { weekday: "short" }) })) },
    month: { label: "Last 30 days", points: data.sales.last30.series.map((value, index) => ({ value, label: index % 5 === 4 || index === 29 ? day(index, 30).getDate() : "" })) },
    year: { label: "Last 12 months", points: data.monthlyRoyalty.map((row) => ({ value: row.royalty, label: fmtMonth(row.month) })) },
  };
  const current = sets[range];
  const total = current.points.reduce((sum, point) => sum + point.value, 0);
  const best = current.points.reduce((top, point) => (point.value > top.value ? point : top), { value: 0, label: "" });
  return (
    <Card className="p-5">
      <CardHead icon={TrendingUp} title="Royalty earned" right={<Tabs value={range} onChange={setRange} items={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />} />
      <div className="mt-4 flex gap-8">
        <div><p className="text-[11px] text-slate-400">{current.label}</p><p className="text-xl font-extrabold">{taka(total)}</p></div>
        <div><p className="text-[11px] text-slate-400">Best {range === "year" ? "month" : "day"}</p><p className="text-xl font-extrabold">{taka(best.value)} <span className="text-xs font-normal text-slate-400">{best.label}</span></p></div>
      </div>
      <AreaChart points={current.points} />
    </Card>
  );
}

function Received({ data, onOpen }) {
  const method = data.paymentMethods[0];
  return (
    <Card className="p-5">
      <CardHead icon={Check} title="Received" right={<Link to="/royalty-history" className="flex items-center text-xs font-semibold text-brand-600">See all <ChevronRight className="size-3" /></Link>} />
      {method ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 p-3">
          <MethodIcon method={method} />
          <div className="flex-1"><p className="text-sm font-bold">{methodTitle(method)}</p><p className="text-[11px] text-slate-500">{methodSub(method)}</p></div>
          <Link to="/pay-method" className="text-xs font-semibold text-brand-600">Change</Link>
        </div>
      ) : (
        <Link to="/pay-method" className="mt-4 block rounded-xl border border-dashed border-brand-200 p-3 text-center text-xs font-semibold text-brand-600">+ Add a pay method</Link>
      )}
      <div className="mt-3 divide-y divide-slate-100">
        {!data.received.length && <p className="py-6 text-center text-xs text-slate-400">Nothing received yet.</p>}
        {data.received.map((row) => (
          <button key={row._id} onClick={() => onOpen(row)} className="flex w-full items-center gap-3 py-2.5 text-left">
            <span className={cn("grid size-8 place-items-center rounded-lg", row.type === "advance" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}><Wallet className="size-4" /></span>
            <div className="flex-1"><p className="text-sm font-bold">{taka(row.amount)}</p><p className="text-[11px] text-slate-400">{fmtDate(row.date)}{row.sentTo ? ` · ${row.sentTo}` : ""}</p></div>
            <Badge tone={row.type === "advance" ? "orange" : "green"}>{row.type === "advance" ? "Advance" : "Withdraw"}</Badge>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Updates({ rows }) {
  return (
    <Card className="p-5">
      <CardHead icon={Bell} title="Updates" right={<Link to="/notifications" className="flex items-center text-xs font-semibold text-brand-600">See all <ChevronRight className="size-3" /></Link>} />
      <div className="mt-3 divide-y divide-slate-100">
        {!rows.length && <p className="py-6 text-center text-xs text-slate-400">No updates yet.</p>}
        {rows.map((row) => {
          const cancelled = /cancel|বাতিল/i.test(`${row.title} ${row.message}`);
          return (
            <div key={row._id} className="flex gap-3 py-2.5">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", cancelled ? "bg-rose-50 text-rose-500" : "bg-brand-50 text-brand-600")}>{cancelled ? <XCircle className="size-4" /> : <Layers className="size-4" />}</span>
              <div className="min-w-0"><p className="bn line-clamp-2 text-sm font-semibold">{row.title || row.message}</p><p className="text-[11px] text-slate-400">{fmtDate(row.createdAt)}</p></div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useSummary();
  const [receipt, setReceipt] = useState(null);
  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;
  const f = data.finance;

  return (
    <div className="space-y-5">
      <h1 className="bn text-2xl font-bold">{greeting()}, {authorName(data.author)}</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PERIODS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className={cn("flex items-end justify-between rounded-2xl border border-slate-200/80 bg-linear-to-br to-white p-4", bg)}>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Icon className="size-3.5" style={{ color }} /> {label}</p>
              <p className="mt-1.5 text-2xl font-extrabold">{taka(data.sales[key].royalty)}</p>
              <p className="text-[11px] text-slate-500">{num(data.sales[key].copies)} copies sold</p>
            </div>
            <SparkBars values={data.sales[key].series} color={color} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard label="Advance remaining" value={f.advanceRemaining} icon={Undo2} tone="orange" />
        <MoneyCard label="Total earned" value={f.earned} icon={TrendingUp} tone="blue" />
        <AvailableCard value={f.available} />
        <MoneyCard label="Received" value={f.received} icon={Check} tone="green" />
      </div>

      <Recovery finance={f} />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <RecentSales rows={data.recentSales} total={data.sales.total} />
        <BookStatus books={data.books} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <RoyaltyChart data={data} />
        <div className="space-y-5">
          <Received data={data} onOpen={setReceipt} />
          <Updates rows={data.updates} />
        </div>
      </div>

      {receipt && <Receipt item={receipt.type === "advance" ? receipt : { ...receipt, status: "paid", paidAt: receipt.date }} kind={receipt.type === "advance" ? "advance" : "withdraw"} onClose={() => setReceipt(null)} />}
    </div>
  );
}
