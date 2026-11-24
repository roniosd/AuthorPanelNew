import { Building2, Check, Phone, User } from "lucide-react";
import { Field, Input, MethodIcon, Select, cn } from "@/components/ui";

export const KINDS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash" },
];

export const BANKS = ["AB Bank PLC", "Bangladesh Krishi Bank", "Bank Asia PLC", "BRAC Bank PLC", "City Bank PLC", "Dhaka Bank PLC", "Dutch-Bangla Bank PLC", "Eastern Bank PLC", "EXIM Bank PLC", "First Security Islami Bank PLC", "IFIC Bank PLC", "Islami Bank Bangladesh PLC", "Jamuna Bank PLC", "Janata Bank PLC", "Mercantile Bank PLC", "Mutual Trust Bank PLC", "National Bank PLC", "NCC Bank PLC", "One Bank PLC", "Prime Bank PLC", "Pubali Bank PLC", "Rupali Bank PLC", "Shahjalal Islami Bank PLC", "Social Islami Bank PLC", "Sonali Bank PLC", "Southeast Bank PLC", "Standard Chartered Bank", "Trust Bank PLC", "United Commercial Bank PLC", "Uttara Bank PLC"];

export const emptyMethod = (name = "") => ({ kind: "bkash", accountType: "personal", mfsNumber: "", accountTitle: name, bankName: "", accountNo: "", confirmAccountNo: "", branch: "", routingNumber: "", collector: "self", collectorName: "", collectorPhone: "", isDefault: true });

// Form state → AuthorPaymentInfo body (POS /author-payment-info/add|edit).
export const toPayload = (form) => {
  if (form.kind === "cash") return { mode: "cash", collector: form.collector, collectorName: form.collectorName.trim(), collectorPhone: form.collectorPhone.trim(), accountTitle: form.accountTitle.trim() };
  if (form.kind === "bank") return { mode: "bank", bankName: form.bankName.trim(), accountNo: form.accountNo.replace(/\s/g, ""), accountTitle: form.accountTitle.trim(), branch: form.branch.trim(), routingNumber: form.routingNumber.trim(), accountType: form.accountType === "current" ? "current" : "savings" };
  return { mode: "mfs", mfsType: form.kind, mfsNumber: form.mfsNumber.replace(/[\s-]/g, ""), accountTitle: form.accountTitle.trim(), accountType: form.accountType === "agent" ? "agent" : "personal" };
};

export const fromMethod = (method) => {
  const base = { ...emptyMethod(), ...Object.fromEntries(Object.entries(method || {}).map(([key, value]) => [key, value ?? ""])) };
  const kind = method?.mode === "bank" ? "bank" : method?.mode === "cash" ? "cash" : method?.mfsType || "bkash";
  return { ...base, kind, confirmAccountNo: method?.accountNo || "", collector: method?.collector || "self", isDefault: Boolean(method?.isDefault), accountType: method?.accountType || (kind === "bank" ? "savings" : "personal") };
};

export const methodErrors = (form) => {
  const errors = {};
  if (form.kind === "cash") {
    if (form.collector === "other") {
      if (!form.collectorName.trim()) errors.collectorName = "Name is required.";
      if (!/^01[3-9]\d{8}$/.test(form.collectorPhone.replace(/[\s-]/g, ""))) errors.collectorPhone = "Enter a valid mobile number.";
    }
    return errors;
  }
  if (!form.accountTitle.trim()) errors.accountTitle = "Account name is required.";
  if (form.kind === "bank") {
    if (!form.bankName.trim()) errors.bankName = "Bank name is required.";
    if (!form.branch.trim()) errors.branch = "Branch is required.";
    if (!/^\d{6,20}$/.test(form.accountNo.replace(/\s/g, ""))) errors.accountNo = "Enter a valid account number.";
    if (form.accountNo.replace(/\s/g, "") !== form.confirmAccountNo.replace(/\s/g, "")) errors.confirmAccountNo = "Account numbers don't match.";
    if (form.routingNumber && !/^\d{9}$/.test(form.routingNumber.trim())) errors.routingNumber = "Routing number has 9 digits.";
  } else if (!/^01[3-9]\d{8}$/.test(form.mfsNumber.replace(/[\s-]/g, ""))) errors.mfsNumber = "Enter a valid 11-digit mobile number.";
  return errors;
};

const Choice = ({ active, onClick, children, className }) => <button type="button" onClick={onClick} className={cn("h-12 rounded-xl border text-[15px] font-semibold transition", active ? "border-navy bg-brand-50 text-navy ring-1 ring-navy" : "border-slate-200 text-slate-600 hover:bg-slate-50", className)}>{children}</button>;
const Radio = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={cn("flex h-12 items-center gap-3 rounded-xl border px-4 text-[15px] font-medium transition", active ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600" : "border-slate-200 hover:bg-slate-50")}>
    <span className={cn("grid size-5 place-items-center rounded-full border-2", active ? "border-brand-600" : "border-slate-300")}>{active && <span className="size-2.5 rounded-full bg-brand-600" />}</span>
    {children}
  </button>
);

export function OfficeCard({ office }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
      <Building2 className="size-5 shrink-0 text-emerald-700" />
      <div><p className="font-semibold text-emerald-800">Nobokothon office</p><p className="text-sm text-emerald-900/70">{[office?.address, office?.hours].filter(Boolean).join(" · ") || "Office address and hours are shared when your money is ready."}</p></div>
    </div>
  );
}

/**
 * Pay method form (designs 13, 14, 31).
 * layout="tiles": big logo tiles (onboarding); layout="list": two-column type buttons (Pay Method page).
 */
export default function PayMethodForm({ form, setForm, errors = {}, layout = "list", office, showDefault }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const pick = (kind) => setForm({ ...form, kind, accountType: kind === "bank" ? "savings" : "personal" });
  const label = KINDS.find((kind) => kind.value === form.kind)?.label || "bKash";
  const matched = form.confirmAccountNo && form.accountNo.replace(/\s/g, "") === form.confirmAccountNo.replace(/\s/g, "");

  return (
    <div className="space-y-6">
      {layout === "tiles" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KINDS.map((kind) => (
            <button key={kind.value} type="button" onClick={() => pick(kind.value)} className={cn("relative flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold transition", form.kind === kind.value ? "border-navy ring-1 ring-navy" : "border-slate-200 hover:bg-slate-50")}>
              {form.kind === kind.value && <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full border-2 border-navy"><span className="size-2 rounded-full bg-navy" /></span>}
              <MethodIcon kind={kind.value} className="border-0 bg-transparent" />
              {kind.label}
            </button>
          ))}
        </div>
      ) : (
        <Field label="Type" required>
          <div className="grid grid-cols-2 gap-3">
            {KINDS.map((kind) => (
              <button key={kind.value} type="button" onClick={() => pick(kind.value)} className={cn("flex h-16 items-center gap-3 rounded-xl border px-4 text-[15px] font-bold transition", form.kind === kind.value ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600" : "border-slate-200 hover:bg-slate-50")}>
                <MethodIcon kind={kind.value} className="size-9 border-0 bg-transparent" /> {kind.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {form.kind === "cash" && (
        <>
          <OfficeCard office={office} />
          <Field label="Who will collect" required>
            <div className="grid grid-cols-2 gap-3"><Radio active={form.collector === "self"} onClick={() => setForm({ ...form, collector: "self" })}>Myself</Radio><Radio active={form.collector === "other"} onClick={() => setForm({ ...form, collector: "other" })}>Someone else</Radio></div>
          </Field>
          <div className={cn("grid gap-4 sm:grid-cols-2", form.collector !== "other" && "pointer-events-none opacity-50")}>
            <Field label="Name" error={errors.collectorName}><Input value={form.collectorName} onChange={set("collectorName")} placeholder="Full name" disabled={form.collector !== "other"} /></Field>
            <Field label="Phone" error={errors.collectorPhone}><Input inputMode="tel" value={form.collectorPhone} onChange={set("collectorPhone")} placeholder="01X XXXX XXXX" disabled={form.collector !== "other"} /></Field>
          </div>
        </>
      )}

      {form.kind === "bank" && (
        <>
          <Field label="Bank name" required error={errors.bankName}>
            <input list="bd-banks" value={form.bankName} onChange={set("bankName")} className="input" placeholder="Type to search banks" />
            <datalist id="bd-banks">{BANKS.map((bank) => <option key={bank} value={bank} />)}</datalist>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account type" required><Select value={form.accountType} onChange={set("accountType")}><option value="savings">Savings</option><option value="current">Current</option></Select></Field>
            <Field label="Branch" required error={errors.branch}><Input value={form.branch} onChange={set("branch")} placeholder="Mirpur" /></Field>
          </div>
          <Field label="Account holder name" required error={errors.accountTitle} hint="Exactly as written in the bank account"><Input value={form.accountTitle} onChange={set("accountTitle")} placeholder="Name on the account" /></Field>
          <Field label="Account number" required error={errors.accountNo}><Input inputMode="numeric" value={form.accountNo} onChange={set("accountNo")} placeholder="Account number" /></Field>
          <Field label="Confirm account number" required error={errors.confirmAccountNo}>
            <Input inputMode="numeric" value={form.confirmAccountNo} onChange={set("confirmAccountNo")} placeholder="Type it again" className={cn(matched && "border-emerald-500 focus:border-emerald-500")} />
            {matched && <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="size-3.5" /> Account numbers match</span>}
          </Field>
          <Field label="Routing number" error={errors.routingNumber}><Input inputMode="numeric" value={form.routingNumber} onChange={set("routingNumber")} placeholder="Optional, 9 digits" /></Field>
        </>
      )}

      {!["bank", "cash"].includes(form.kind) && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {layout === "tiles" ? (
              <Field label="Account type" required><div className="grid grid-cols-2 gap-2">{["personal", "agent"].map((type) => <Choice key={type} active={form.accountType === type} onClick={() => setForm({ ...form, accountType: type })} className="capitalize">{type}</Choice>)}</div></Field>
            ) : null}
            <Field label={`${label} number`} required error={errors.mfsNumber}>
              <div className="relative"><Phone className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" /><input inputMode="tel" value={form.mfsNumber} onChange={set("mfsNumber")} className="input pl-11" placeholder="01X XXXX XXXX" /></div>
            </Field>
            {layout !== "tiles" && <Field label="Account type" required><Select value={form.accountType} onChange={set("accountType")}><option value="personal">Personal</option><option value="agent">Agent</option></Select></Field>}
          </div>
          <Field label="Account name" required error={errors.accountTitle}>
            <div className="relative"><User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" /><input value={form.accountTitle} onChange={set("accountTitle")} className="input bn pl-11" placeholder="Name on the account" /></div>
          </Field>
        </>
      )}

      {showDefault && (
        <label className="flex items-center gap-3 text-[15px]">
          <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} className="size-5 accent-brand-600" />
          Set as my default pay method
        </label>
      )}
    </div>
  );
}
