const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export const taka = (value) => {
  const number = Number(value || 0);
  return `${number < 0 ? "−" : ""}৳${nf.format(Math.abs(number))}`;
};
export const num = (value) => nf.format(Number(value || 0));
export const fmtDate = (value) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—");
export const fmtMonth = (value) => new Date(value).toLocaleDateString("en-GB", { month: "short" });
export const ordinal = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return value || "—";
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${suffix}`;
};
export const mask = (value = "") => (String(value).length > 4 ? `${String(value).slice(0, 3)}••••${String(value).slice(-4)}` : value || "");
export const bookName = (book) => book?.nameInBangla || book?.nameInEnglish || "—";
export const authorName = (author) => author?.bn_author || author?.name || author?.en_author || "";
export const initial = (name = "") => (name.trim()[0] || "ল").toUpperCase();
export const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "শুভ সকাল" : hour < 17 ? "শুভ দুপুর" : hour < 20 ? "শুভ সন্ধ্যা" : "শুভ রাত্রি";
};

// Pay method helpers (AuthorPaymentInfo: mode bank/mfs, mfsType bkash/nagad/rocket).
export const MFS = { bkash: { label: "bKash", color: "#e2136e" }, nagad: { label: "Nagad", color: "#f6921e" }, rocket: { label: "Rocket", color: "#8c3494" } };
export const methodTitle = (m) => (!m ? "—" : m.mode === "bank" ? m.bankName || "Bank" : MFS[m.mfsType]?.label || "MFS");
export const methodSub = (m) => {
  if (!m) return "";
  const type = m.accountType ? ` · ${m.accountType[0].toUpperCase()}${m.accountType.slice(1)}` : "";
  return m.mode === "bank" ? `•••• ${String(m.accountNo || "").slice(-4)}${m.branch ? ` · ${m.branch} branch` : ""}` : `${mask(m.mfsNumber)}${type}`;
};

// "Seen" flags for one-time popups.
export const seen = (key) => localStorage.getItem(`seen:${key}`) === "1";
export const markSeen = (key) => localStorage.setItem(`seen:${key}`, "1");
