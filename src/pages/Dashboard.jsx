import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  Bell,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Hourglass,
  Layers,
  ReceiptText,
  Sun,
  TrendingUp,
  Undo2,
  Wallet,
  XCircle,
} from "lucide-react";
import { useSummary } from "@/lib/queries";
import {
  authorName,
  bookName,
  fmtDate,
  fmtDateTime,
  fmtMonth,
  greeting,
  methodSub,
  methodTitle,
  num,
  ordinal,
  taka,
} from "@/lib/format";
import { AreaChart, Donut, PALETTE, SparkBars } from "@/components/charts";
import {
  Badge,
  Card,
  CardHead,
  Cover,
  Empty,
  ErrorBox,
  MethodIcon,
  Ring,
  Spinner,
  Tabs,
  cn,
} from "@/components/ui";

const PERIODS = [
  {
    key: "today",
    label: "Today",
    icon: Sun,
    color: "#16a34a",
    bg: "from-emerald-50",
  },
  {
    key: "last7",
    label: "Last 7 days",
    icon: CalendarDays,
    color: "#2456c7",
    bg: "from-brand-50",
  },
  {
    key: "last30",
    label: "Last 30 days",
    icon: CalendarRange,
    color: "#7c3aed",
    bg: "from-violet-50",
  },
  {
    key: "last12m",
    label: "Last 12 months",
    icon: TrendingUp,
    color: "#d97706",
    bg: "from-amber-50",
  },
];

function MoneyCard({ label, value, icon: Icon, tone }) {
  const tones = {
    orange:
      "from-amber-50 border-amber-100 text-amber-700 [&_.chip]:bg-amber-500",
    blue: "from-brand-50 border-brand-100 text-brand-700 [&_.chip]:bg-brand-600",
    green:
      "from-emerald-50 border-emerald-100 text-emerald-700 [&_.chip]:bg-emerald-600",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-2xl border bg-linear-to-br to-white p-4",
        tones[tone],
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">{taka(value)}</p>
      </div>
      <span className="chip grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md">
        <Icon className="size-5" />
      </span>
    </div>
  );
}

function AvailableCard({ value, name }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-brand-500 via-brand-600 to-navy p-4 text-white shadow-lg shadow-brand-600/25 max-sm:-order-1 max-sm:aspect-[1.6] max-sm:rounded-3xl max-sm:p-5">
      <span className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-white/5 sm:hidden" />
      <div className="flex items-center justify-between sm:hidden">
        <img src="/logo.png" alt="নবকথন" className="h-7 w-auto " />
        <span className="text-xs font-semibold text-white/70">
          Royalty Wallet
        </span>
      </div>
      <span className="absolute top-1/2 right-5 h-10 w-13 -translate-y-1/2 rounded-lg border border-amber-500/40 bg-[linear-gradient(90deg,transparent_45%,rgba(146,64,14,.35)_45%_55%,transparent_55%),linear-gradient(135deg,#fde68a,#f59e0b)] sm:hidden" />
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-semibold text-white/80">
          Available balance
        </p>
        <Link
          to="/withdraw"
          className="edit-only flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700 active:bg-white/90 max-sm:absolute max-sm:right-5 max-sm:bottom-5 max-sm:rounded-xl max-sm:px-4 max-sm:py-2.5 max-sm:text-sm"
        >
          <ArrowUp className="size-3" /> Withdraw
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-left"
      >
        <span className="text-2xl font-extrabold max-sm:text-3xl">
          {show ? taka(value) : "৳ ••••"}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
          {show ? (
            <>
              <EyeOff className="size-3" /> Hide
            </>
          ) : (
            <>
              <Eye className="size-3" /> Tap to see
            </>
          )}
        </span>
      </button>
      <div className="sm:hidden">
        <p className="text-[10px] text-white/60">Card holder</p>
        <p className="bn truncate pr-32 text-sm font-semibold">{name}</p>
      </div>
    </div>
  );
}

function Recovery({ finance, since }) {
  const r = finance.recovery;
  if (!r || r.state === "none") return null;
  const done = r.state === "covered";
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <Hourglass className="size-4" />
          </span>
          <p className="text-base font-bold">Advance Recovery</p>
          {since && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
              {fmtDate(since)}
            </span>
          )}
          {done && (
            <Badge tone="green">
              <Check className="size-3" /> Recovered
            </Badge>
          )}
        </div>
        <div className="shrink-0">
          <Ring
            percent={r.percent}
            size={52}
            stroke={5}
            color={done ? "#16a34a" : "#f59e0b"}
            track={done ? "#dcfce7" : "#fde7c4"}
          />
        </div>
      </div>
      <div className="relative pt-8">
        <span
          className="absolute top-0 z-10 -translate-x-1/2 rounded-md bg-navy px-2 py-0.5 text-[11px] font-bold text-white shadow-md after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-navy after:content-['']"
          style={{ left: `${Math.min(Math.max(r.percent, 6), 94)}%` }}
        >
          {taka(r.covered)}
        </span>
        <div className="relative h-4 overflow-hidden rounded-full bg-[#fdf1de]">
          <div
            className="h-full w-full origin-left rounded-full bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.22)_0_6px,transparent_6px_12px),linear-gradient(90deg,#f59e0b,#a3b93a_45%,#16a34a)] animate-progress-fill"
            style={{ "--progress": `${r.percent}%` }}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-emerald-500" /> Recovered{" "}
            <b>{taka(r.covered)}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-amber-400" /> Remaining{" "}
            <b>{taka(finance.advanceRemaining)}</b>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Advance {taka(finance.advance)}</Badge>
          <Badge>
            Adjustment {taka(finance.deductAdjustment - finance.addAdjustment)}
          </Badge>
          <Badge tone="orange">Total {taka(r.target)}</Badge>
        </div>
      </div>
    </Card>
  );
}

function RecentSales({ rows, total }) {
  // Returned orders show greyed out with "Order cancelled" and struck quantity / royalty.
  return (
    <Card className="p-4 sm:p-5">
      <CardHead
        icon={ReceiptText}
        title={`Recent Sales (${total.count})`}
        right={
          <div className="text-right text-[11px] text-slate-500">
            <p>
              Total Books Sold : <b className="text-ink">{num(total.copies)}</b>
            </p>
            <p>
              Total Royalty : <b className="text-ink">{taka(total.royalty)}</b>
            </p>
          </div>
        }
      />
      <div className="mt-4 space-y-2.5">
        {!rows.length && (
          <Empty
            icon={ReceiptText}
            title="No sales yet"
            text="Your sales will show here as soon as a copy is sold."
          />
        )}
        {rows.map((row) => (
          <div
            key={`${row.status}-${row._id}`}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 p-3 shadow-sm sm:flex-nowrap sm:gap-4",
              row.status === "cancelled" && "bg-slate-50/80",
            )}
          >
            <Cover
              cover={row.book?.cover}
              className={cn(
                "h-18 w-13 shrink-0",
                row.status === "cancelled" && "opacity-40 grayscale",
              )}
            />
            <div
              className={cn(
                "min-w-0 flex-1 space-y-0.5 text-sm",
                row.status === "cancelled" && "opacity-50",
              )}
            >
              <p className="bn truncate text-base font-bold">
                {bookName(row.book)}
              </p>
              <p className="text-slate-500">
                Price: <b className="text-ink">{taka(row.coverPrice)}</b>
              </p>
              <p className="text-slate-500">
                Royalty: <b className="text-ink">{row.rate}%</b>
              </p>
            </div>
            {row.status === "cancelled" && (
              <span className="hidden items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 sm:flex">
                <XCircle className="size-3.5" /> Order cancelled
              </span>
            )}
            <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-xs sm:block sm:w-auto sm:space-y-1 sm:border-0 sm:pt-0 sm:text-right sm:text-sm">
              <p
                className={cn(
                  "text-slate-500",
                  row.status === "cancelled" && "opacity-60",
                )}
              >
                Edition : <b className="text-ink">{ordinal(row.edition)}</b>{" "}
                &nbsp; Quantity :{" "}
                <b
                  className={cn(
                    "text-ink",
                    row.status === "cancelled" && "strike text-rose-600",
                  )}
                >
                  {row.quantity}
                </b>
              </p>
              <p
                className={cn(
                  "font-semibold",
                  row.status === "cancelled" && "text-slate-400",
                )}
              >
                {fmtDateTime(row.date)}
              </p>
              <span
                className={cn(
                  "inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold",
                  row.status === "cancelled"
                    ? "bg-slate-100 text-slate-400"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                Royalty Generated :{" "}
                <span
                  className={cn(
                    row.status === "cancelled" && "strike text-rose-600",
                  )}
                >
                  {taka(row.royalty)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
      {total.count > rows.length && (
        <Link
          to="/sales"
          className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-brand-600"
        >
          See more <ChevronRight className="size-3" />
        </Link>
      )}
    </Card>
  );
}

function BookStatus({ books }) {
  const [active, setActive] = useState(-1);
  const top = books.slice(0, 5);
  const rest = books.slice(5);
  const sum = (list, key) =>
    list.reduce((total, book) => total + Number(book[key] || 0), 0);
  const list = rest.length
    ? [
        ...top,
        {
          _id: "others",
          others: rest.length,
          royalty: sum(rest, "royalty"),
          copies: sum(rest, "copies"),
          estimated: rest.some((book) => book.estimated),
        },
      ]
    : top;
  const total = sum(books, "royalty");
  const picked = list[active];
  const share = (book) =>
    total ? Math.round((Number(book.royalty || 0) / total) * 100) : 0;
  return (
    <Card className="p-4 sm:p-5">
      <CardHead icon={BookOpen} title="Book Royalty Status" />
      {!books.length ? (
        <Empty icon={BookOpen} title="No books yet" />
      ) : (
        <>
          <div className="my-5 grid place-items-center">
            <Donut
              segments={list.map((book, index) => ({
                value: Number(book.royalty || 0),
                color: PALETTE[index],
              }))}
              active={active}
              onHover={setActive}
            >
              <p className="max-w-28 truncate text-[11px] text-slate-500">
                {picked
                  ? picked.others
                    ? "Others"
                    : bookName(picked)
                  : "Total royalty"}
              </p>
              <p className="text-2xl font-extrabold">
                {taka(picked ? picked.royalty : total)}
              </p>
              <p className="text-[11px] text-slate-400">
                {picked
                  ? `${share(picked)}% · ${num(picked.copies)} copies`
                  : `${books.length} books`}
              </p>
            </Donut>
          </div>
          <div className="space-y-1">
            {list.map((book, index) => (
              <Link
                key={book._id}
                to={book.others ? "/books" : `/books/${book._id}`}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(-1)}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-2 transition active:bg-slate-50",
                  active === index ? "bg-slate-50" : "hover:bg-slate-50",
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: PALETTE[index] }}
                />
                {book.others ? (
                  <span className="grid h-10 w-7 place-items-center rounded bg-slate-100 text-[11px] font-bold text-slate-500">
                    +{book.others}
                  </span>
                ) : (
                  <Cover cover={book.cover} className="h-10 w-7" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="bn truncate text-sm font-bold">
                      {book.others
                        ? `Others (${book.others} books)`
                        : bookName(book)}
                    </p>
                    <span className="shrink-0 text-sm font-bold">
                      {taka(book.royalty)}
                      {book.estimated && (
                        <span className="ml-1 text-[10px] font-semibold text-amber-600">
                          est.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share(book)}%`,
                          background: PALETTE[index],
                        }}
                      />
                    </div>
                    <span className="w-20 text-right text-[11px] text-slate-400">
                      {share(book)}% · {num(book.copies)} sold
                    </span>
                  </div>
                </div>
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
  const day = (offset, count) =>
    new Date(Date.now() - (count - 1 - offset) * 86400000);
  const sets = {
    week: {
      label: "Last 7 days",
      points: data.sales.last7.series.map((value, index) => ({
        value,
        label: day(index, 7).toLocaleDateString("en-GB", { weekday: "short" }),
      })),
    },
    month: {
      label: "Last 30 days",
      points: data.sales.last30.series.map((value, index) => ({
        value,
        label: index % 5 === 4 || index === 29 ? day(index, 30).getDate() : "",
      })),
    },
    year: {
      label: "Last 12 months",
      points: data.monthlyRoyalty.map((row) => ({
        value: row.royalty,
        label: fmtMonth(row.month),
      })),
    },
  };
  const current = sets[range];
  const total = current.points.reduce((sum, point) => sum + point.value, 0);
  const best = current.points.reduce(
    (top, point) => (point.value > top.value ? point : top),
    { value: 0, label: "" },
  );
  return (
    <Card className="p-4 sm:p-5">
      <CardHead
        icon={TrendingUp}
        title="Royalty earned"
        right={
          <Tabs
            value={range}
            onChange={setRange}
            items={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        }
      />
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="text-[11px] text-slate-400">{current.label}</p>
          <p className="text-xl font-extrabold">{taka(total)}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">
            Best {range === "year" ? "month" : "day"}
          </p>
          <p className="text-xl font-extrabold">
            {taka(best.value)}{" "}
            <span className="text-xs font-normal text-slate-400">
              {best.label}
            </span>
          </p>
        </div>
      </div>
      <AreaChart points={current.points} />
    </Card>
  );
}

function Received({ data }) {
  const navigate = useNavigate();
  const onOpen = (row) => navigate(`/receipt/${row.type}/${row._id}`);
  const method = data.paymentMethods[0];
  return (
    <Card className="p-4 sm:p-5">
      <CardHead
        icon={Check}
        title="Received"
        right={
          <Link
            to="/royalty-history"
            className="flex items-center text-xs font-semibold text-brand-600"
          >
            See all <ChevronRight className="size-3" />
          </Link>
        }
      />
      {method ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 p-3">
          <MethodIcon method={method} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{methodTitle(method)}</p>
            <p className="text-[11px] text-slate-500">{methodSub(method)}</p>
          </div>
          <Link
            to="/pay-method"
            className="text-xs font-semibold text-brand-600"
          >
            Change
          </Link>
        </div>
      ) : (
        <Link
          to="/pay-method"
          className="mt-4 block rounded-xl border border-dashed border-brand-200 p-3 text-center text-xs font-semibold text-brand-600"
        >
          + Add a pay method
        </Link>
      )}
      <div className="mt-3 divide-y divide-slate-100">
        {!data.received.length && (
          <p className="py-6 text-center text-xs text-slate-400">
            Nothing received yet.
          </p>
        )}
        {data.received.map((row) => (
          <button
            key={row._id}
            onClick={() => onOpen(row)}
            className="flex w-full items-center gap-3 py-3 text-left active:bg-slate-50 sm:py-2.5"
          >
            <span
              className={cn(
                "grid size-8 place-items-center rounded-lg",
                row.type === "advance"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              <Wallet className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{taka(row.amount)}</p>
              <p className="text-[11px] text-slate-400">
                {fmtDate(row.date)}
                {row.sentTo
                  ? ` · ${row.sentTo}`
                  : row.reference
                    ? ` · ${row.reference}`
                    : ""}
              </p>
            </div>
            <Badge tone={row.type === "advance" ? "orange" : "green"}>
              {row.type === "advance" ? "Advance" : "Withdraw"}
            </Badge>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Updates({ rows }) {
  return (
    <Card className="p-4 sm:p-5">
      <CardHead
        icon={Bell}
        title="Updates"
        right={
          <Link
            to="/notifications"
            className="flex items-center text-xs font-semibold text-brand-600"
          >
            See all <ChevronRight className="size-3" />
          </Link>
        }
      />
      <div className="mt-3 divide-y divide-slate-100">
        {!rows.length && (
          <p className="py-6 text-center text-xs text-slate-400">
            No updates yet.
          </p>
        )}
        {rows.map((row) => {
          const cancelled = /cancel|বাতিল/i.test(`${row.title} ${row.message}`);
          return (
            <div key={row._id} className="flex gap-3 py-2.5">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  cancelled
                    ? "bg-rose-50 text-rose-500"
                    : "bg-brand-50 text-brand-600",
                )}
              >
                {cancelled ? (
                  <XCircle className="size-4" />
                ) : (
                  <Layers className="size-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="bn line-clamp-2 text-sm font-semibold">
                  {row.title || row.message}
                </p>
                <p className="text-[11px] text-slate-400">
                  {fmtDate(row.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useSummary();
  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;
  const f = data.finance;

  return (
    <div className="flex flex-col gap-4 sm:block sm:space-y-5">
      <h1 className="bn text-2xl font-bold text-navy max-sm:-order-2 sm:text-[28px]">
        {greeting()}, {authorName(data.author)}
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {PERIODS.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            className={cn(
              "flex items-end justify-between gap-2 rounded-2xl border border-slate-200/80 bg-linear-to-br to-white p-3 sm:p-4",
              bg,
            )}
          >
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Icon className="size-3.5" style={{ color }} /> {label}
              </p>
              <p className="mt-1.5 text-xl font-extrabold sm:text-2xl">
                {taka(data.sales[key].royalty)}
              </p>
              <p className="text-[11px] text-slate-500">
                {num(data.sales[key].copies)} copies sold
              </p>
            </div>
            <SparkBars
              values={data.sales[key].series}
              color={color}
              className="h-8 w-12 shrink-0 sm:w-24"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 max-sm:contents sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard
          label="Advance remaining"
          value={f.advanceRemaining}
          icon={Undo2}
          tone="orange"
        />
        <MoneyCard
          label="Total earned"
          value={f.earned}
          icon={TrendingUp}
          tone="blue"
        />
        <AvailableCard value={f.available} name={authorName(data.author)} />
        <MoneyCard
          label="Received"
          value={f.received}
          icon={Check}
          tone="green"
        />
      </div>

      <Recovery finance={f} since={data.latestAdvance?.date} />

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.5fr_1fr]">
        <RecentSales rows={data.recentSales} total={data.sales.total} />
        <BookStatus books={data.books} />
      </div>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.5fr_1fr]">
        <RoyaltyChart data={data} />
        <div className="space-y-4 sm:space-y-5">
          <Received data={data} />
          <Updates rows={data.updates} />
        </div>
      </div>
    </div>
  );
}
