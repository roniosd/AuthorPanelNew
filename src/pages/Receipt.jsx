import { useParams } from "react-router-dom";
import { Camera, FileDown, Printer } from "lucide-react";
import { IMAGE_BASE } from "@/lib/api";
import { useAdvance, usePayout } from "@/lib/queries";
import { ReceiptCard } from "@/components/Receipts";
import { PrintPortal, printNow } from "@/components/Print";
import { Button, ErrorBox, PageTitle, Spinner } from "@/components/ui";

// Advance Receipt / Withdraw Receipt / Withdraw Request (designs 18, 20, 22).
// Download PDF and Print open the browser print dialog with only the receipt on one A5 page.
export default function Receipt() {
  const { kind, id } = useParams();
  const advance = useAdvance(kind === "advance" ? id : null);
  const payout = usePayout(kind === "withdraw" ? id : null);
  const query = kind === "advance" ? advance : payout;
  const item = query.data;
  const title = kind === "advance" ? "Advance Receipt" : item?.status === "paid" ? "Withdraw Receipt" : "Withdraw Request";

  return (
    <>
      <PageTitle
        title={title}
        back={kind === "advance" ? "/royalty-history" : "/withdraw-history"}
        right={item && (
          <div className="flex gap-2">
            {item.proof && <a href={`${IMAGE_BASE}/payout/${item.proof}`} target="_blank" rel="noreferrer"><Button variant="outline"><Camera className="size-4" /> Payment proof</Button></a>}
            <Button variant="outline" onClick={printNow}><FileDown className="size-4" /> Download PDF</Button>
            <Button variant="outline" onClick={printNow}><Printer className="size-4" /> Print</Button>
          </div>
        )}
      />
      {query.isLoading ? <Spinner /> : query.error ? <ErrorBox error={query.error.message} /> : item && (
        <>
          <ReceiptCard item={item} kind={kind} />
          <PrintPortal size="A5"><ReceiptCard item={item} kind={kind} print /></PrintPortal>
        </>
      )}
    </>
  );
}
