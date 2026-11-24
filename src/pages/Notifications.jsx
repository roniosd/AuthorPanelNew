import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { actions, useAction, useNotifications } from "@/lib/queries";
import { toast } from "@/lib/toast";
import NotificationList from "@/components/NotificationList";
import { Button, Card, Empty, ErrorBox, PageTitle, Pagination, Spinner, Tabs } from "@/components/ui";

// All notifications (the bell panel shows the latest 20).
export default function Notifications() {
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useNotifications({ category: category === "all" ? undefined : category, page, limit: 30 });
  const read = useAction(actions.readNotifications, ["notifications"]);

  return (
    <>
      <PageTitle title="Notifications" right={data?.unread > 0 && <Button variant="outline" loading={read.isPending} onClick={() => read.mutate(undefined, { onSuccess: () => toast.success("All notifications marked as read."), onError: (err) => toast.error(err) })}><Check className="size-4" /> Mark all as read</Button>} />
      <Card className="mx-auto max-w-3xl overflow-hidden pb-3">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <Tabs value={category} onChange={(value) => { setCategory(value); setPage(1); }} items={[{ value: "all", label: "All" }, { value: "sales", label: "Sales" }, { value: "withdraw", label: "Withdraw" }, { value: "advance", label: "Advance" }]} />
          {data?.unread > 0 && <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">{data.unread} new</span>}
        </div>
        {isLoading ? <Spinner /> : error ? <div className="p-4"><ErrorBox error={error.message} /></div> : !data.rows.length ? <Empty icon={Bell} title="You're all caught up" text="New sales, payments and updates will show here." /> : <NotificationList rows={data.rows} />}
        {data && <Pagination page={page} total={data.total} limit={data.limit} onChange={setPage} />}
      </Card>
    </>
  );
}
