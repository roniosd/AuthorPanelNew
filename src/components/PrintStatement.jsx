import { useState } from "react";
import { FileText } from "lucide-react";
import { getAll } from "@/lib/api";
import { useMe } from "@/lib/queries";
import { PrintPortal } from "@/components/Print";
import { Button } from "@/components/ui";

/**
 * "Download statement / PDF" button: loads every row of a list, then prints a clean A4 statement
 * (logo, author, period, table, totals). columns = [[label, (row) => value, alignRight?]].
 */
export default function PrintStatement({ title, url, params, columns, period, total, label = "PDF" }) {
  const me = useMe();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      setRows(await getAll(url, params));
      setTimeout(() => window.print(), 80);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button variant="outline" loading={loading} onClick={run}><FileText className="size-4" /> {label}</Button>
      {rows && (
        <PrintPortal>
          <div className="text-[12px] text-ink">
            <div className="mb-4 flex items-end justify-between border-b-2 border-brand-700 pb-3">
              <img src="/logo.png" alt="নবকথন" className="h-10" />
              <div className="text-right"><p className="text-lg font-bold">{title}</p><p className="bn text-slate-500">{me.name} · {period}</p></div>
            </div>
            <table className="w-full border-collapse">
              <thead><tr className="bg-navy text-white">{columns.map(([head, , right]) => <th key={head} className={`px-2 py-1.5 ${right ? "text-right" : "text-left"}`}>{head}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={index} className="border-b border-slate-200">{columns.map(([head, value, right]) => <td key={head} className={`bn px-2 py-1.5 ${right ? "text-right" : ""}`}>{value(row)}</td>)}</tr>)}</tbody>
              {total && <tfoot><tr className="border-t-2 border-brand-700 font-bold"><td className="px-2 py-2" colSpan={columns.length - 1}>Total · {rows.length} rows</td><td className="px-2 py-2 text-right">{total(rows)}</td></tr></tfoot>}
            </table>
            <p className="mt-6 text-center text-[10px] text-slate-400">Nobokothon Prokashoni · Generated {new Date().toLocaleString("en-GB")}</p>
          </div>
        </PrintPortal>
      )}
    </>
  );
}
