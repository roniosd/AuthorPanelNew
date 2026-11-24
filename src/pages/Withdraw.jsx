import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Check, CreditCard, FileText, List, Lock, Plus, Send, TrendingUp, Undo2, Wallet, X } from "lucide-react";
import { actions, useAction, useSummary } from "@/lib/queries";
import { errorText } from "@/lib/api";
import { confirmDialog, toast } from "@/lib/toast";
import { methodSub, methodTitle, taka } from "@/lib/format";
import PayMethodForm, { emptyMethod, methodErrors, toPayload } from "@/components/PayMethodForm";
import { WithdrawSteps } from "@/components/Receipts";
import { Badge, Button, Card, ErrorBox, Field, Input, MethodIcon, PageTitle, Ring, Spinner, cn } from "@/components/ui";

function Banner({ tone, icon: Icon, title, text }) {
  const tones = { green: "bg-emerald-50/70 border-emerald-100 text-emerald-800 [&_.chip]:bg-emerald-600", orange: "bg-amber-50/70 border-amber-100 text-amber-900 [&_.chip]:bg-amber-500" };
  return (
    <div className={cn("flex items-center gap-3 border-b px-4 py-4 sm:gap-4 sm:px-6", tones[tone])}>
      <span className="chip grid size-11 shrink-0 place-items-center rounded-xl text-white shadow"><Icon className="size-5" /></span>
      <div><p className="text-[17px] font-bold">{title}</p><p className="text-sm opacity-75">{text}</p></div>
    </div>
  );
}

const Money = () => (
  <div className="relative mx-auto h-36 w-56">
    <span className="absolute top-2 left-2 text-2xl text-amber-400">✦</span>
    <div className="absolute top-10 left-8 h-24 w-40 -rotate-6 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-200/70" />
    <div className="absolute top-4 left-12 grid h-24 w-40 rotate-3 place-items-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-500 shadow-lg"><span className="grid size-10 place-items-center rounded-full bg-emerald-700 text-lg font-black text-white">৳</span></div>
    <span className="absolute top-0 right-2 grid size-12 place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow"><Check className="size-6" /></span>
  </div>
);

const BalanceRow = ({ value }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-emerald-50/70 px-4 py-4 sm:px-5">
    <span className="flex items-center gap-3 text-[15px] text-slate-600"><span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Wallet className="size-4" /></span> Available balance</span>
    <span className={cn("display text-2xl font-extrabold", value < 0 ? "text-rose-600" : "text-emerald-700")}>{taka(value)}</span>
  </div>
);

function MoneyGoesTo({ method }) {
  if (!method) return null;
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between"><p className="flex items-center gap-2 font-bold"><CreditCard className="size-4 text-brand-600" /> Money will go to</p><Link to="/pay-method" className="text-sm font-semibold text-brand-700">Change</Link></div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><MethodIcon method={method} /><div className="min-w-0 flex-1"><p className="font-bold">{methodTitle(method)}</p><p className="text-sm text-slate-500">{methodSub(method)}</p></div><Badge>Default</Badge></div>
    </Card>
  );
}

// Locked states (designs 08, 10): below the minimum, or the advance is still being earned back.
function Locked({ finance, min, method }) {
  const advance = finance.recovery?.state === "running";
  const percent = advance ? finance.recovery.percent : Math.max(0, Math.min(100, (finance.available / min) * 100));
  const needed = Math.max(min - finance.available, 0);
  const rows = [
    [Lock, "Minimum to withdraw", taka(min)],
    [Wallet, "Available balance", <span key="a" className={finance.available < 0 ? "text-rose-600" : ""}>{taka(finance.available)}</span>],
    advance && [Undo2, "Advance remaining", taka(finance.advanceRemaining)],
    [TrendingUp, "Still needed", <span key="s" className="text-orange-600">{taka(needed)}</span>, true],
  ].filter(Boolean);
  return (
    <>
      <Card className="overflow-hidden">
        <Banner tone="orange" icon={Lock} title="Withdraw is locked" text={advance ? `Your advance needs to be earned back first, then your balance needs to reach ${taka(min)}.` : `Your balance needs to reach ${taka(min)} before you can withdraw.`} />
        <div className="space-y-6 p-4 sm:p-6">
          <div className="grid place-items-center">
            <Ring percent={percent} size={180} stroke={14} color={advance ? "#f59e0b" : "#16a34a"} track={advance ? "#fde7c4" : "#e2e8f0"}>
              <div className="text-center"><p className="text-xs text-slate-500">{advance ? "Advance earned back" : "Collected"}</p><p className="display text-4xl font-extrabold">{Math.round(percent)}%</p><p className="text-xs text-slate-400">of {taka(advance ? finance.recovery.target : min)}</p></div>
            </Ring>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {rows.map(([Icon, label, value, warm]) => <div key={label} className={cn("flex items-center gap-3 px-4 py-3.5", warm && "bg-amber-50/60")}><span className="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-500"><Icon className="size-4" /></span><span className="flex-1 text-[15px] text-slate-600">{label}</span><span className="text-lg font-extrabold">{value}</span></div>)}
          </div>
          <Button disabled size="lg" className="w-full bg-slate-200 text-slate-500 shadow-none"><Lock className="size-4" /> Withdraw</Button>
        </div>
      </Card>
      <MoneyGoesTo method={method} />
    </>
  );
}

// Request sent (design 11).
function Submitted({ request, balance, onCancel, cancelling }) {
  return (
    <Card className="overflow-hidden bg-linear-to-b from-brand-50/50 to-white p-4 sm:p-6">
      <div className="relative mx-auto grid h-36 w-48 place-items-center">
        <div className="absolute size-36 rounded-full bg-brand-100/60" />
        <Send className="relative size-20 -rotate-12 text-brand-600" />
        <span className="absolute top-2 left-6 text-2xl text-amber-400">✦</span>
        <span className="absolute right-4 bottom-6 grid size-9 place-items-center rounded-full bg-amber-400 text-sm font-black text-white">৳</span>
      </div>
      <h2 className="display mt-2 text-center text-2xl font-bold text-navy sm:text-3xl">Request sent</h2>
      <p className="text-center text-slate-500"><b className="text-emerald-700">{taka(request.amount)}</b> is on its way to your {methodTitle(request.method)}</p>
      <div className="my-6 grid grid-cols-3 gap-2 sm:gap-3">
        {[[<Wallet key="w" className="size-4 text-emerald-600" />, "Amount", taka(request.amount)], [<MethodIcon key="m" method={request.method} className="size-6 rounded-md border-0" />, "To", request.sentTo?.split(" · ")[1] || request.sentTo], [<FileText key="f" className="size-4 text-brand-600" />, "Request ID", request.code]].map(([icon, label, value]) => <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"><div className="mb-2 grid size-8 place-items-center rounded-lg bg-slate-50">{icon}</div><p className="text-xs text-slate-400">{label}</p><p className="truncate text-sm font-bold sm:text-base">{value}</p></div>)}
      </div>
      <WithdrawSteps status={request.status} requestedAt={request.requestedAt} />
      <div className="mt-5 flex items-center justify-between px-1 text-[15px]"><span className="flex items-center gap-2 text-slate-500"><CreditCard className="size-4" /> Balance now</span><b>{taka(balance)}</b></div>
      <div className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <Button variant="outline" size="lg" className="edit-only text-rose-600" loading={cancelling} onClick={onCancel}><X className="size-4" /> Cancel request</Button>
        <Link to="/withdraw-history"><Button size="lg" className="w-full"><List className="size-4" /> Withdraw history</Button></Link>
      </div>
    </Card>
  );
}

// Withdraw (designs 07–11).
export default function Withdraw() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSummary();
  const submit = useAction(actions.withdraw);
  const cancel = useAction(actions.cancelWithdraw);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [newMethod, setNewMethod] = useState(emptyMethod());
  const [newMethodErrors, setNewMethodErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const finance = data?.finance;
  const methods = data?.paymentMethods || [];
  const defaultMethod = methods.find((item) => item.isDefault) || methods[0];
  useEffect(() => {
    if (finance && amount === "") setAmount(String(Math.max(0, Math.floor(finance.available))));
  }, [finance, amount]);
  useEffect(() => {
    if (defaultMethod && !method) setMethod(defaultMethod._id);
  }, [defaultMethod, method]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBox error={error.message} />;

  const min = data.minWithdraw;
  const available = finance.available;
  const value = Number(amount || 0);
  const chosen = methods.find((item) => item._id === method);
  const invalid = !value || value < min || value > available;
  const inlineForm = !methods.length || adding;
  const state = data.pendingWithdraw ? "submitted" : available >= min ? "open" : "locked";
  const chips = [500, 750, 1000].filter((chip) => chip < Math.floor(available) && chip >= min);

  const send = async () => {
    setMessage("");
    setSaving(true);
    try {
      let methodId = method;
      if (inlineForm) {
        // No pay method yet (design 09): save it first, then withdraw.
        const found = methodErrors(newMethod);
        setNewMethodErrors(found);
        if (Object.keys(found).length) return toast.error("Please fix the highlighted pay method fields.");
        const result = await actions.addMethod(toPayload(newMethod));
        methodId = result?.data?._id;
        if (methodId && newMethod.isDefault) await actions.defaultMethod(methodId);
      }
      await submit.mutateAsync({ amount: value, method: methodId, note });
      toast.success(`Withdraw request of ${taka(value)} sent.`);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setMessage(errorText(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };
  const cancelRequest = async () => {
    if (!(await confirmDialog({ title: "Cancel this withdraw request?", text: "The money goes back to your balance.", confirmText: "Cancel request", cancelText: "Keep it" }))) return;
    try {
      await cancel.mutateAsync(data.pendingWithdraw._id);
      setAmount("");
      toast.success("Withdraw request cancelled. The money is back in your balance.");
    } catch (err) {
      setMessage(errorText(err));
      toast.error(err);
    }
  };

  return (
    <>
      <PageTitle title="Withdraw" back="/" />
      <div className="mx-auto max-w-[860px] space-y-5">
        {message && <ErrorBox error={message} />}
        {state === "submitted" && <Submitted request={data.pendingWithdraw} balance={available} onCancel={cancelRequest} cancelling={cancel.isPending} />}
        {state === "locked" && <Locked finance={finance} min={min} method={defaultMethod} />}
        {state === "open" && (
          <>
            <Card className="overflow-hidden">
              <Banner tone="green" icon={Check} title="Withdraw is open" text="You can request a withdraw now." />
              <div className="space-y-6 p-4 sm:p-6"><Money /><BalanceRow value={available} /></div>
            </Card>
            <Card className="edit-only space-y-6 p-4 sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><ArrowUp className="size-5" /></span><h2 className="text-xl font-bold">Request withdraw</h2></div>
              <Field label="Amount" required error={value > available ? "More than your available balance." : value && value < min ? `Minimum is ${taka(min)}.` : ""}>
                <div className={cn("flex items-center overflow-hidden rounded-xl border-2 transition", invalid && amount ? "border-rose-300" : "border-brand-600/70")}>
                  <span className="grid h-16 w-12 shrink-0 place-items-center border-r border-slate-200 bg-slate-50 text-xl font-bold text-slate-500 sm:w-16">৳</span>
                  <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} className="display h-16 min-w-0 flex-1 px-3 text-2xl font-extrabold outline-none sm:px-5 sm:text-3xl" />
                  <span className="mr-2 shrink-0 rounded-lg bg-slate-100 px-2 py-1.5 text-xs text-slate-500 sm:mr-3 sm:px-3 sm:text-sm">Remaining <b className="text-ink">{taka(Math.max(available - value, 0))}</b></span>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...chips, Math.floor(available)].map((chip, index, list) => (
                  <button key={`${chip}-${index}`} type="button" onClick={() => setAmount(String(chip))} className={cn("h-16 rounded-xl border text-lg font-bold transition active:scale-[0.98]", value === chip ? "border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600" : "border-slate-200 hover:bg-slate-50")}>
                    {taka(chip)}{index === list.length - 1 && <span className="block text-xs font-normal text-slate-400">Full balance</span>}
                  </button>
                ))}
              </div>
              <Field label="Send to" required>
                {methods.length ? (
                  <div className="space-y-2.5">
                    {!adding && methods.map((item) => (
                      <button key={item._id} type="button" onClick={() => setMethod(item._id)} className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition", method === item._id ? "border-brand-600 bg-brand-50/40 ring-1 ring-brand-600" : "border-slate-200 hover:bg-slate-50")}>
                        <MethodIcon method={item} />
                        <div className="min-w-0 flex-1"><p className="font-bold">{methodTitle(item)}</p><p className="text-sm text-slate-500">{methodSub(item)}</p></div>
                        <span className={cn("grid size-6 place-items-center rounded-full border-2", method === item._id ? "border-brand-600" : "border-slate-300")}>{method === item._id && <span className="size-3 rounded-full bg-brand-600" />}</span>
                      </button>
                    ))}
                    {adding ? (
                      <div className="rounded-2xl border border-slate-200 p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-2"><p className="font-bold">New pay method</p><button type="button" onClick={() => setAdding(false)} className="text-sm font-semibold text-slate-500">Use saved method</button></div><PayMethodForm form={newMethod} setForm={setNewMethod} errors={newMethodErrors} office={data.office} showDefault /></div>
                    ) : (
                      <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 pt-1 text-[15px] font-semibold text-brand-700"><Plus className="size-4" /> Add pay method</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-700"><CreditCard className="size-4" /></span><div><p className="font-bold">No pay method yet</p><p className="text-sm text-slate-500">Add one below to receive your money.</p></div></div>
                    <div className="rounded-2xl border border-slate-200 p-4 sm:p-5"><PayMethodForm form={newMethod} setForm={setNewMethod} errors={newMethodErrors} office={data.office} showDefault /></div>
                  </div>
                )}
              </Field>
              <Field label="Note"><Input value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} placeholder="Optional" /></Field>
              <Button size="lg" className="h-auto min-h-14 w-full py-3 text-base" disabled={invalid || (!inlineForm && !chosen)} loading={saving || submit.isPending} onClick={send}>
                <ArrowUp className="size-5" /> {inlineForm ? `Save & withdraw ${taka(value)}` : `Withdraw ${taka(value)} to ${methodTitle(chosen)}`}
              </Button>
              <button type="button" onClick={() => navigate("/")} className="block w-full text-center font-semibold text-slate-500">Cancel</button>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
