import { useEffect, useSyncExternalStore } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Trash2, X, XCircle } from "lucide-react";
import { errorText } from "@/lib/api";

/**
 * Small, dependency-free notifications with the react-hot-toast API:
 *   toast.success("Saved"), toast.error(err), toast.info(...), toast.warning(...), toast.loading(...),
 *   toast.promise(task, { loading, success, error }), toast.dismiss(id)
 * plus a SweetAlert-style confirm:  if (!(await confirmDialog({ title, text }))) return;
 * <Toaster /> is mounted once in main.jsx and renders both.
 */

let toasts = [];
let dialog = null;
let counter = 0;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => ({ toasts, dialog });
let lastSnap = snapshot();
const getSnapshot = () => (lastSnap.toasts === toasts && lastSnap.dialog === dialog ? lastSnap : (lastSnap = snapshot()));

const DURATION = { success: 3000, error: 4500, info: 3500, warning: 4000, loading: Infinity };
const timers = new Map();

function dismiss(id) {
  if (id == null) {
    timers.forEach(clearTimeout);
    timers.clear();
    toasts = [];
  } else {
    clearTimeout(timers.get(id));
    timers.delete(id);
    toasts = toasts.filter((item) => item.id !== id);
  }
  emit();
}

function show(type, message, options = {}) {
  const id = options.id ?? `t${++counter}`;
  const text = type === "error" && typeof message !== "string" ? errorText(message) : message;
  const item = { id, type, message: text, title: options.title };
  toasts = toasts.some((row) => row.id === id) ? toasts.map((row) => (row.id === id ? item : row)) : [...toasts, item].slice(-4);
  clearTimeout(timers.get(id));
  const duration = options.duration ?? DURATION[type];
  if (Number.isFinite(duration)) timers.set(id, setTimeout(() => dismiss(id), duration));
  emit();
  return id;
}

export const toast = Object.assign((message, options) => show("info", message, options), {
  success: (message, options) => show("success", message, options),
  error: (message, options) => show("error", message, options),
  info: (message, options) => show("info", message, options),
  warning: (message, options) => show("warning", message, options),
  loading: (message, options) => show("loading", message, options),
  dismiss,
  promise: async (task, { loading = "Please wait…", success, error } = {}) => {
    const id = show("loading", loading);
    try {
      const result = await (typeof task === "function" ? task() : task);
      show("success", typeof success === "function" ? success(result) : success || "Done", { id });
      return result;
    } catch (err) {
      show("error", typeof error === "function" ? error(err) : error || err, { id });
      throw err;
    }
  },
});

// SweetAlert-style confirm. Resolves true when confirmed.
export function confirmDialog({ title = "Are you sure?", text = "", confirmText = "Yes, continue", cancelText = "Cancel", tone = "danger" } = {}) {
  return new Promise((resolve) => {
    const close = (value) => {
      dialog = null;
      emit();
      resolve(value);
    };
    dialog = { title, text, confirmText, cancelText, tone, close };
    emit();
  });
}

const STYLE = {
  success: { icon: CheckCircle2, color: "text-emerald-600", bar: "bg-emerald-500" },
  error: { icon: XCircle, color: "text-rose-600", bar: "bg-rose-500" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bar: "bg-amber-500" },
  info: { icon: Info, color: "text-brand-600", bar: "bg-brand-600" },
  loading: { icon: Loader2, color: "text-brand-600 animate-spin", bar: "bg-brand-600" },
};

function ToastItem({ item }) {
  const { icon: Icon, color, bar } = STYLE[item.type] || STYLE.info;
  return (
    <div role={item.type === "error" ? "alert" : "status"} className="toast-in pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-3.5 pr-10 pl-4 shadow-[0_10px_30px_-8px_rgba(15,27,61,.25)] sm:w-[380px]">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        {item.title && <p className="text-sm font-bold text-ink">{item.title}</p>}
        <p className="bn text-sm leading-snug font-medium text-slate-700">{item.message}</p>
      </div>
      {item.type !== "loading" && (
        <button type="button" aria-label="Close" onClick={() => dismiss(item.id)} className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function ConfirmBox({ dialog: box }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && box.close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [box]);
  const danger = box.tone === "danger";
  const Icon = danger ? Trash2 : AlertTriangle;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => box.close(false)}>
      <div role="alertdialog" aria-modal="true" className="dialog-in w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className={`mx-auto mb-4 grid size-16 place-items-center rounded-full ${danger ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}><Icon className="size-8" /></div>
        <p className="display text-xl font-bold text-navy">{box.title}</p>
        {box.text && <p className="bn mt-2 text-sm text-slate-500">{box.text}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => box.close(false)} className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink transition hover:bg-slate-50 active:scale-[0.98]">{box.cancelText}</button>
          <button type="button" autoFocus onClick={() => box.close(true)} className={`h-12 rounded-xl text-sm font-semibold text-white transition outline-none focus-visible:ring-4 active:scale-[0.98] ${danger ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500/25" : "bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-500/25"}`}>{box.confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export function Toaster() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (
    <>
      <div aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[80] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-5 sm:items-end">
        {state.toasts.map((item) => <ToastItem key={item.id} item={item} />)}
      </div>
      {state.dialog && <ConfirmBox dialog={state.dialog} />}
    </>
  );
}
