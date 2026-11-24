import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  ChevronLeft,
  Inbox,
  Landmark,
  Loader2,
  X,
} from "lucide-react";
import { MFS, initial } from "@/lib/format";
import { authorPhoto, bookCover } from "@/lib/api";
import { PageLoader } from "@/components/Loader";
import { imageUrl } from "@/lib/imageUrl";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

// Locks page scroll while a drawer / sheet is open (counts nested locks).
let locks = 0;
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.classList.add("scroll-locked");
    return () => {
      locks -= 1;
      if (!locks) document.body.classList.remove("scroll-locked");
    };
  }, [active]);
}

const VARIANTS = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700",
  outline: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  light: "bg-white text-brand-700 hover:bg-brand-50",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  ...props
}) {
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-sm",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        VARIANTS[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export const Card = ({ className, children, ...props }) => (
  <div className={cn("card", className)} {...props}>
    {children}
  </div>
);

export function CardHead({ icon: Icon, title, sub, right, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon className="size-4 shrink-0 text-brand-600" />}
        <h3 className="min-w-0 text-sm font-bold">{title}</h3>
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export function Field({ label, required, error, hint, children, className }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      {label && (
        <span className="text-sm font-semibold">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="block text-xs text-rose-600">{error}</span>
      ) : (
        hint && <span className="block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}

export const Input = ({ className, ...props }) => (
  <input className={cn("input", className)} {...props} />
);
export const Textarea = ({ className, ...props }) => (
  <textarea
    className={cn("input h-auto min-h-24 py-3", className)}
    {...props}
  />
);
export const Select = ({ className, children, ...props }) => (
  <select className={cn("input", className)} {...props}>
    {children}
  </select>
);

const TONES = {
  blue: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  gray: "bg-slate-100 text-slate-600",
  purple: "bg-violet-50 text-violet-700",
};
export const Badge = ({ tone = "gray", className, children }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
      TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export const STATUS = {
  due: { label: "Requested", tone: "orange" },
  paid: { label: "Paid", tone: "green" },
  cancel: { label: "Cancelled", tone: "red" },
};

// Kept for existing imports: the branded page loader (full screen when given min-h-screen).
export const Spinner = ({ className }) => (
  <PageLoader full={className?.includes("min-h-screen")} />
);

export function Empty({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  text,
  action,
}) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="size-6" />
      </div>
      <p className="font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-slate-500">{text}</p>}
      {action}
    </div>
  );
}

export const ErrorBox = ({ error }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
    {error}
  </div>
);

export function PageTitle({ title, back, right, sub }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <Link
            to={back}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100"
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}
        <div>
          <h1 className="display text-2xl font-bold text-navy sm:text-[28px]">{title}</h1>
          {sub && <p className="text-sm text-slate-500">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Tabs({ value, onChange, items, className }) {
  return (
    <div
      className={cn(
        "no-scrollbar inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition",
            value === item.value
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-ink",
          )}
        >
          {item.label}
          {item.count != null && (
            <span className="ml-1 text-slate-400">({item.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, children, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useScrollLock(open);
  if (!open) return null;
  // Phones: bottom sheet. sm and up: centred dialog (unchanged).
  return (
    <div
      className="fade-in fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center pt-10 sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "sheet-in relative w-full max-w-md rounded-t-3xl bg-white pb-safe shadow-2xl sm:rounded-3xl sm:pb-0",
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="absolute top-2 left-1/2 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-300/80 sm:hidden" />
          {onClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-white/80 text-slate-500 hover:bg-slate-100 active:bg-slate-200 sm:size-8"
            >
              <X className="size-4" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Avatar({ name, photo, size = "size-10", className }) {
  const src = imageUrl(photo, "", "/author");
  return src ? (
    <img
      src={src}
      alt=""
      className={cn(size, "rounded-full object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        size,
        "bn grid place-items-center rounded-full bg-brand-600 font-bold text-white",
        className,
      )}
    >
      {initial(name)}
    </div>
  );
}

export function Cover({ cover, className, style }) {
  const src = bookCover(cover);
  return src ? (
    <img
      src={src}
      alt=""
      style={style}
      className={cn("rounded-md object-cover shadow-sm", className)}
    />
  ) : (
    <div
      className={cn(
        "rounded-md bg-linear-to-br from-brand-100 to-slate-200",
        className,
      )}
    />
  );
}

// Logo tile for a pay method: bKash / Nagad logos, Rocket letter, bank and cash icons.
export function MethodIcon({ method, kind, className }) {
  const type =
    kind || (method?.mode === "mfs" ? method.mfsType : method?.mode) || "bank";
  if (type === "bkash" || type === "nagad")
    return (
      <div
        className={cn(
          "grid size-10 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1",
          className,
        )}
      >
        <img
          src={`/${type}.png`}
          alt={type}
          className="size-full object-contain"
        />
      </div>
    );
  if (type === "rocket")
    return (
      <div
        className={cn(
          "grid size-10 place-items-center rounded-xl text-sm font-black text-white",
          className,
        )}
        style={{ background: MFS.rocket.color }}
      >
        R
      </div>
    );
  if (type === "cash")
    return (
      <div
        className={cn(
          "grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700",
          className,
        )}
      >
        <Banknote className="size-5" />
      </div>
    );
  return (
    <div
      className={cn(
        "grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700",
        className,
      )}
    >
      <Landmark className="size-5" />
    </div>
  );
}

// Circular progress ring.
export function Ring({
  percent = 0,
  size = 64,
  stroke = 6,
  color = "#f59e0b",
  track = "#fde7c4",
  children,
}) {
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length - (length * value) / 100}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children ?? (
          <span className="text-xs font-bold">{Math.round(value)}%</span>
        )}
      </div>
    </div>
  );
}

export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:px-5">
      <span>
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
        {total}
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export const InfoRow = ({ label, value, className }) => (
  <div
    className={cn(
      "flex items-start justify-between gap-4 py-2 text-sm",
      className,
    )}
  >
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-semibold">{value ?? "—"}</span>
  </div>
);

// "est." tag for royalty worked out from the sale price (old sales without a saved royalty).
export const Est = ({ show }) =>
  show ? (
    <span
      title="Estimated from cover price × your royalty rate"
      className="ml-1 align-middle text-[10px] font-semibold text-amber-600"
    >
      est.
    </span>
  ) : null;
