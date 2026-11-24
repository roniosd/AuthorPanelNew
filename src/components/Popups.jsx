import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ban, BookOpen, Calendar, CalendarDays, Coins, Eye, FileText, Info, Link2, MessageSquare, Percent, Share2, Sparkles, Tag, Undo2, Wallet, XCircle, Copy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { actions, useAdvance, useBook, usePayout } from "@/lib/queries";
import { bookName, dateShort, dateTimeShort, fmtDate, ordinal, taka } from "@/lib/format";
import { Button, Cover, MethodIcon, Modal, cn } from "@/components/ui";

const MILESTONES = [100, 250, 500, 1000, 2000, 5000, 10000];
const RECENT = 30 * 86400000;
const recent = (date) => date && Date.now() - new Date(date).getTime() < RECENT;
const bn = (value) => String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);

function Burst() {
  const dots = useMemo(() => Array.from({ length: 22 }, (_, index) => ({ left: `${(index * 53) % 100}%`, top: `${(index * 37) % 90}%`, rotate: index * 40, color: ["#facc15", "#fb7185", "#38bdf8", "#a3e635", "#fff"][index % 5] })), []);
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{dots.map((dot, index) => <span key={index} className="absolute h-3 w-1 rounded-sm" style={{ left: dot.left, top: dot.top, transform: `rotate(${dot.rotate}deg)`, background: dot.color }} />)}</div>;
}

// Coloured header with an illustration, label and the amount.
function Hero({ tone, icon: Icon, label, amount, children }) {
  const tones = { orange: "from-amber-400 via-orange-500 to-orange-600", green: "from-emerald-500 to-green-700", red: "from-rose-500 to-red-600" };
  return (
    <div className={cn("relative overflow-hidden bg-linear-to-br px-6 pt-10 pb-7 text-center text-white", tones[tone])}>
      <span className="absolute -top-10 -left-10 size-40 rounded-full bg-white/10" />
      <span className="absolute -right-12 -bottom-16 size-44 rounded-full bg-white/10" />
      <div className="relative mx-auto mb-4 grid size-24 place-items-center rounded-3xl bg-white/20 shadow-inner"><Icon className="size-12" /><Sparkles className="absolute -top-2 -right-3 size-6 text-yellow-100" /></div>
      <p className="relative text-[15px] font-semibold text-white/90">{label}</p>
      <p className="display relative text-5xl font-extrabold">{taka(amount)}</p>
      {children && <div className="relative mt-3">{children}</div>}
    </div>
  );
}

const Rows = ({ rows }) => (
  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
    {rows.filter(Boolean).map(([Icon, label, value, highlight]) => (
      <div key={label} className={cn("flex items-center gap-3 px-4 py-3.5", highlight && "bg-emerald-50/40")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">{typeof Icon === "function" || Icon?.render ? <Icon className="size-4" /> : Icon}</span>
        <span className="flex-1 text-[15px] text-slate-500">{label}</span>
        <span className={cn("text-right text-[15px] font-bold", highlight && "bn text-emerald-700")}>{value}</span>
      </div>
    ))}
  </div>
);

const Buttons = ({ left, onLeft, onClose }) => (
  <div className="grid grid-cols-2 gap-3">
    <Button variant="outline" size="lg" className="h-13" onClick={onLeft}>{left}</Button>
    <Button size="lg" className="h-13" onClick={onClose}>Got it</Button>
  </div>
);

export function AdvancePopup({ item, onClose }) {
  const navigate = useNavigate();
  return (
    <Modal open onClose={onClose} className="max-w-lg overflow-hidden">
      <Hero tone="orange" icon={Wallet} label="Advance from Nobokothon" amount={item.amount}><span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm"><CalendarDays className="size-4" />{dateTimeShort(item.date)}</span></Hero>
      <div className="space-y-5 p-6">
        <Rows rows={[[FileText, "Advance ID", item.code], item.cash && [Wallet, "Sent to", "Cash · Nobokothon office"], item.reference && [Link2, "Transaction ID", item.reference], item.reason && [MessageSquare, "Note from Nobokothon", item.reason, true]]} />
        <Buttons left={<><Eye className="size-4" /> View receipt</>} onLeft={() => { onClose(); navigate(`/receipt/advance/${item._id}`); }} onClose={onClose} />
      </div>
    </Modal>
  );
}

export function WithdrawPopup({ item, onClose }) {
  const navigate = useNavigate();
  const cancelled = item.status === "cancel";
  const view = () => { onClose(); navigate(`/receipt/withdraw/${item._id}`); };
  if (cancelled)
    return (
      <Modal open onClose={onClose} className="max-w-lg overflow-hidden">
        <Hero tone="red" icon={XCircle} label="Withdraw cancelled" amount={item.amount}><span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm"><Undo2 className="size-4" /> Back in your balance</span></Hero>
        <div className="space-y-5 p-6">
          {item.cancelReason && <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"><Info className="mt-0.5 size-5 shrink-0 text-rose-500" /><div><p className="font-bold text-rose-700">Reason</p><p className="bn mt-1 text-sm text-rose-900/80">{item.cancelReason}</p></div></div>}
          <Rows rows={[[FileText, "Withdraw ID", item.code], [Calendar, "Requested", dateTimeShort(item.requestedAt)], [Ban, "Cancelled", dateTimeShort(item.cancelledAt)], [<MethodIcon key="m" method={item.method} className="size-6 rounded-md" />, "Requested to", item.sentTo]]} />
          <Buttons left={<><Eye className="size-4" /> View details</>} onLeft={view} onClose={onClose} />
        </div>
      </Modal>
    );
  return (
    <Modal open onClose={onClose} className="max-w-lg overflow-hidden">
      <Hero tone="green" icon={Wallet} label="Withdraw paid" amount={item.amount} />
      <div className="space-y-5 p-6">
        <Rows rows={[[FileText, "Withdraw ID", item.code], [Calendar, "Paid on", dateTimeShort(item.paidAt)], [<MethodIcon key="m" method={item.method} className="size-6 rounded-md" />, "Sent to", item.sentTo], item.reference && [Link2, "Transaction ID", item.reference], item.note && [MessageSquare, "Your note", item.note, true]]} />
        <Buttons left={<><Eye className="size-4" /> View receipt</>} onLeft={view} onClose={onClose} />
      </div>
    </Modal>
  );
}

export function EditionPopup({ item, book, onClose }) {
  const navigate = useNavigate();
  return (
    <Modal open onClose={onClose} className="max-w-lg overflow-hidden">
      <div className="relative overflow-hidden bg-linear-to-br from-slate-100 via-white to-amber-50 px-6 pt-10 pb-7 text-center">
        <span className="absolute -top-12 -left-12 size-40 rounded-full bg-brand-100/60" />
        <span className="absolute -right-10 -bottom-14 size-40 rounded-full bg-amber-100/70" />
        <Sparkles className="absolute top-14 left-24 size-6 text-amber-400" />
        <Cover cover={book?.cover} className="relative mx-auto h-44 w-32 -rotate-3 border-4 border-white shadow-xl" />
        <p className="relative mt-5 text-[15px] font-semibold text-brand-700">New edition added</p>
        <p className="bn relative text-4xl font-bold text-ink">{bookName(book)}</p>
        <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-navy"><BookOpen className="size-4" />{ordinal(item.edition)} edition</span>
      </div>
      <div className="space-y-5 p-6">
        <Rows rows={[[Calendar, "Added on", dateShort(item.addedAt)], [Tag, "MRP", taka(item.price)], [Percent, "Royalty", item.rate != null ? `${item.rate}%` : "—"], [Copy, "Edition copies", `${item.authorCopy || item.quantity || 0} copies`]]} />
        <Buttons left={<><BookOpen className="size-4" /> View book</>} onLeft={() => { onClose(); navigate(`/books/${item.bookId}`); }} onClose={onClose} />
      </div>
    </Modal>
  );
}

function MilestonePopup({ item, onClose }) {
  const share = () => {
    const url = import.meta.env.VITE_SITE_URL || "https://nobokothon.com";
    const text = `${bookName(item)} — ${item.reached}+ copies sold!`;
    if (navigator.share) navigator.share({ title: text, text, url }).catch(() => {});
    else navigator.clipboard?.writeText(`${text} ${url}`);
    onClose();
  };
  return (
    <Modal open onClose={onClose} className="max-w-md overflow-hidden">
      <div className="relative bg-[radial-gradient(circle_at_center,#2f63d6,#13265c)] px-6 pt-10 pb-8 text-center text-white">
        <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,.07)_0_10deg,transparent_10deg_20deg)]" />
        <Burst />
        <div className="relative mx-auto w-fit">
          <Cover cover={item.cover} className="h-44 w-32 -rotate-6 border-4 border-white" />
          <span className="bn absolute -right-7 -bottom-3 grid size-20 place-items-center rounded-full border-4 border-amber-200 bg-amber-400 text-xl font-black text-navy shadow-lg">{bn(item.reached)}<span className="-mt-3 text-[10px]">কপি</span></span>
        </div>
        <p className="bn relative mt-6 text-amber-300">অভিনন্দন!</p>
        <p className="bn relative text-2xl font-bold">{bookName(item)} পেরোল {bn(item.reached)} কপি</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2">
          {[[Calendar, "Reached on", fmtDate(new Date())], [BookOpen, "Copies sold", item.copies], [Coins, "Royalty from this book", taka(item.royalty)]].map(([Icon, label, value]) => <div key={label} className="rounded-xl border border-slate-200 p-3"><Icon className="size-4 text-brand-600" /><p className="mt-1 text-[10px] text-slate-400">{label}</p><p className="text-sm font-bold">{value}</p></div>)}
        </div>
        <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={onClose}>Close</Button><Button className="flex-1 bg-amber-400 text-navy shadow-amber-400/30 hover:bg-amber-500" onClick={share}><Share2 className="size-4" /> Share with readers</Button></div>
      </div>
    </Modal>
  );
}

// Popup opened from a notification (always shown, even if seen before).
function ForcedPopup({ popup, onClose }) {
  const advance = useAdvance(popup.type === "advance" ? popup.id : null);
  const payout = usePayout(popup.type === "withdraw" ? popup.id : null);
  const book = useBook(popup.type === "edition" ? popup.bookId : null);
  if (popup.type === "advance" && advance.data) return <AdvancePopup item={advance.data} onClose={onClose} />;
  if (popup.type === "withdraw" && payout.data) return <WithdrawPopup item={payout.data} onClose={onClose} />;
  if (popup.type === "edition" && book.data) {
    const edition = book.data.editions.find((row) => String(row.edition) === String(popup.edition));
    return edition ? <EditionPopup item={{ ...edition, bookId: book.data._id }} book={book.data} onClose={onClose} /> : null;
  }
  return null;
}

/**
 * One-time popups on every page (designs 17, 19, 21, 23, 24). "Seen" is saved for the author in the
 * POS (Author.seenPopups), so a popup shows once across phone and PC.
 */
export default function Popups({ summary }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [closed, setClosed] = useState({});
  const forced = location.state?.popup;
  const s = summary || {};
  const seenList = s.seenPopups || [];

  useEffect(() => setClosed({}), [summary?.seenPopups?.length]);

  if (forced) return <ForcedPopup popup={forced} onClose={() => navigate(location.pathname + location.search, { replace: true, state: null })} />;
  if (!summary) return null;

  const queue = [
    s.latestAdvance && recent(s.latestAdvance.date) && { key: `advance:${s.latestAdvance._id}`, kind: "advance", item: s.latestAdvance },
    s.lastPaid && recent(s.lastPaid.paidAt) && { key: `paid:${s.lastPaid._id}`, kind: "withdraw", item: s.lastPaid },
    s.lastCancelled && recent(s.lastCancelled.cancelledAt) && { key: `cancel:${s.lastCancelled._id}`, kind: "withdraw", item: s.lastCancelled },
    s.latestEdition && recent(s.latestEdition.addedAt) && { key: `edition:${s.latestEdition.bookId}:${s.latestEdition.edition}`, kind: "edition", item: s.latestEdition },
    ...(s.books || []).map((book) => {
      const reached = MILESTONES.filter((mark) => book.copies >= mark).at(-1);
      return reached && { key: `milestone:${book._id}:${reached}`, kind: "milestone", item: { ...book, reached } };
    }),
  ].filter((entry) => entry && !seenList.includes(entry.key) && !closed[entry.key]);

  const current = queue[0];
  if (!current) return null;
  const close = () => {
    setClosed((state) => ({ ...state, [current.key]: true }));
    actions.seen(current.key).then(() => queryClient.invalidateQueries({ queryKey: ["summary"] })).catch(() => {});
  };
  if (current.kind === "advance") return <AdvancePopup item={current.item} onClose={close} />;
  if (current.kind === "withdraw") return <WithdrawPopup item={current.item} onClose={close} />;
  if (current.kind === "edition") return <EditionPopup item={current.item} book={current.item.book} onClose={close} />;
  return <MilestonePopup item={current.item} onClose={close} />;
}
