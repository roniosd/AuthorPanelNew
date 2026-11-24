import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useAction, usePayMethods, actions } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { methodSub, methodTitle } from "@/lib/format";
import PayMethodForm, { emptyMethod, fromMethod, methodErrors, toPayload } from "@/components/PayMethodForm";
import { Badge, Button, Card, Empty, ErrorBox, MethodIcon, Modal, PageTitle, Spinner } from "@/components/ui";

export default function PayMethods() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const { data = [], isLoading, error } = usePayMethods();
  const save = useAction(async ({ id, body }) => {
    const result = id ? await actions.editMethod({ id, ...body }) : await actions.addMethod(body);
    if (!id && !data.length && result?.data?._id) await actions.defaultMethod(result.data._id);
    return result;
  });
  const remove = useAction(actions.deleteMethod);
  const makeDefault = useAction(actions.defaultMethod);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMethod());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const open = (method) => {
    setEditing(method || "new");
    setForm(method ? fromMethod(method) : emptyMethod(user?.name));
    setErrors({});
    setMessage("");
  };
  useEffect(() => {
    if (params.get("add")) {
      open(null);
      setParams({}, { replace: true });
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    const found = methodErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await save.mutateAsync({ id: editing === "new" ? null : editing._id, body: toPayload(form) });
      setEditing(null);
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

  return (
    <>
      <PageTitle title="Pay Method" sub="Where Nobokothon sends your royalty and withdraw money." right={<Button onClick={() => open(null)}><Plus className="size-4" /> Add pay method</Button>} />
      {message && !editing && <div className="mb-4"><ErrorBox error={message} /></div>}
      {isLoading ? <Spinner /> : error ? <ErrorBox error={error.message} /> : !sorted.length ? (
        <Card><Empty icon={CreditCard} title="No pay method yet" text="Add bKash, Nagad, Rocket or a bank account to withdraw your money." action={<Button className="mt-2" onClick={() => open(null)}><Plus className="size-4" /> Add pay method</Button>} /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((method, index) => {
            const isDefault = method.isDefault || (index === 0 && !sorted.some((item) => item.isDefault));
            return (
              <Card key={method._id} className="flex items-center gap-4 p-5">
                <MethodIcon method={method} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold">{methodTitle(method)} {isDefault && <Badge tone="blue">Default</Badge>}</p>
                  <p className="truncate text-sm text-slate-500">{methodSub(method)}</p>
                  {method.accountTitle && <p className="bn truncate text-xs text-slate-400">{method.accountTitle}</p>}
                </div>
                <div className="flex gap-1">
                  {!isDefault && <button title="Make default" onClick={run(makeDefault, method._id)} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Star className="size-4" /></button>}
                  <button title="Edit" onClick={() => open(method)} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil className="size-4" /></button>
                  <button title="Delete" onClick={run(remove, method._id, "Delete this pay method?")} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} className="max-w-xl">
        <div className="space-y-5 p-6">
          <h2 className="text-xl font-bold">{editing === "new" ? "Add pay method" : "Edit pay method"}</h2>
          {message && <ErrorBox error={message} />}
          <PayMethodForm form={form} setForm={setForm} errors={errors} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            <Button className="flex-1" loading={save.isPending} onClick={submit}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
