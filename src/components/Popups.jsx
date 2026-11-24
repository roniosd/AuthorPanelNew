import { useMemo, useState } from "react";
import { Ban, BookOpen, Calendar, Coins, HandCoins, PartyPopper, Share2, Sparkles, Wallet } from "lucide-react";
import { bookName, fmtDate, markSeen, ordinal, seen, taka } from "@/lib/format";
import { Button, Cover, Modal, cn } from "@/components/ui";
import { Receipt } from "@/components/Receipts";

const MILESTONES = [100, 250, 500, 1000, 2000, 5000, 10000];
const RECENT = 30 * 86400000;
const recent = (date) => date && Date.now() - new Date(date).getTime() < RECENT;
const bn = (value) => String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);

function Burst({ tone }) {
  const dots = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ left: `${(index * 53) % 100}%`, top: `${(index * 37) % 90}%`, rotate: index * 40, color: ["#facc15", "#fb7185", "#38bdf8", "#a3e635", "#fff"][index % 5] })), []);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", tone)}>
      {dots.map((dot, index) => <span key={index} className="absolute h-2.5 w-1 rounded-sm" style={{ left: dot.left, top: dot.top, transform: `rotate(${dot.rotate}deg)`, background: dot.color }} />)}
    </div>
  );
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 p-3">
    <Icon className="size-3.5 text-brand-600" />
    <p className="mt-1 text-[10px] text-slate-400">{label}</p>
    <p className="text-sm font-bold">{value}</p>
  </div>
);

// One-time popups on the dashboard: advance given, withdraw paid / cancelled, new edition, milestone.
export default function Popups({ summary }) {
  const [closed, setClosed] = useState({});
  const [receipt, setReceipt] = useState(null);
  const s = summary || {};
  const paid = (s.received || []).find((row) => row.type === "withdraw");

  const queue = [
    s.latestAdvance && recent(s.latestAdvance.date) && { key: `advance:${s.latestAdvance._id}`, kind: "advance", item: s.latestAdvance },
    paid && recent(paid.date) && { key: `paid:${paid._id}`, kind: "paid", item: { ...paid, status: "paid", paidAt: paid.date } },
    s.lastCancelled && recent(s.lastCancelled.cancelledAt) && { key: `cancel:${s.lastCancelled._id}`, kind: "cancel", item: s.lastCancelled },
    s.latestEdition && recent(s.latestEdition.addedAt) && { key: `edition:${s.latestEdition.bookId}:${s.latestEdition.edition}`, kind: "edition", item: s.latestEdition },
    ...(s.books || []).map((book) => {
      const reached = MILESTONES.filter((mark) => book.copies >= mark).at(-1);
      return reached && { key: `milestone:${book._id}:${reached}`, kind: "milestone", item: { ...book, reached } };
    }),
  ].filter((entry) => entry && !seen(entry.key) && !closed[entry.key]);

  const current = queue[0];
  const close = () => {
    if (!current) return;
    markSeen(current.key);
    setClosed((state) => ({ ...state, [current.key]: true }));
  };
  const openReceipt = () => {
    setReceipt({ item: current.item, kind: current.kind === "advance" ? "advance" : "withdraw" });
    close();
  };

  if (receipt) return <Receipt item={receipt.item} kind={receipt.kind} onClose={() => setReceipt(null)} />;
  if (!current) return null;
  const { kind, item } = current;

  if (kind === "milestone" || kind === "edition") {
    const share = () => {
      const url = `${import.meta.env.VITE_SITE_URL || "https://nobokothon.com"}`;
      const text = kind === "milestone" ? `${bookName(item)} — ${item.reached}+ copies sold!` : `${bookName(item.book)} — ${ordinal(item.edition)} edition is out!`;
      if (navigator.share) navigator.share({ title: text, text, url }).catch(() => {});
      else navigator.clipboard?.writeText(`${text} ${url}`);
      close();
    };
    return (
      <Modal open onClose={close} className="overflow-hidden">
        <div className="relative bg-[radial-gradient(circle_at_center,#2f63d6,#13265c)] px-6 pt-10 pb-8 text-center text-white">
          <Burst />
          <div className="relative mx-auto w-fit">
            <Cover cover={(item.book || item).cover} className="h-40 w-28 -rotate-6 border-4 border-white" />
            {kind === "milestone" && <span className="bn absolute -right-6 -bottom-3 grid size-16 place-items-center rounded-full border-4 border-amber-200 bg-amber-400 text-lg font-black text-navy shadow-lg">{bn(item.reached)}</span>}
          </div>
          <p className="bn relative mt-6 text-sm text-amber-300">অভিনন্দন!</p>
          <p className="bn relative text-xl font-bold">{kind === "milestone" ? `${bookName(item)} পেরোল ${bn(item.reached)} কপি` : `${bookName(item.book)} — ${bn(item.edition)} সংস্করণ এসেছে`}</p>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-2">
            {kind === "milestone" ? (
              <>
                <Stat icon={Calendar} label="Reached on" value={fmtDate(new Date())} />
                <Stat icon={BookOpen} label="Copies sold" value={item.copies} />
                <Stat icon={Coins} label="Royalty from this book" value={taka(item.royalty)} />
              </>
            ) : (
              <>
                <Stat icon={Calendar} label="Added on" value={fmtDate(item.addedAt)} />
                <Stat icon={BookOpen} label="Copies printed" value={item.quantity} />
                <Stat icon={Coins} label="Your royalty" value={item.rate != null ? `${item.rate}%` : "—"} />
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>Close</Button>
            <Button className="flex-1 bg-amber-400 text-navy shadow-amber-400/30 hover:bg-amber-500" onClick={share}><Share2 className="size-4" /> Share with readers</Button>
          </div>
        </div>
      </Modal>
    );
  }

  const theme = {
    advance: { icon: HandCoins, band: "from-amber-500 to-orange-500", title: "You got an advance", text: "It will be recovered from your future royalty. Nothing to pay back in cash." },
    paid: { icon: Wallet, band: "from-emerald-500 to-green-600", title: "Your withdraw is paid", text: `Sent to ${item.sentTo || "your pay method"}.` },
    cancel: { icon: Ban, band: "from-rose-500 to-red-600", title: "Withdraw was cancelled", text: "The money is back in your available balance. You can request again." },
  }[kind];
  const Icon = theme.icon;
  return (
    <Modal open onClose={close} className="overflow-hidden">
      <div className={cn("relative bg-gradient-to-br px-6 pt-10 pb-8 text-center text-white", theme.band)}>
        {kind !== "cancel" && <Burst />}
        <div className="relative mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-white/20">{kind === "cancel" ? <Icon className="size-8" /> : <><Icon className="size-8" /><Sparkles className="absolute -top-2 -right-2 size-5 text-yellow-200" /></>}</div>
        <p className="relative text-sm font-semibold text-white/85">{theme.title}</p>
        <p className="relative mt-1 text-4xl font-extrabold">{taka(item.amount)}</p>
        <p className="relative mt-1 text-xs text-white/70">{item.code} · {fmtDate(item.date || item.cancelledAt)}</p>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-center text-sm text-slate-600">{theme.text}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={close}>Close</Button>
          <Button className="flex-1" onClick={openReceipt}><PartyPopper className="size-4" /> {kind === "cancel" ? "See details" : "View receipt"}</Button>
        </div>
      </div>
    </Modal>
  );
}
