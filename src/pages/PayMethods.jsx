import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { actions, useAction, usePayMethods, useSummary } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { methodNumber, methodTitle, methodType } from "@/lib/format";
import PayMethodForm, { emptyMethod, fromMethod, methodErrors, toPayload } from "@/components/PayMethodForm";
import { Button, Card, ErrorBox, MethodIcon, PageTitle, Spinner, cn } from "@/components/ui";

function MethodCard({ method, isDefault, onEdit, onDelete, onDefault }) {
  const cash = method.mode === "cash";
  return (
    <Card className={cn("flex flex-col p-6", isDefault && "border-brand-600 ring-1 ring-brand-600")}>
      <div className="flex items-center gap-3"><MethodIcon method={method} className="size-12" /><div><p className="text-lg font-bold">{method.mode === "bank" ? method.bankName : methodTitle(method)}</p><p className="text-sm text-slate-500">{[methodType(method), method.mode === "bank" && method.branch ? `${method.branch} branch` : ""].filter(Boolean).join(" · ")}</p></div></div>
      {cash ? (
        <>
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-700">Collect from Nobokothon office</p>
          <p className="mt-4 text-xs text-slate-400">Who collects</p>
          <p className="bn">{method.collector === "other" ? `${method.collectorName || ""} · ${method.collectorPhone || ""}` : "Myself"}</p>
        </>
      ) : (
        <>
          <p className="display mt-5 text-2xl font-bold tracking-wide">{methodNumber(method)}</p>
          <p className="mt-4 text-xs text-slate-400">Account name</p>
          <p className="bn">{method.accountTitle || "—"}</p>
        </>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        {isDefault ? <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700"><Check className="size-4" /> Default</span> : <button onClick={onDefault} className="text-[15px] font-semibold text-brand-700">Set as default</button>}
        <div className="edit-only flex gap-2">
          <button title="Edit" onClick={onEdit} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil className="size-4" /></button>
          <button title="Delete" onClick={onDelete} className="grid size-10 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button>
        </div>
      </div>
    </Card>
  );
}

// Pay Method (designs 13, 14): saved methods on the left, add / edit panel on the right.
export default function PayMethods() {
  const { user, viewOnly } = useAuth();
  const [params, setParams] = useSearchParams();
  const { data = [], isLoading, error } = usePayMethods();
  const { data: summary } = useSummary();
  const panel = useRef(null);
  const save = useAction(async ({ id, body, isDefault }) => {
    const result = id ? await actions.editMethod({ id, ...body }) : await actions.addMethod(body);
    const savedId = id || result?.data?._id;
    if (savedId && (isDefault || !data.length)) await actions.defaultMethod(savedId);
    return result;
  });
  const remove = useAction(actions.deleteMethod);
  const makeDefault = useAction(actions.defaultMethod);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMethod(user?.name));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const reset = () => {
    setEditing(null);
    setForm(emptyMethod(user?.name));
    setErrors({});
  };
  const edit = (method) => {
    setEditing(method);
    setForm(fromMethod(method));
    setErrors({});
    panel.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (params.get("add")) {
      panel.current?.scrollIntoView({ behavior: "smooth" });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const submit = async () => {
    const found = methodErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setMessage("");
    try {
      await save.mutateAsync({ id: editing?._id, body: toPayload(form), isDefault: form.isDefault });
      reset();
    } catch (err) {
      setMessage(errorText(err));
    }
  };
  const run = (mutation, value, confirmText) => async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await mutation.mutateAsync(value);
    } catch (err) {
      setMessage(errorText(err));
    }
  };

  const sorted = [...data].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
  const hasDefault = sorted.some((item) => item.isDefault);

  return (
    <>
      <PageTitle title="Pay Method" />
      {message && <div className="mb-4"><ErrorBox error={message} /></div>}
      <div className={cn("grid gap-6", !viewOnly && "xl:grid-cols-[1fr_minmax(0,560px)]")}>
        <div>
          {isLoading ? <Spinner /> : error ? <ErrorBox error={error.message} /> : !sorted.length ? (
            <Card className="grid place-items-center gap-2 p-12 text-center"><p className="font-semibold">No pay method yet</p><p className="text-sm text-slate-500">Add bKash, Nagad, a bank account or cash pickup on the right.</p></Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {sorted.map((method, index) => (
                <MethodCard key={method._id} method={method} isDefault={method.isDefault || (!hasDefault && index === 0)} onEdit={() => edit(method)} onDefault={run(makeDefault, method._id)} onDelete={run(remove, method._id, (method.isDefault || (!hasDefault && index === 0)) && sorted.length > 1 ? "This is your default method. Make another one default first, or delete anyway?" : "Delete this pay method?")} />
              ))}
            </div>
          )}
        </div>
        <Card ref={panel} className="edit-only h-fit space-y-6 p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">{editing ? <Pencil className="size-5" /> : <Plus className="size-5" />}</span><h2 className="text-2xl font-bold">{editing ? "Edit pay method" : "Add pay method"}</h2></div>
          <PayMethodForm form={form} setForm={setForm} errors={errors} office={summary?.office} showDefault />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button variant="outline" size="lg" onClick={reset}>Cancel</Button>
            <Button size="lg" loading={save.isPending} onClick={submit}><Check className="size-4" /> Save pay method</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
