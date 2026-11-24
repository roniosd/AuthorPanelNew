import { ArrowRight, Check, ChevronLeft, Phone } from "lucide-react";
import { Button, cn } from "@/components/ui";

export const STEPS = ["Password", "Photo", "Personal", "Payment", "About you", "Review"];
const HELP = import.meta.env.VITE_HELP_PHONE;

// Two-column shell (design 28–34): book-cover collage on the left, form on the right.
export function AuthShell({ children, name, footer }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,42%)_1fr]">
      <aside className="relative hidden overflow-hidden bg-navy lg:block">
        <img src="/collage.jpg" alt="" className="absolute inset-0 size-full scale-110 object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-navy/20 via-navy/55 to-navy" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 shadow-xl"><img src="/logo.png" alt="নবকথন" className="h-12" /></div>
          <div className="space-y-4 text-white">
            <span className="inline-flex rounded-full bg-amber-400 px-3.5 py-1 text-sm font-bold text-navy">Welcome to the Nobokothon family</span>
            <h2 className="bn text-[42px] leading-tight font-bold">স্বাগতম,{name ? <><br />{name}</> : " লেখক"}</h2>
            <p className="max-w-md text-[17px] leading-relaxed text-white/75">A few short steps and your author panel is ready. You can stop any time; we save as you go.</p>
            {HELP && <p className="flex items-center gap-3 pt-4 text-white/80"><Phone className="size-4" /> Need help? <b className="text-white">{HELP}</b></p>}
          </div>
        </div>
      </aside>
      <main className="flex min-h-screen flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 md:px-14 lg:py-14">
        <img src="/logo.png" alt="নবকথন" className="mb-8 h-9 w-fit lg:hidden" />
        <div className="w-full max-w-3xl flex-1">{children}</div>
        {footer && <div className="mt-10 w-full max-w-3xl">{footer}</div>}
      </main>
    </div>
  );
}

export function Stepper({ step }) {
  return (
    <div className="mb-8 grid grid-cols-6 gap-1.5 sm:mb-12 sm:gap-3">
      {STEPS.map((label, index) => (
        <div key={label} className="space-y-3">
          <div className={cn("h-1.5 rounded-full", index < step ? "bg-emerald-500" : index === step ? "bg-brand-700" : "bg-slate-200")} />
          <p className={cn("flex items-center gap-1 truncate text-sm font-medium", index !== step && "max-sm:hidden", index < step ? "text-emerald-600" : index === step ? "font-semibold text-brand-700" : "text-slate-400")}>
            {index < step && <Check className="size-3.5" />}
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

export const StepTitle = ({ title, sub, badge }) => (
  <div className="mb-8">
    <h1 className="display flex flex-wrap items-center gap-3 text-3xl font-bold text-navy sm:text-[38px]">{title}{badge && <span className="rounded-full bg-slate-100 px-3 py-1 font-sans text-sm font-semibold text-slate-500">{badge}</span>}</h1>
    {sub && <p className="mt-2 text-base text-slate-500 sm:text-[17px]">{sub}</p>}
  </div>
);

// Bottom bar: Back (outlined) on the left, "Save and continue" on the right.
export function StepFooter({ onBack, onNext, loading, disabled, nextLabel = "Save and continue", extra }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {onBack ? <Button variant="outline" size="lg" className="h-14 shrink-0 px-4 text-base sm:px-7" onClick={onBack}><ChevronLeft className="size-5" /> Back</Button> : <span />}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {extra}
        <Button size="lg" loading={loading} disabled={disabled} onClick={onNext} className="h-14 bg-linear-to-r from-brand-700 to-navy px-5 text-base sm:px-8 shadow-xl shadow-navy/25 hover:from-navy hover:to-navy">{nextLabel} <ArrowRight className="size-5" /></Button>
      </div>
    </div>
  );
}
