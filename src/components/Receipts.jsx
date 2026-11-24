import { Check, CheckCircle2, Clock3, Info, Send } from "lucide-react";
import { useMe } from "@/lib/queries";
import { dateTimeShort, taka, takaWords } from "@/lib/format";
import { Avatar, MethodIcon, cn } from "@/components/ui";

const THEMES = {
  advance: { band: "from-amber-500 via-orange-500 to-orange-700", tint: "from-orange-50/80", amount: "text-orange-600", label: "text-orange-700", stamp: "border-orange-400 text-orange-500", title: "Advance Receipt", amountLabel: "Advance given", stampText: "ADVANCE", person: "Paid to author" },
  paid: { band: "from-emerald-500 to-green-800", tint: "from-emerald-50/80", amount: "text-emerald-700", label: "text-emerald-700", stamp: "border-emerald-500 text-emerald-600", title: "Withdraw Receipt", amountLabel: "Amount paid", stampText: "PAID", person: "Paid to author" },
  cancel: { band: "from-rose-500 to-red-700", tint: "from-rose-50/80", amount: "text-red-600", label: "text-red-700", stamp: "border-red-400 text-red-500", title: "Withdraw Request", amountLabel: "Requested amount", stampText: "CANCELLED", person: "Requested by" },
  due: { band: "from-brand-600 to-navy", tint: "from-brand-50/80", amount: "text-brand-700", label: "text-brand-700", stamp: "border-brand-400 text-brand-600", title: "Withdraw Request", amountLabel: "Requested amount", stampText: "REQUESTED", person: "Requested by" },
};

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5 text-sm last:border-0 sm:text-[15px]">
    <span className="shrink-0 text-slate-500">{label}</span>
    <span className="min-w-0 text-right font-semibold break-words">{children}</span>
  </div>
);

/**
 * Printable receipt card (designs 18, 20, 22). kind = "advance" | "withdraw".
 * The internal note and Nobokothon's own paying account are never shown to authors.
 */
export function ReceiptCard({ item, kind, print }) {
  const me = useMe();
  const theme = THEMES[kind === "advance" ? "advance" : item.status] || THEMES.paid;
  const name = me.name;
  const sub = kind === "advance" ? takaWords(item.amount) : item.status === "paid" ? takaWords(item.amount) : item.status === "cancel" ? "Not paid · back in your balance" : "On hold until Nobokothon sends it";
  return (
    <div className={cn("mx-auto w-full max-w-[460px] overflow-hidden rounded-3xl bg-white", print ? "max-w-none rounded-2xl border border-slate-200" : "shadow-2xl shadow-slate-300/50")}>
      <div className={cn("relative overflow-hidden bg-linear-to-br px-5 pt-7 pb-6 text-center text-white sm:px-6", theme.band)}>
        <span className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
        <img src="/logo.png" alt="নবকথন" className="relative mx-auto h-12 brightness-0 invert" />
        <p className="relative mt-3 text-lg font-bold">{theme.title}</p>
        <span className="relative mt-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold">{item.code}</span>
      </div>
      <div className={cn("relative bg-linear-to-b to-white px-5 pt-8 pb-4 text-center sm:px-6", theme.tint)}>
        <span className={cn("absolute top-4 right-4 rotate-12 rounded-lg border-2 px-2.5 py-0.5 text-sm font-black tracking-widest", theme.stamp)}>{theme.stampText}</span>
        <p className={cn("text-[15px] font-semibold", theme.label)}>{theme.amountLabel}</p>
        <p className={cn("display text-4xl font-extrabold break-words sm:text-5xl", theme.amount)}>{taka(item.amount)}</p>
        <p className="mt-2 text-sm text-slate-500 italic">{sub}</p>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left"><Avatar name={name} photo={me.photo} size="size-11" /><div><p className="text-xs text-slate-500">{theme.person}</p><p className="bn text-lg font-bold">{name}</p></div></div>
        {item.status === "cancel" && item.cancelReason && <div className="mt-4 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left"><Info className="mt-0.5 size-5 shrink-0 text-rose-500" /><div><p className="font-bold text-rose-700">Reason</p><p className="bn mt-1 text-sm text-rose-900/80">{item.cancelReason}</p></div></div>}
      </div>
      <div className="relative border-t-2 border-dashed border-slate-200 px-5 pt-2 pb-6 sm:px-6">
        <span className="absolute -top-3 -left-3 size-6 rounded-full bg-page" />
        <span className="absolute -top-3 -right-3 size-6 rounded-full bg-page" />
        {kind === "advance" ? (
          <>
            <Row label="Advance ID">{item.code}</Row>
            <Row label="Date">{dateTimeShort(item.date)}</Row>
            {item.reason && <Row label="Reason"><span className="bn">{item.reason}</span></Row>}
            <Row label="Paid to">{item.cash ? "Cash · Nobokothon office" : name}</Row>
            {item.reference && <Row label="Transaction ID"><span className="rounded-md bg-slate-100 px-2 py-1 break-all text-slate-500">{item.reference}</span></Row>}
          </>
        ) : (
          <>
            <Row label="Withdraw ID">{item.code}</Row>
            <Row label="Requested">{dateTimeShort(item.requestedAt)}</Row>
            {item.status === "paid" && <Row label="Paid">{dateTimeShort(item.paidAt)}</Row>}
            {item.status === "cancel" && <Row label="Cancelled">{dateTimeShort(item.cancelledAt)}{item.cancelledBy === "author" ? " · by you" : ""}</Row>}
            <Row label={item.status === "paid" ? "Paid to" : "Requested to"}><span className="inline-flex items-center gap-2"><MethodIcon method={item.method} className="size-6 rounded-md border-0" />{item.sentTo}</span></Row>
            {item.accountTitle && <Row label="Account name"><span className="bn">{item.accountTitle}</span></Row>}
            {item.reference && item.status === "paid" && <Row label="Transaction ID"><span className="rounded-md bg-slate-100 px-2 py-1 break-all text-slate-500">{item.reference}</span></Row>}
            {item.note && <Row label="Your note"><span className="bn">{item.note}</span></Row>}
            {item.paidNote && <Row label="Note from Nobokothon"><span className="bn">{item.paidNote}</span></Row>}
          </>
        )}
        <p className="pt-5 text-center text-sm text-slate-400">Thank you for writing with Nobokothon</p>
      </div>
    </div>
  );
}

// Withdraw progress: Requested → Processing → Paid (design 11).
export function WithdrawSteps({ status, requestedAt }) {
  const steps = [
    { label: "Requested", sub: requestedAt ? dateTimeShort(requestedAt) : "", icon: Send },
    { label: "Processing", sub: "Sending money", icon: Clock3 },
    { label: "Paid", sub: "Receipt ready", icon: CheckCircle2 },
  ];
  const at = status === "paid" ? 3 : 0;
  return (
    <div className="flex items-start rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-5 sm:px-4">
      {steps.map((step, index) => (
        <div key={step.label} className="flex flex-1 items-start last:flex-none">
          <div className="flex w-20 flex-col items-center gap-1.5 text-center sm:w-24">
            <div className={cn("grid size-11 place-items-center rounded-xl", index < at || index === at ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" : "border border-slate-200 bg-white text-slate-400")}>{index < at ? <Check className="size-5" /> : <step.icon className="size-5" />}</div>
            <span className={cn("text-sm font-semibold", index <= at ? "text-ink" : "text-slate-500")}>{step.label}</span>
            <span className="text-[11px] text-slate-400">{step.sub}</span>
          </div>
          {index < steps.length - 1 && <div className="mt-5 h-0 flex-1 border-t-2 border-dashed border-slate-300" />}
        </div>
      ))}
    </div>
  );
}
