import { useState } from "react";
import { toast } from "@/lib/toast";
import {
  Coins,
  Download,
  FileText,
  Library,
  ReceiptText,
  Search,
  Undo2,
  Copy as Copies,
} from "lucide-react";
import { useBooks, useSales } from "@/lib/queries";
import { downloadCsv, getAll } from "@/lib/api";
import {
  bookName,
  dateShort,
  num,
  ordinal,
  taka,
  timeOnly,
} from "@/lib/format";
import DateFilter, { periodText, rangeOf } from "@/components/DateFilter";
import PrintStatement from "@/components/PrintStatement";
import {
  Button,
  Card,
  Cover,
  Empty,
  ErrorBox,
  PageTitle,
  Pagination,
  Select,
  Spinner,
  cn,
  Est,
} from "@/components/ui";

const Stat = ({ icon: Icon, label, value, sub, tone }) => (
  <Card className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-11 ${tone}`}
    >
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-extrabold sm:text-xl">
        {value}{" "}
        {sub && (
          <span className="text-xs font-normal text-slate-500">{sub}</span>
        )}
      </p>
    </div>
  </Card>
);

const Col = ({ label, children, className }) => (
  <div className={cn("min-w-0 md:text-right", className)}>
    <p className="text-[11px] text-slate-400">{label}</p>
    <div className="font-bold">{children}</div>
  </div>
);

// Sales History (design 05) = Invoice History of all the author's books.
export default function Sales() {
  const [filter, setFilter] = useState({ preset: "all" });
  const [bookId, setBookId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const books = useBooks();
  const query = {
    ...rangeOf(filter),
    bookId: bookId || undefined,
    status: "sold",
    q: q || undefined,
  };
  const { data, isLoading, error, isFetching } = useSales({
    ...query,
    page,
    limit: 30,
  });
  const change = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = await getAll("/author-panel/sales", query);
      downloadCsv(
        "sales-history",
        [
          [(row) => dateShort(row.date), "Date"],
          ["invoiceNo", "Invoice"],
          [(row) => bookName(row.book), "Book"],
          [(row) => ordinal(row.edition), "Edition"],
          ["coverPrice", "MRP"],
          ["quantity", "Quantity"],
          ["rate", "Royalty %"],
          ["royalty", "Royalty"],
        ],
        rows,
      );
      toast.success("Excel file downloaded.");
    } catch (err) {
      toast.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Sales History"
        right={
          <div className="no-print flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={q}
                onChange={(event) => change(setQ)(event.target.value)}
                className="input h-11 w-full pl-10 text-sm sm:w-64"
                placeholder="Search by book"
              />
            </div>
            <Button variant="outline" loading={exporting} onClick={exportExcel}>
              <Download className="size-4" /> Excel
            </Button>
            <PrintStatement
              title="Sales History"
              url="/author-panel/sales"
              params={query}
              period={periodText(filter)}
              columns={[
                ["Date", (row) => dateShort(row.date)],
                ["Invoice", (row) => `#${row.invoiceNo || "—"}`],
                ["Book", (row) => bookName(row.book)],
                ["Ed.", (row) => ordinal(row.edition)],
                ["Qty", (row) => row.quantity, true],
                ["Royalty", (row) => taka(row.royalty), true],
              ]}
              total={(rows) =>
                taka(
                  rows.reduce((sum, row) => sum + Number(row.royalty || 0), 0),
                )
              }
            />
          </div>
        }
      />
      <Card className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <DateFilter value={filter} onChange={change(setFilter)} />
          <div className="relative w-full sm:w-auto">
            <Library className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Select
              className="h-10 w-full pl-9 text-sm sm:w-56"
              value={bookId}
              onChange={(event) => change(setBookId)(event.target.value)}
            >
              <option value="">All books</option>
              {(books.data || []).map((book) => (
                <option key={book._id} value={book._id}>
                  {bookName(book)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <Stat
          icon={ReceiptText}
          label="Orders"
          value={num(data?.summary.orders)}
          tone="bg-brand-50 text-brand-600"
        />
        <Stat
          icon={Copies}
          label="Copies sold"
          value={num(data?.summary.copies)}
          tone="bg-violet-50 text-violet-600"
        />
        <Stat
          icon={Coins}
          label="Royalty earned"
          value={
            <span className="text-emerald-700">
              {taka(data?.summary.royalty)}
            </span>
          }
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="p-4">
            <ErrorBox error={error.message} />
          </div>
        ) : !data.rows.length ? (
          <Empty icon={ReceiptText} title="No sales in this period" />
        ) : (
          <div
            className={cn(
              "divide-y divide-slate-100",
              isFetching && "opacity-60",
            )}
          >
            {data.rows.map((row) => {
              return (
                <div
                  key={row._id}
                  className="grid grid-cols-4 items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[auto_1fr_120px_80px_80px_80px_90px] md:gap-4 md:px-5"
                >
                  <Cover
                    cover={row.book?.cover}
                    className="row-span-2 h-14 w-10 md:row-span-1"
                  />
                  <div className="col-span-3 min-w-0 md:col-span-1">
                    <p className="bn truncate font-bold">
                      {bookName(row.book)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Edition {ordinal(row.edition)}
                      {row.invoiceNo ? ` · #${row.invoiceNo}` : ""}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-baseline gap-2 md:col-span-1 md:block">
                    <p className="text-sm font-bold">{dateShort(row.date)}</p>
                    <p className="text-xs text-slate-400">
                      {timeOnly(row.date)}
                    </p>
                  </div>
                  <Col label="MRP">{taka(row.coverPrice)}</Col>
                  <Col label="Quantity">{row.quantity}</Col>
                  <Col label="Royalty %">{row.rate ? `${row.rate}%` : "—"}</Col>
                  <Col label="Royalty">
                    <span className="text-emerald-600">
                      {row.royaltyFree ? "Free" : taka(row.royalty)}
                    </span>
                    <Est show={row.estimated} />
                  </Col>
                </div>
              );
            })}
          </div>
        )}
        {data && (
          <Pagination
            page={page}
            total={data.total}
            limit={data.limit}
            onChange={setPage}
          />
        )}
      </Card>
    </>
  );
}
