import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Ban, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { useAction, usePayouts, actions } from "@/lib/queries";
import { errorText } from "@/lib/api";
import { fmtDateTime, taka } from "@/lib/format";
import { Badge, Button, Card, Empty, ErrorBox, PageTitle, STATUS, Spinner, Tabs, cn } from "@/components/ui";
import { Receipt } from "@/components/Receipts";

const ICONS = { due: Clock3, paid: CheckCircle2, cancel: Ban };
const TONES = { due: "bg-amber-50 text-amber-600", paid: "bg-emerald-50 text-emerald-600", cancel: "bg-rose-50 text-rose-600" };

export default function WithdrawHistory() {
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(null);
  const [message, setMessage] = useState("");
  const { data, isLoading, error } = usePayouts();
  const cancel = useAction(actions.cancelWithdraw);
  const rows = (data?.rows || []).filter((row) => status === "all" || row.status === status);
  const count = (key) => (data?.rows || []).filter((row) => row.status === key).length;

  const cancelRequest = async (item) => {
    if (!window.confirm("Cancel this withdraw request?")) return;
    try {
      await cancel.mutateAsync(item._id);
      setOpen(null);
    } catch (err) {
      setMessage(errorText(err));
    }
  };

  return (
    <>
      <PageTitle title="Withdraw History" right={<Link to="/withdraw"><Button><ArrowUp className="size-4" /> Withdraw</Button></Link>} />
      {message && <div className="mb-4"><ErrorBox error={message} /></div>}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[["Paid", data?.summary.paid, "text-emerald-700"], ["Requested (on hold)", data?.summary.requested, "text-amber-700"], ["Cancelled", data?.summary.cancelled, "text-rose-600"]].map(([label, value, tone]) => (
          <Card key={label} className="p-4"><p className="text-xs text-slate-500">{label}</p><p className={cn("mt-1 text-2xl font-extrabold", tone)}>{taka(value)}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4"><Tabs value={status} onChange={setStatus} items={[{ value: "all", label: "All", count: data?.rows.length }, { value: "due", label: "Requested", count: count("due") }, { value: "paid", label: "Paid", count: count("paid") }, { value: "cancel", label: "Cancelled", count: count("cancel") }]} /></div>
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !rows.length ? <Empty icon={Wallet} title="No withdraws yet" text="Your withdraw requests will show here." /> : (
          <div className="divide-y divide-slate-100">
            {rows.map((row) => {
              const Icon = ICONS[row.status];
              return (
                <button key={row._id} onClick={() => setOpen(row)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/70">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONES[row.status])}><Icon className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{taka(row.amount)} <span className="font-normal text-slate-400">· {row.code}</span></p>
                    <p className="truncate text-xs text-slate-500">{fmtDateTime(row.paidAt || row.cancelledAt || row.requestedAt)} · {row.sentTo || "—"}</p>
                  </div>
                  <Badge tone={STATUS[row.status].tone}>{STATUS[row.status].label}</Badge>
                </button>
              );
            })}
          </div>
        )}
      </Card>
      {open && <Receipt item={open} kind="withdraw" onClose={() => setOpen(null)} onCancel={cancelRequest} cancelling={cancel.isPending} />}
    </>
  );
}
