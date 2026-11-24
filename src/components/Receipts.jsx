import { Ban, CheckCircle2, Clock3, HandCoins, Printer, Send, X } from "lucide-react";
import { fmtDate, fmtDateTime, taka } from "@/lib/format";
import { Badge, Button, InfoRow, Modal, STATUS, cn } from "@/components/ui";

const THEMES = {
  advance: { band: "from-amber-500 to-orange-500", icon: HandCoins, title: "Advance received" },
  paid: { band: "from-emerald-500 to-green-600", icon: CheckCircle2, title: "Withdraw paid" },
  due: { band: "from-brand-600 to-brand-700", icon: Clock3, title: "Withdraw requested" },
  cancel: { band: "from-rose-500 to-red-600", icon: Ban, title: "Withdraw cancelled" },
};

// One receipt modal for advances and withdraws. `item` comes from summary/history/payout lists.
export function Receipt({ item, kind, onClose, onCancel, cancelling }) {
  if (!item) return null;
  const theme = THEMES[kind === "advance" ? "advance" : item.status] || THEMES.paid;
  const Icon = theme.icon;
  return (
    <Modal open onClose={onClose} className="print-area overflow-hidden">
      <div className={cn("bg-gradient-to-br px-6 pt-8 pb-10 text-center text-white", theme.band)}>
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-white/20"><Icon className="size-7" /></div>
        <p className="text-sm font-semibold text-white/80">{theme.title}</p>
        <p className="mt-1 text-4xl font-extrabold">{taka(item.amount)}</p>
        <p className="mt-1 text-xs text-white/70">{item.code}</p>
      </div>
      <div className="-mt-5 rounded-t-3xl bg-white px-6 pt-5 pb-6">
        <div className="divide-y divide-slate-100">
          {kind === "advance" ? (
            <>
              <InfoRow label="Date" value={fmtDate(item.date)} />
              <InfoRow label="Paid from" value={item.paidFrom || item.sentTo} />
              {item.reference && <InfoRow label="Reference" value={item.reference} />}
              {item.reason && <InfoRow label="For" value={item.reason} />}
              <InfoRow label="Recovery" value="From your future royalty" />
            </>
          ) : (
            <>
              <InfoRow label="Status" value={<Badge tone={STATUS[item.status]?.tone}>{STATUS[item.status]?.label}</Badge>} />
              <InfoRow label="Requested" value={fmtDateTime(item.requestedAt)} />
              {item.paidAt && <InfoRow label="Paid" value={fmtDateTime(item.paidAt)} />}
              {item.cancelledAt && <InfoRow label="Cancelled" value={`${fmtDateTime(item.cancelledAt)} · by ${item.cancelledBy === "author" ? "you" : "Nobokothon"}`} />}
              <InfoRow label="Sent to" value={item.sentTo} />
              {item.reference && <InfoRow label="Transaction ID" value={item.reference} />}
              {item.note && <InfoRow label="Note" value={item.note} />}
            </>
          )}
        </div>
        {item.status === "cancel" && kind !== "advance" && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">The money is back in your available balance. You can request again any time.</p>}
        {item.status === "due" && kind !== "advance" && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700">Nobokothon will send the money soon. The amount is on hold until then.</p>}
        <div className="no-print mt-6 flex gap-3">
          {onCancel && item.status === "due" ? (
            <Button variant="outline" className="flex-1 text-rose-600" loading={cancelling} onClick={() => onCancel(item)}><X className="size-4" /> Cancel request</Button>
          ) : (
            <Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          )}
          <Button className="flex-1" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}

// Withdraw progress: Requested → Processing → Paid.
export function WithdrawSteps({ status }) {
  const steps = [{ label: "Requested", icon: Send }, { label: "Processing", icon: Clock3 }, { label: "Paid", icon: CheckCircle2 }];
  const at = status === "paid" ? 3 : 1;
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={cn("grid size-9 place-items-center rounded-full", index < at ? "bg-emerald-500 text-white" : index === at ? "bg-brand-600 text-white ring-4 ring-brand-100" : "bg-slate-100 text-slate-400")}><step.icon className="size-4" /></div>
            <span className={cn("text-xs font-semibold", index <= at ? "text-ink" : "text-slate-400")}>{step.label}</span>
          </div>
          {index < steps.length - 1 && <div className={cn("mx-2 mb-5 h-0.5 flex-1", index < at ? "bg-emerald-500" : "bg-slate-200")} />}
        </div>
      ))}
    </div>
  );
}
