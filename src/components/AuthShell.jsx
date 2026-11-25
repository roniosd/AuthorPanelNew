import { ArrowRight, Check, ChevronLeft, Phone } from "lucide-react";
import { Button, cn } from "@/components/ui";

export const STEPS = ["Password", "Photo", "Personal", "Payment", "About you", "Review"];
const HELP = import.meta.env.VITE_HELP_PHONE;

// Two-column shell (design 28–34): book-cover collage on the left, form on the right.
// Phone: navy collage header with the greeting, form on a white rounded sheet below it.
export function AuthShell({ children, name, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-navy lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,42%)_1fr] lg:bg-white">
      <header className="relative shrink-0 overflow-hidden bg-navy px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-12 text-white sm:px-6 lg:hidden">
        <img src="/collage.jpg" alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-60" />
        <div className="absolute inset-0 bg-linear-to-b from-navy/30 via-navy/70 to-navy" />
        <div className="relative">
          <div className="inline-flex w-fit rounded-xl bg-white px-3 py-1.5 shadow-lg"><img src="/logo.png" alt="নবকথন" className="h-7" /></div>
          <h2 className="bn mt-5 text-2xl leading-snug font-bold">স্বাগতম{name ? `, ${name}` : ""}</h2>
          <p className="mt-1 text-sm text-white/75">{name ? "Welcome to the Nobokothon family" : "Nobokothon author panel"}</p>
        </div>
      </header>
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
      <main className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-white px-5 pt-6 sm:px-6 sm:pt-8 md:px-14 lg:mt-0 lg:min-h-screen lg:rounded-none lg:py-14">
        <div className="w-full max-w-3xl flex-1">{children}</div>
        {footer ? <div className="sticky bottom-0 -mx-5 mt-8 w-auto max-w-3xl bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 md:mx-0 md:px-0 lg:static lg:mt-10 lg:w-full lg:pt-0 lg:pb-0">{footer}</div> : <div className="h-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden" />}
      </main>
    </div>
  );
}

const barTone = (index, step) => (index < step ? "bg-emerald-500" : index === step ? "bg-brand-700" : "bg-slate-200");

export function Stepper({ step }) {
  return (
    <>
    <div className="mb-6 sm:hidden">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">{step < STEPS.length ? `Step ${step + 1} of ${STEPS.length}` : "All steps done"}</span>
        <span className={step < STEPS.length ? "text-brand-700" : "text-emerald-600"}>{STEPS[step] || "Done"}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">{STEPS.map((label, index) => <div key={label} className={cn("h-1.5 rounded-full", barTone(index, step))} />)}</div>
    </div>
    <div className="mb-12 grid grid-cols-6 gap-3 max-sm:hidden">
      {STEPS.map((label, index) => (
        <div key={label} className="space-y-3">
          <div className={cn("h-1.5 rounded-full", barTone(index, step))} />
          <p className={cn("flex items-center gap-1 truncate text-sm font-medium", index < step ? "text-emerald-600" : index === step ? "font-semibold text-brand-700" : "text-slate-400")}>
            {index < step && <Check className="size-3.5" />}
            {label}
          </p>
        </div>
      ))}
    </div>
    </>
  );
}

export const StepTitle = ({ title, sub, badge }) => (
  <div className="mb-6 sm:mb-8">
    <h1 className="display flex flex-wrap items-center gap-3 text-2xl font-bold text-navy sm:text-[38px]">{title}{badge && <span className="rounded-full bg-slate-100 px-3 py-1 font-sans text-sm font-semibold text-slate-500">{badge}</span>}</h1>
    {sub && <p className="mt-1.5 text-sm text-slate-500 sm:mt-2 sm:text-[17px]">{sub}</p>}
  </div>
);

// Bottom bar: Back (outlined) on the left, "Save and continue" on the right. Phone: icon-only Back, full-width Save.
export function StepFooter({ onBack, onNext, loading, disabled, nextLabel = "Save and continue", extra }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {onBack ? <Button variant="outline" size="lg" aria-label="Back" className="h-12 w-12 shrink-0 px-0 text-base sm:h-14 sm:w-auto sm:px-7" onClick={onBack}><ChevronLeft className="size-5" /> <span className="max-sm:hidden">Back</span></Button> : <span className="max-sm:hidden" />}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
        {extra}
        <Button size="lg" loading={loading} disabled={disabled} onClick={onNext} className="h-12 flex-1 bg-linear-to-r from-brand-700 to-navy px-5 text-base shadow-xl shadow-navy/25 hover:from-navy hover:to-navy sm:h-14 sm:flex-none sm:px-8">{nextLabel} <ArrowRight className="size-5" /></Button>
      </div>
    </div>
  );
}
