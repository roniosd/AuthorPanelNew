import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Banknote,
  Bell,
  BookOpen,
  ChevronDown,
  Clock3,
  Coins,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  ReceiptText,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNotifications, useSummary } from "@/lib/queries";
import { authorName } from "@/lib/format";
import { Avatar, cn } from "@/components/ui";
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
        <div className="rounded-full bg-linear-to-br from-brand-600 to-amber-400 p-0.75">
          <Avatar
            name={name}
            photo={photo}
            size="size-20"
            className="border-4 border-white text-2xl"
          />
        </div>
        <p className="bn text-[15px] leading-tight font-bold">{name}</p>
        <p className="text-xs text-slate-400">Author</p>
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
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100",
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

export default function Layout() {
  const { user, logout } = useAuth();
  const { data: summary } = useSummary();
  const { data: notes } = useNotifications({ limit: 1 });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const name = authorName(summary?.author) || user?.name || "";
  const photo = summary?.author?.photo || user?.avatar;

  return (
    <div className="min-h-screen lg:pl-64">
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
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/">
            <img src="/logo.png" alt="নবকথন" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className={cn(
              "relative grid size-10 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50",
              location.pathname === "/notifications" && "bg-brand-50",
            )}
          >
            <Bell className="size-4" />
            {notes?.unread > 0 && (
              <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {notes.unread > 9 ? "9+" : notes.unread}
              </span>
            )}
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2.5 rounded-xl py-1.5 pr-3 pl-1.5 hover:bg-slate-50"
            >
              <Avatar
                name={name}
                photo={photo}
                size="size-8"
                className="text-sm"
              />
              <span className="hidden text-left sm:block">
                <span className="bn block text-sm leading-tight font-bold">
                  {name}
                <span className="text-[11px] text-slate-400 block">Author</span>
                </span>
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
      <Popups summary={summary} />
    </div>
  );
}
