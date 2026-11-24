import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Inbox, Landmark, Loader2, X } from "lucide-react";
import { MFS, initial } from "@/lib/format";
import { authorPhoto, bookCover } from "@/lib/api";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
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
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="size-4 text-brand-600" />}
        <h3 className="text-sm font-bold">{title}</h3>
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
export function FieldInput({
  icon: Icon,
  label,
  required,
  error,
  hint,
  className,
  fieldClassName,
  ...inputProps
}) {
  return (
    <Field
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={fieldClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
        )}
        <Input {...inputProps} className={cn(Icon && "pl-10", className)} />
      </div>
    </Field>
  );
}
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

export const Spinner = ({ className }) => (
  <div className={cn("grid place-items-center py-16", className)}>
    <Loader2 className="size-6 animate-spin text-brand-600" />
  </div>
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
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {back && (
          <Link
            to={back}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
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
        "inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl bg-white shadow-2xl",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-full bg-white/80 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, photo, size = "size-10", className }) {
  const src = authorPhoto(photo);
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

export function Cover({ cover, className }) {
  const src = bookCover(cover);
  return src ? (
    <img
      src={src}
      alt=""
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

export function MethodIcon({ method, className }) {
  if (method?.mode === "mfs") {
    const mfs = MFS[method.mfsType];
    return (
      <div
        className={cn(
          "grid size-10 place-items-center rounded-xl text-xs font-black text-white",
          className,
        )}
        style={{ background: mfs?.color || "#64748b" }}
      >
        {(mfs?.label || "M")[0]}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700",
        className,
      )}
    >
      <Landmark className="size-4" />
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
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
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
