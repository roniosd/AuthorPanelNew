import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Check, CreditCard, Hourglass, Lock, Plus, Send, Wallet } from "lucide-react";
import { useAction, useSummary, actions } from "@/lib/queries";
import { errorText } from "@/lib/api";
import { fmtDateTime, methodSub, methodTitle, num, taka } from "@/lib/format";
import { Button, Card, ErrorBox, Field, Input, MethodIcon, PageTitle, Ring, Spinner, cn } from "@/components/ui";
import { WithdrawSteps } from "@/components/Receipts";

function Banner({ tone, icon: Icon, title, text }) {
  const tones = { green: "bg-emerald-50 border-emerald-100 text-emerald-800 [&_.chip]:bg-emerald-600", orange: "bg-amber-50 border-amber-100 text-amber-800 [&_.chip]:bg-amber-500", blue: "bg-brand-50 border-brand-100 text-brand-800 [&_.chip]:bg-brand-600", gray: "bg-slate-50 border-slate-200 text-slate-700 [&_.chip]:bg-slate-500" };
  return (
    <div className={cn("flex items-center gap-4 border-b px-6 py-4", tones[tone])}>
      <span className="chip grid size-11 shrink-0 place-items-center rounded-xl text-white shadow"><Icon className="size-5" /></span>
      <div><p className="font-bold">{title}</p><p className="text-sm opacity-80">{text}</p></div>
    </div>
  );
}

const Money = () => (
  <div className="relative mx-auto h-36 w-52">
    <div className="absolute top-8 left-4 h-24 w-40 -rotate-6 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-200/70" />
    <div className="absolute top-4 left-8 grid h-24 w-40 rotate-3 place-items-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-500 shadow-lg"><span className="grid size-10 place-items-center rounded-full bg-emerald-600 text-lg font-black text-white">৳</span></div>
    <span className="absolute top-0 right-2 grid size-11 place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow"><Check className="size-5" /></span>
  </div>
);

function BalanceRow({ value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 px-5 py-4">
      <span className="flex items-center gap-3 text-sm text-slate-600"><span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Wallet className="size-4" /></span> Available balance</span>
      <span className={cn("text-2xl font-extrabold", value < 0 ? "text-rose-600" : "text-emerald-700")}>{taka(value)}</span>
    </div>
  );
}

// Locked states: below minimum, advance running, no pay method.
function Locked({ state, finance, min }) {
  if (state === "method")
    return (
      <Card className="overflow-hidden">
        <Banner tone="blue" icon={CreditCard} title="Add a pay method first" text="Tell us where to send your money, then you can withdraw." />
        <div className="space-y-6 p-6 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-brand-50 text-brand-600"><CreditCard className="size-10" /></div>
          <BalanceRow value={finance.available} />
          <Link to="/pay-method?add=1"><Button className="w-full" size="lg"><Plus className="size-4" /> Add pay method</Button></Link>
        </div>
      </Card>
    );
  const advance = state === "advance";
  const r = finance.recovery;
  const percent = advance ? r.percent : Math.max(0, (finance.available / min) * 100);
  return (
    <Card className="overflow-hidden">
      <Banner tone={advance ? "orange" : "gray"} icon={advance ? Hourglass : Lock} title={advance ? "Advance is being recovered" : `Withdraw opens at ${taka(min)}`} text={advance ? "Your royalty is paying back the advance first. Withdraw opens when your balance reaches the minimum." : `You need ${taka(min - finance.available)} more to withdraw.`} />
      <div className="space-y-6 p-6">
        <div className="grid place-items-center gap-2">
          <Ring percent={percent} size={150} stroke={12} color={advance ? "#f59e0b" : "#2456c7"} track={advance ? "#fde7c4" : "#dce6f9"}>
            <div className="text-center">
              <p className="text-3xl font-extrabold">{Math.round(percent)}%</p>
              <p className="text-[11px] text-slate-500">{advance ? "recovered" : `of ${taka(min)}`}</p>
            </div>
          </Ring>
          {advance && <p className="text-sm text-slate-500">Recovered <b className="text-ink">{taka(r.covered)}</b> of <b className="text-ink">{taka(r.target)}</b> · Remaining <b className="text-amber-700">{taka(finance.advanceRemaining)}</b></p>}
        </div>
        <BalanceRow value={finance.available} />
        <p className="text-center text-xs text-slate-500">Minimum withdraw is {taka(min)}. Keep selling — your balance grows with every copy.</p>
      </div>
    </Card>
  );
}

function Submitted({ request, onCancel, cancelling }) {
  return (
    <Card className="overflow-hidden">
      <Banner tone="blue" icon={Send} title="Withdraw requested" text="Nobokothon will send the money soon. You can have one request at a time." />
      <div className="space-y-6 p-6">
        <div className="text-center"><p className="text-sm text-slate-500">Amount</p><p className="text-4xl font-extrabold">{taka(request.amount)}</p><p className="text-xs text-slate-400">{request.code}</p></div>
        <WithdrawSteps status={request.status} />
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
          <div className="flex justify-between py-3 text-sm"><span className="text-slate-500">Requested</span><b>{fmtDateTime(request.requestedAt)}</b></div>
          <div className="flex justify-between py-3 text-sm"><span className="text-slate-500">Send to</span><b>{request.sentTo}</b></div>
          {request.note && <div className="flex justify-between py-3 text-sm"><span className="text-slate-500">Note</span><b>{request.note}</b></div>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 text-rose-600" loading={cancelling} onClick={onCancel}>Cancel request</Button>
          <Link to="/withdraw-history" className="flex-1"><Button className="w-full">Withdraw history</Button></Link>
        </div>
      </div>
    </Card>
  );
}

export default function Withdraw() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSummary();
  const submit = useAction(actions.withdraw);
  const cancel = useAction(actions.cancelWithdraw);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const finance = data?.finance;
  const methods = data?.paymentMethods || [];
  useEffect(() => {
    if (finance && amount === "") setAmount(String(Math.max(0, Math.floor(finance.available))));
    if (methods.length && !method) setMethod((methods.find((item) => item.isDefault) || methods[0])._id);
  }, [finance, methods, amount, method]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;

  const min = data.minWithdraw;
  const available = finance.available;
  const value = Number(amount || 0);
  const chosen = methods.find((item) => item._id === method);
  const invalid = !value || value < min || value > available;
  const state = data.pendingWithdraw ? "submitted" : available >= min ? (methods.length ? "open" : "method") : finance.recovery.state === "running" ? "advance" : "low";
  const chips = [500, 750, 1000].filter((chip) => chip < Math.floor(available) && chip >= min);

  const send = async () => {
    setMessage("");
    try {
      await submit.mutateAsync({ amount: value, method, note });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setMessage(errorText(err));
    }
  };
  const cancelRequest = async () => {
    if (!window.confirm("Cancel this withdraw request?")) return;
    try {
      await cancel.mutateAsync(data.pendingWithdraw._id);
      setAmount("");
    } catch (err) {
      setMessage(errorText(err));
    }
  };

  return (
    <>
      <PageTitle title="Withdraw" back="/" />
      <div className="mx-auto max-w-2xl space-y-5">
        {message && <ErrorBox error={message} />}
        {state === "submitted" && <Submitted request={data.pendingWithdraw} onCancel={cancelRequest} cancelling={cancel.isPending} />}
        {["method", "advance", "low"].includes(state) && <Locked state={state} finance={finance} min={min} />}
        {state === "open" && (
          <>
            <Card className="overflow-hidden">
              <Banner tone="green" icon={Check} title="Withdraw is open" text="You can request a withdraw now." />
              <div className="space-y-6 p-6"><Money /><BalanceRow value={available} /></div>
            </Card>
            <Card className="space-y-6 p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><ArrowUp className="size-5" /></span><h2 className="text-lg font-bold">Request withdraw</h2></div>
              <Field label="Amount" required error={value > available ? "More than your available balance." : value && value < min ? `Minimum is ${taka(min)}.` : ""}>
                <div className={cn("flex items-center overflow-hidden rounded-xl border-2 transition", invalid && amount ? "border-rose-300" : "border-brand-500/60")}>
                  <span className="grid h-14 w-14 place-items-center border-r border-slate-200 bg-slate-50 text-lg font-bold text-slate-500">৳</span>
                  <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} className="h-14 flex-1 px-4 text-2xl font-extrabold outline-none" />
                  <span className="mr-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-500">Remaining <b className="text-ink">{taka(Math.max(available - value, 0))}</b></span>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[...chips, Math.floor(available)].map((chip, index, list) => (
                  <button key={`${chip}-${index}`} type="button" onClick={() => setAmount(String(chip))} className={cn("rounded-xl border py-3 text-sm font-bold transition", value === chip ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:bg-slate-50")}>
                    {taka(chip)}{index === list.length - 1 && <span className="block text-[10px] font-normal text-slate-400">Full balance</span>}
                  </button>
                ))}
              </div>
              <Field label="Send to" required>
                <div className="space-y-2">
                  {methods.map((item) => (
                    <button key={item._id} type="button" onClick={() => setMethod(item._id)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition", method === item._id ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/15" : "border-slate-200 hover:bg-slate-50")}>
                      <MethodIcon method={item} />
                      <div className="flex-1"><p className="text-sm font-bold">{methodTitle(item)}</p><p className="text-xs text-slate-500">{methodSub(item)}</p></div>
                      <span className={cn("grid size-5 place-items-center rounded-full border-2", method === item._id ? "border-brand-600" : "border-slate-300")}>{method === item._id && <span className="size-2.5 rounded-full bg-brand-600" />}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => navigate("/pay-method?add=1")} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600"><Plus className="size-4" /> Add pay method</button>
                </div>
              </Field>
              <Field label="Note"><Input value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} placeholder="Optional" /></Field>
              <Button size="lg" className="w-full" disabled={invalid || !chosen} loading={submit.isPending} onClick={send}><ArrowUp className="size-4" /> Withdraw {taka(value)} to {methodTitle(chosen)}</Button>
              <button type="button" onClick={() => navigate("/")} className="block w-full text-center text-sm font-semibold text-slate-500">Cancel</button>
              <p className="text-center text-[11px] text-slate-400">Minimum {taka(min)} · one request at a time · {num(available)} available</p>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
