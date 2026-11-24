import { useState } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { Field, cn } from "@/components/ui";

export const passwordChecks = (password, confirm) => [
  { label: "At least 8 characters", ok: password.length >= 8 },
  { label: "Has a number", ok: /\d/.test(password) },
  { label: "Both match", ok: Boolean(password) && password === confirm },
];

function Secret({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
      <input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input pr-11 pl-10" autoComplete="new-password" />
      <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-ink">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
    </div>
  );
}

// New password + confirm with strength bar and checklist (onboarding step 1).
export default function PasswordFields({ password, confirm, setPassword, setConfirm }) {
  const checks = passwordChecks(password, confirm);
  const score = [password.length >= 8, /\d/.test(password), /[A-Z]/.test(password) && /[a-z]/.test(password), /[^A-Za-z0-9]/.test(password) || password.length >= 12].filter(Boolean).length;
  const strength = ["Too weak", "Weak", "Fair", "Good", "Strong"][score];
  return (
    <div className="space-y-5">
      <Field label="New password" required>
        <Secret value={password} onChange={setPassword} placeholder="Enter a new password" />
        {password && (
          <div className="flex items-center gap-3 pt-1">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full rounded-full transition-all", score >= 3 ? "bg-emerald-500" : score === 2 ? "bg-amber-400" : "bg-rose-500")} style={{ width: `${(score / 4) * 100}%` }} /></div>
            <span className={cn("text-xs font-semibold", score >= 3 ? "text-emerald-600" : "text-slate-500")}>{strength}</span>
          </div>
        )}
      </Field>
      <Field label="Confirm password" required>
        <Secret value={confirm} onChange={setConfirm} placeholder="Type it again" />
      </Field>
      <div className="grid gap-2 sm:grid-cols-3">
        {checks.map((check) => (
          <span key={check.label} className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold", check.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-400")}>
            <Check className="size-3.5" /> {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
