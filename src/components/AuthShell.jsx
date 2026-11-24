import { Check } from "lucide-react";
import { cn } from "@/components/ui";

export const STEPS = ["Password", "Photo", "Personal", "Payment", "About you", "Review"];

// Two-column shell used by sign in, password and onboarding screens.
export function AuthShell({ children, wide }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,38%)_1fr]">
      <aside className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,.07)_0_70px,transparent_70px_96px),repeating-linear-gradient(25deg,rgba(255,255,255,.05)_0_110px,transparent_110px_150px)]" />
        <div className="absolute inset-0 bg-linear-to-b from-navy/30 via-navy/60 to-navy" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="inline-flex w-fit rounded-2xl bg-white px-4 py-2.5 shadow-lg"><img src="/logo.png" alt="নবকথন" className="h-9" /></div>
          <div className="space-y-3 text-white">
            <span className="inline-flex rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-navy">Welcome to the Nobokothon family</span>
            <p className="bn max-w-sm text-2xl leading-snug font-bold">আপনার বই, বিক্রি আর রয়্যালটি — সব এক জায়গায়।</p>
            <p className="max-w-sm text-sm text-white/60">See your books, sales, royalty and withdraw money any time.</p>
          </div>
        </div>
      </aside>
      <main className="flex flex-col bg-white px-5 py-8 md:px-14 lg:py-12">
        <img src="/logo.png" alt="নবকথন" className="mb-8 h-8 w-fit lg:hidden" />
        <div className={cn("w-full", wide ? "max-w-3xl" : "max-w-xl")}>{children}</div>
      </main>
    </div>
  );
}

export function Stepper({ step }) {
  return (
    <div className="mb-10 grid grid-cols-6 gap-2">
      {STEPS.map((label, index) => (
        <div key={label} className="space-y-2">
          <div className={cn("h-1 rounded-full", index < step ? "bg-emerald-500" : index === step ? "bg-brand-600" : "bg-slate-200")} />
          <p className={cn("flex items-center gap-1 truncate text-[11px] font-semibold", index < step ? "text-emerald-600" : index === step ? "text-brand-700" : "text-slate-400")}>
            {index < step && <Check className="size-3" />}
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
