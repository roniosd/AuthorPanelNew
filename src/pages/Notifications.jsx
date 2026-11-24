import { useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Bell, BookOpen, CheckCheck, Coins, HandCoins, Wallet } from "lucide-react";
import { useAction, useNotifications, actions } from "@/lib/queries";
import { fmtDateTime } from "@/lib/format";
import { Button, Card, Empty, ErrorBox, PageTitle, Pagination, Spinner, Tabs, cn } from "@/components/ui";

// Picks an icon from the notification text (Notification model has no category field).
const kindOf = (row) => {
  const text = `${row.title} ${row.message}`.toLowerCase();
  if (/cancel|বাতিল/.test(text)) return { icon: Ban, tone: "bg-rose-50 text-rose-600" };
  if (/advance|অগ্রিম/.test(text)) return { icon: HandCoins, tone: "bg-amber-50 text-amber-600" };
  if (/withdraw|payout|উইথড্র|পেমেন্ট/.test(text)) return { icon: Wallet, tone: "bg-emerald-50 text-emerald-600" };
  if (/royalty|রয়্যালটি/.test(text)) return { icon: Coins, tone: "bg-violet-50 text-violet-600" };
  if (/edition|সংস্করণ|book|বই|sold|বিক্রি/.test(text)) return { icon: BookOpen, tone: "bg-brand-50 text-brand-600" };
  return { icon: Bell, tone: "bg-slate-100 text-slate-500" };
};

export default function Notifications() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useNotifications({ unread: tab === "unread" ? "true" : undefined, page, limit: 20 });
  const read = useAction(actions.readNotifications, ["notifications"]);

  return (
    <>
      <PageTitle title="Notifications" right={data?.unread > 0 && <Button variant="outline" loading={read.isPending} onClick={() => read.mutate([])}><CheckCheck className="size-4" /> Mark all as read</Button>} />
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4"><Tabs value={tab} onChange={(value) => { setTab(value); setPage(1); }} items={[{ value: "all", label: "All" }, { value: "unread", label: "Unread", count: data?.unread }]} /></div>
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !data.rows.length ? <Empty icon={Bell} title="You're all caught up" text="New sales, payments and updates will show here." /> : (
          <div className="divide-y divide-slate-100">
            {data.rows.map((row) => {
              const kind = kindOf(row);
              const body = (
                <>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", kind.tone)}><kind.icon className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    {row.title && <p className="bn text-sm font-bold">{row.title}</p>}
                    <p className="bn text-sm text-slate-600">{row.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{fmtDateTime(row.createdAt)}</p>
                  </div>
                  {!row.isRead && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand-600" />}
                </>
              );
              const className = cn("flex w-full gap-4 px-5 py-4 text-left transition hover:bg-slate-50/70", !row.isRead && "bg-brand-50/40");
              const markRead = () => !row.isRead && read.mutate([row._id]);
              return row.link?.startsWith("/") ? <Link key={row._id} to={row.link} onClick={markRead} className={className}>{body}</Link> : <button key={row._id} onClick={markRead} className={className}>{body}</button>;
            })}
          </div>
        )}
        {data && <Pagination page={page} total={data.total} limit={data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
