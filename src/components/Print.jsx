import { createPortal } from "react-dom";

/**
 * Renders children straight under <body> for printing only. With the print rules in index.css the
 * printed page shows just this content (no sidebar, header or empty pages). Browsers save it as PDF.
 */
export function PrintPortal({ children, size = "A4" }) {
  if (typeof document === "undefined") return null;
  return createPortal(<div className="print-root" data-size={size}>{children}</div>, document.body);
}

export const printNow = () => window.print();
