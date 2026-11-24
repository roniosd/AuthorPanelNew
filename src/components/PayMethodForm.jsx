import { Landmark, Phone, User } from "lucide-react";
import { MFS } from "@/lib/format";
import { Field, FieldInput, Input, cn } from "@/components/ui";

export const KINDS = [
  { value: "bkash", label: "bKash", color: MFS.bkash.color },
  { value: "nagad", label: "Nagad", color: MFS.nagad.color },
  { value: "rocket", label: "Rocket", color: MFS.rocket.color },
  { value: "bank", label: "Bank" },
];

export const emptyMethod = (name = "") => ({ kind: "bkash", accountType: "personal", mfsNumber: "", accountTitle: name, bankName: "", accountNo: "", branch: "", routingNumber: "" });

// Form state → AuthorPaymentInfo body (POS /author-payment-info/add|edit).
export const toPayload = (form) =>
  form.kind === "bank"
    ? { mode: "bank", bankName: form.bankName.trim(), accountNo: form.accountNo.trim(), accountTitle: form.accountTitle.trim(), branch: form.branch.trim(), routingNumber: form.routingNumber.trim(), accountType: form.accountType === "current" ? "current" : "savings" }
    : { mode: "mfs", mfsType: form.kind, mfsNumber: form.mfsNumber.trim(), accountTitle: form.accountTitle.trim(), accountType: form.accountType === "agent" ? "agent" : "personal" };

export const fromMethod = (method) => ({ ...emptyMethod(), ...Object.fromEntries(Object.entries(method || {}).map(([key, value]) => [key, value ?? ""])), kind: method?.mode === "bank" ? "bank" : method?.mfsType || "bkash", accountType: method?.accountType || (method?.mode === "bank" ? "savings" : "personal") });

export const methodErrors = (form) => {
  const errors = {};
  if (!form.accountTitle.trim()) errors.accountTitle = "Account name is required.";
  if (form.kind === "bank") {
    if (!form.bankName.trim()) errors.bankName = "Bank name is required.";
    if (!/^\d{6,20}$/.test(form.accountNo.replace(/\s/g, ""))) errors.accountNo = "Enter a valid account number.";
  } else if (!/^01[3-9]\d{8}$/.test(form.mfsNumber.replace(/[\s-]/g, ""))) errors.mfsNumber = "Enter a valid 11-digit mobile number.";
  return errors;
};

function Choice({ active, onClick, children, className }) {
  return <button type="button" onClick={onClick} className={cn("rounded-xl border px-4 py-2.5 text-sm font-semibold transition", active ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/15" : "border-slate-200 hover:bg-slate-50", className)}>{children}</button>;
}

export default function PayMethodForm({ form, setForm, errors = {}, lockKind }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const isBank = form.kind === "bank";
  const label = KINDS.find((kind) => kind.value === form.kind)?.label;

  return (
    <div className="space-y-5">
      {!lockKind && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KINDS.map((kind) => (
            <button key={kind.value} type="button" onClick={() => setForm({ ...form, kind: kind.value, accountType: kind.value === "bank" ? "savings" : "personal" })} className={cn("flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold transition", form.kind === kind.value ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-600/15" : "border-slate-200 hover:bg-slate-50")}>
              {kind.color ? <span className="grid size-8 place-items-center rounded-lg text-xs font-black text-white" style={{ background: kind.color }}>{kind.label[0]}</span> : <Landmark className="size-6 text-slate-600" />}
              {kind.label}
            </button>
          ))}
        </div>
      )}

      {isBank ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Bank name" required error={errors.bankName} value={form.bankName} onChange={set("bankName")} placeholder="Dutch-Bangla Bank" />
          <Field label="Account type" required>
            <div className="grid grid-cols-2 gap-2">{["savings", "current"].map((type) => <Choice key={type} active={form.accountType === type} onClick={() => setForm({ ...form, accountType: type })} className="capitalize">{type}</Choice>)}</div>
          </Field>
          <FieldInput label="Account number" required error={errors.accountNo} inputMode="numeric" value={form.accountNo} onChange={set("accountNo")} placeholder="Account number" />
          <FieldInput label="Branch" value={form.branch} onChange={set("branch")} placeholder="Mirpur" />
          <FieldInput label="Routing number" inputMode="numeric" value={form.routingNumber} onChange={set("routingNumber")} placeholder="Optional" />
          <FieldInput label="Account name" required error={errors.accountTitle} value={form.accountTitle} onChange={set("accountTitle")} placeholder="Name on the account" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account type" required>
              <div className="grid grid-cols-2 gap-2">{["personal", "agent"].map((type) => <Choice key={type} active={form.accountType === type} onClick={() => setForm({ ...form, accountType: type })} className="capitalize">{type}</Choice>)}</div>
            </Field>
            <Field label={`${label} number`} required error={errors.mfsNumber}>
              <FieldInput icon={Phone} inputMode="tel" value={form.mfsNumber} onChange={set("mfsNumber")} placeholder="01XXXXXXXXX" />
            </Field>
          </div>
          <Field label="Account name" required error={errors.accountTitle}>
            <FieldInput icon={User} value={form.accountTitle} onChange={set("accountTitle")} className="bn" placeholder="Name on the account" />
          </Field>
        </>
      )}
    </div>
  );
}
