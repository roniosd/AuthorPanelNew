import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Banknote,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Coins,
  CreditCard,
  Eye,
  LayoutGrid,
  LogOut,
  Menu,
  ReceiptText,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  actions,
  useAction,
  useMe,
  useNotifications,
  useSummary,
} from "@/lib/queries";
import { authorName } from "@/lib/format";
import { Avatar, Spinner, Tabs, cn, useScrollLock } from "@/components/ui";
import NotificationList from "@/components/NotificationList";
import Popups from "@/components/Popups";

export const MENU = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/books", label: "My Books", icon: BookOpen },
  { to: "/sales", label: "Sales History", icon: ReceiptText },
  { to: "/royalty-history", label: "Royalty History", icon: Coins },
  { to: "/withdraw", label: "Withdraw", icon: Banknote },
  { to: "/withdraw-history", label: "Withdraw History", icon: Clock3 },
  { to: "/pay-method", label: "Pay Method", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
];

function Sidebar({ name, photo, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain pb-safe">
      <div className="flex flex-col items-center gap-2 border-b border-slate-100 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-6 text-center">
        <div className="rounded-full bg-linear-to-br from-brand-600 via-brand-500 to-amber-400 p-0.75">
          <Avatar
            name={name}
            photo={photo}
            size="size-24"
            className="border-4 border-white text-3xl"
          />
        </div>
        <div className="">
          <p className="bn mt-1 text-xl leading-tight font-bold">{name}</p>
          <p className="text-xs text-blue-600 font-bold">Author</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {MENU.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] font-medium transition",
                isActive
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "text-slate-700 hover:bg-slate-100 active:bg-slate-100",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-100"
        >
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </div>
  );
}

// Bell panel (design 16): latest 20, tabs, Today / Yesterday / Earlier, mark all as read.
function NotificationPanel({ onClose }) {
  const [category, setCategory] = useState("all");
  const { data, isLoading } = useNotifications({
    category: category === "all" ? undefined : category,
    limit: 20,
  });
  const read = useAction(actions.readNotifications, ["notifications"]);
  return (
    <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 flex  flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:top-14 sm:right-0 max-h-[80vh]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
        <p className="display flex min-w-0 items-center gap-2 text-lg font-bold sm:text-xl">
          <span className="truncate">Notifications</span>
          {data?.unread > 0 && (
            <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 font-sans text-xs font-bold whitespace-nowrap text-white">
              {data.unread} new
            </span>
          )}
        </p>
        {data?.unread > 0 && (
          <button
            type="button"
            disabled={read.isPending}
            onClick={() => read.mutate()}
            className="-mr-2 flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-brand-700 transition hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50 sm:text-sm"
          >
            <Check className="size-4" />
            <span className="sm:hidden">Read all</span>
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        )}
      </div>
      <div className="border-b border-slate-100 px-5 py-3">
        <Tabs
          value={category}
          onChange={setCategory}
          items={[
            { value: "all", label: "All" },
            { value: "sales", label: "Sales" },
            { value: "withdraw", label: "Withdraw" },
            { value: "advance", label: "Advance" },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-3">
        {isLoading ? (
          <Spinner />
        ) : !data?.rows.length ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No notifications yet.
          </p>
        ) : (
          <NotificationList rows={data.rows} onOpen={onClose} compact />
        )}
      </div>
      <Link
        to="/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-1 border-t border-slate-100 py-4 text-[15px] font-semibold text-brand-700"
      >
        See all notifications <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}

export default function Layout() {
  const { user, logout, viewOnly } = useAuth();
  const { data: summary } = useSummary();
  const { data: notes } = useNotifications({ limit: 1 });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();
  useScrollLock(open);
  useEffect(() => {
    if (!bell) return;
    const close = (event) =>
      !bellRef.current?.contains(event.target) && setBell(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [bell]);
  // Tapping outside the account menu closes it (touch has no mouse-leave).
  useEffect(() => {
    if (!menu) return;
    const close = (event) =>
      !menuRef.current?.contains(event.target) && setMenu(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);
  // App-like navigation: new page starts at the top, open panels close.
  // Layout effect so it runs before a page's own scrollIntoView (e.g. /pay-method?add=1).
  useLayoutEffect(() => {
    setOpen(false);
    setBell(false);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  const me = useMe();
  const name = me.name || user?.name || "";
  const photo = me.photo;

  return (
    <div
      className="min-h-screen lg:pl-64"
      data-view-only={viewOnly || undefined}
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <Sidebar name={name} photo={photo} onLogout={logout} />
      </aside>
      {open && (
        <div
          className="fade-in fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="drawer-in relative h-full w-72 max-w-[85vw] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-3 z-10 grid size-9 place-items-center rounded-full bg-slate-100 active:bg-slate-200"
            >
              <X className="size-4" />
            </button>
            <Sidebar
              name={name}
              photo={photo}
              onNavigate={() => setOpen(false)}
              onLogout={logout}
            />
          </aside>
        </div>
      )}
      {viewOnly && (
        <div className="sticky top-0 z-30 flex h-9 items-center justify-center gap-3 bg-amber-400 px-4 text-xs font-semibold text-amber-950 sm:text-sm">
          <Eye className="size-4 shrink-0" />
          <span className="min-w-0 truncate">
            Admin view · read only — nothing can be changed here
          </span>
          <button
            onClick={logout}
            className="shrink-0 rounded-full bg-amber-950/10 px-3 py-0.5 hover:bg-amber-950/20"
          >
            Exit view
          </button>
        </div>
      )}
      <header
        className={cn(
          "sticky z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:h-19 md:px-8",
          viewOnly
            ? "top-9 h-16"
            : "top-0 h-[calc(4rem+env(safe-area-inset-top))] pt-safe md:pt-0",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 active:bg-slate-100 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/">
            <img src="/logo.png" alt="নবকথন" className="h-8 w-auto md:h-10" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBell(!bell)}
              className={cn(
                "relative grid size-10 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 sm:size-11",
                (bell || location.pathname === "/notifications") &&
                  "border-brand-200 bg-brand-50",
              )}
            >
              <Bell className="size-5" />
              {notes?.unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {notes.unread > 9 ? "9+" : notes.unread}
                </span>
              )}
            </button>
            {bell && <NotificationPanel onClose={() => setBell(false)} />}
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2 rounded-xl py-1.5 pr-1.5 pl-1 hover:bg-slate-50 active:bg-slate-100 sm:gap-2.5 sm:pr-3 sm:pl-1.5"
            >
              <Avatar
                name={name}
                photo={photo}
                size="size-8"
                className="text-sm"
              />
              <span className="hidden text-left sm:block">
                {" "}
                {name}
                <span className="text-[11px]  text-blue-600 font-bold block">
                  Author
                </span>
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
            {menu && (
              <div
                className="dialog-in absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                onMouseLeave={() => setMenu(false)}
              >
                <Link
                  to="/profile"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 active:bg-slate-100 sm:py-2.5"
                >
                  <User className="size-4" /> Profile
                </Link>
                <Link
                  to="/pay-method"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 active:bg-slate-100 sm:py-2.5"
                >
                  <CreditCard className="size-4" /> Pay Method
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 active:bg-rose-50 sm:py-2.5"
                >
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-8">
        <Outlet />
      </main>
      {!viewOnly && <Popups summary={summary} />}
    </div>
  );
}
