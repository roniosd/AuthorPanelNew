import { useEffect, useRef, useState } from "react";
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
import { Avatar, Spinner, Tabs, cn } from "@/components/ui";
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
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center gap-2 border-b border-slate-100 px-4 pt-8 pb-6 text-center">
        <div className="rounded-full bg-linear-to-br from-brand-600 via-brand-500 to-amber-400 p-0.75">
          <Avatar
            name={name}
            photo={photo}
            size="size-24"
            className="border-4 border-white text-3xl"
          />
        </div>
        <div className="">
          <p className="bn mt-1 text-xl leading-tight font-bold">
            {name}
          </p>
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
                  : "text-slate-700 hover:bg-slate-100",
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
    <div className="absolute top-14 right-0 z-40 flex max-h-[80vh] w-[min(440px,92vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="display flex items-center gap-2 text-xl font-bold">
          Notifications{" "}
          {data?.unread > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 font-sans text-xs font-bold text-white">
              {data.unread} new
            </span>
          )}
        </p>
        {data?.unread > 0 && (
          <button
            onClick={() => read.mutate()}
            className="flex items-center gap-1 text-sm font-semibold text-brand-700"
          >
            <Check className="size-4" /> Mark all as read
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
  const location = useLocation();
  useEffect(() => {
    if (!bell) return;
    const close = (event) =>
      !bellRef.current?.contains(event.target) && setBell(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [bell]);
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
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-60 grid size-8 place-items-center rounded-full bg-white"
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
        <div className="sticky top-0 z-30 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950">
          <Eye className="size-4" /> Admin view · read only — nothing can be
          changed here
          <button
            onClick={logout}
            className="rounded-full bg-amber-950/10 px-3 py-0.5 hover:bg-amber-950/20"
          >
            Exit view
          </button>
        </div>
      )}
      <header
        className={cn(
          "sticky z-20 flex h-19 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8",
          viewOnly ? "top-9" : "top-0",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/">
            <img src="/logo.png" alt="নবকথন" className="h-10 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBell(!bell)}
              className={cn(
                "relative grid size-11 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50",
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
          <div className="relative">
            <button
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2.5  py-1.5 pr-3 pl-1.5 hover:bg-slate-50"
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
                <span className="text-[11px]  text-blue-600 font-bold block">Author</span>
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
            {menu && (
              <div
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                onMouseLeave={() => setMenu(false)}
              >
                <Link
                  to="/profile"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  <User className="size-4" /> Profile
                </Link>
                <Link
                  to="/pay-method"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  <CreditCard className="size-4" /> Pay Method
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
      {!viewOnly && <Popups summary={summary} />}
    </div>
  );
}
