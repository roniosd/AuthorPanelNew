import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Ban, Check, Eye, Hourglass, Lock, Search, Wallet, X, XCircle } from "lucide-react";
import { actions, useAction, usePayouts, useSummary } from "@/lib/queries";
import { errorText } from "@/lib/api";
import { dateShort, methodTitle, taka, timeOnly } from "@/lib/format";
import DateFilter, { WITHDRAW_PRESETS, rangeOf } from "@/components/DateFilter";
import { Button, Card, Empty, ErrorBox, MethodIcon, PageTitle, Spinner, cn } from "@/components/ui";

const Stat = ({ icon: Icon, tone, label, value, sub, className }) => (
  <Card className={cn("flex items-center gap-4 p-5", className)}>
    <span className={`grid size-12 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
    <div><p className="text-sm text-slate-500">{label}</p><p className="display text-2xl font-extrabold">{value}</p><p className="text-sm text-slate-400">{sub}</p></div>
  </Card>
);

const STATUS = {
  due: { label: "Requested", icon: Hourglass, tone: "bg-amber-50 text-amber-700", border: "border-l-amber-400" },
  paid: { label: "Paid", icon: Check, tone: "bg-emerald-50 text-emerald-700", border: "border-l-emerald-500" },
  cancel: { label: "Cancelled", icon: XCircle, tone: "bg-rose-50 text-rose-600", border: "border-l-rose-500" },
  mine: { label: "Cancelled by you", icon: Ban, tone: "bg-slate-100 text-slate-600", border: "border-l-slate-300" },
};

// Withdraw History (design 12).
export default function WithdrawHistory() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [filter, setFilter] = useState({ preset: "all" });
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const { data, isLoading, error } = usePayouts();
  const { data: summary } = useSummary();
  const cancel = useAction(actions.cancelWithdraw);
  const range = rangeOf(filter);
  const all = data?.rows || [];
  const rows = all.filter((row) => (status === "all" || row.status === status) && (!range.from || new Date(row.requestedAt) >= new Date(range.from)) && (!range.to || new Date(row.requestedAt) <= new Date(range.to)) && (!q || row.code.toLowerCase().includes(q.trim().toLowerCase())));
  const count = (key) => all.filter((row) => row.status === key).length;
  const cancelled = all.filter((row) => row.status === "cancel");
  const byYou = cancelled.filter((row) => row.cancelledBy === "author").length;
  const finance = summary?.finance;
  const min = summary?.minWithdraw || 500;
  const canWithdraw = finance && finance.available >= min;

  const cancelRequest = async (row) => {
    if (!window.confirm(`Cancel ${row.code}? The money goes back to your balance.`)) return;
    try {
      await cancel.mutateAsync(row._id);
    } catch (err) {
      setMessage(errorText(err));
    }
  };

  return (
    <>
      <PageTitle
        title="Withdraw History"
        right={
          <div className="flex gap-2">
            <div className="relative"><Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(event) => setQ(event.target.value)} className="input w-72 pl-11" placeholder="Search by Withdraw ID" /></div>
            <Link to="/withdraw" className="edit-only"><Button size="lg" className={cn(!canWithdraw && "bg-slate-200 text-slate-500 shadow-none hover:bg-slate-200")}>{canWithdraw ? <ArrowUp className="size-4" /> : <Lock className="size-4" />} Withdraw</Button></Link>
          </div>
        }
      />
      {message && <div className="mb-4"><ErrorBox error={message} /></div>}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Wallet} tone="bg-emerald-50 text-emerald-600" label="Total withdrawn" value={<span className="text-emerald-700">{taka(data?.summary.paid)}</span>} sub={`${count("paid")} paid`} />
        <Stat icon={Hourglass} tone="bg-brand-50 text-brand-600" label="In progress" value={taka(data?.summary.requested)} sub={count("due") ? `${count("due")} open request` : "No open request"} />
        <Stat icon={XCircle} tone="bg-rose-50 text-rose-500" label="Cancelled" value={cancelled.length} sub={`${cancelled.length - byYou} by Nobokothon · ${byYou} by you`} />
        <Stat icon={Wallet} tone="bg-amber-50 text-amber-600" className="border-amber-200" label="Available balance" value={<span className={finance?.available < 0 ? "text-orange-600" : "text-ink"}>{taka(finance?.available)}</span>} sub={canWithdraw ? "Ready to withdraw" : `Need ${taka(Math.max(min - (finance?.available || 0), 0))} more to withdraw`} />
      </div>
      <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          {[["all", "All", all.length], ["due", "In progress", count("due")], ["paid", "Paid", count("paid")], ["cancel", "Cancelled", count("cancel")]].map(([key, label, n]) => (
            <button key={key} onClick={() => setStatus(key)} className={cn("flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-semibold", status === key ? "border-navy bg-navy text-white" : "border-slate-200 text-slate-600")}>{label} <span className={cn("rounded-full px-1.5 text-xs", status === key ? "bg-white/20" : "bg-slate-100")}>{n}</span></button>
          ))}
        </div>
        <DateFilter value={filter} onChange={setFilter} presets={WITHDRAW_PRESETS} />
      </Card>
      <Card className="overflow-hidden">
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !rows.length ? <Empty icon={Wallet} title="No withdraws yet" text="Your withdraw requests will show here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-[15px]">
              <thead className="text-left text-sm text-slate-500"><tr>{["SL", "Withdraw ID", "Requested", "Amount", "Sent to", "Status", "Paid / Cancelled", "Transaction ID", "Action"].map((head) => <th key={head} className={cn("px-4 py-4 font-semibold", head === "Amount" && "text-right", head === "Action" && "text-center")}>{head}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => {
                  const meta = row.status === "cancel" && row.cancelledBy === "author" ? STATUS.mine : STATUS[row.status];
                  const muted = row.status === "cancel";
                  return (
                    <tr key={row._id} className={cn("border-l-4", meta.border)}>
                      <td className="px-4 py-4 text-slate-400">{index + 1}</td>
                      <td className={cn("px-4 py-4 font-bold", muted && "text-slate-500")}>{row.code}</td>
                      <td className="px-4 py-4"><p className="font-semibold">{dateShort(row.requestedAt)}</p><p className="text-xs text-slate-400">{timeOnly(row.requestedAt)}</p></td>
                      <td className={cn("px-4 py-4 text-right text-lg font-extrabold", row.status === "paid" ? "text-emerald-600" : muted ? "text-slate-400" : "text-brand-700")}>{taka(row.amount)}</td>
                      <td className="px-4 py-4"><div className="flex items-center gap-2.5"><MethodIcon method={row.method} className="size-8 rounded-lg" /><div><p className="font-semibold">{methodTitle(row.method)}</p><p className="text-xs text-slate-400">{row.sentTo?.split(" · ")[1] || ""}</p></div></div></td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", meta.tone)}><meta.icon className="size-3.5" />{meta.label}</span>
                        {row.status === "cancel" && row.cancelReason && <p className="mt-1 text-sm text-rose-600">{row.cancelReason}</p>}
                        {row.status === "due" && <p className="mt-1 text-sm font-semibold text-amber-700">Waiting for Nobokothon</p>}
                      </td>
                      <td className="px-4 py-4">{row.paidAt || row.cancelledAt ? <><p className="font-semibold">{dateShort(row.paidAt || row.cancelledAt)}</p><p className="text-xs text-slate-400">{timeOnly(row.paidAt || row.cancelledAt)}</p></> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-4">{row.status === "paid" && row.reference ? <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold">{row.reference}</span> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-4 text-center">
                        {row.status === "due" ? (
                          <Button variant="outline" size="sm" className="text-rose-600" loading={cancel.isPending} onClick={() => cancelRequest(row)}><X className="size-4" /> Cancel request</Button>
                        ) : (
                          <Button variant="outline" size="sm" className={cn(row.status === "paid" && "border-emerald-200 bg-emerald-50 text-emerald-700")} onClick={() => navigate(`/receipt/withdraw/${row._id}`)}><Eye className="size-4" /> {row.status === "paid" ? "Receipt" : "Details"}</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-5 py-4 text-sm text-slate-400">Showing 1–{rows.length} of {rows.length}</p>
          </div>
        )}
      </Card>
    </>
  );
}
