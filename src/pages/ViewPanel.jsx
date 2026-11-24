import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/Loader";

// Opened from the POS "View panel" button: /view#token=… starts a read-only session in this tab.
export default function ViewPanel() {
  const { startView } = useAuth();
  const [state, setState] = useState("loading");
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", "/view");
    if (!token) return setState("missing");
    startView(token);
    setState("ready");
  }, [startView]);
  if (state === "ready") return <Navigate to="/" replace />;
  if (state === "missing") return <div className="grid min-h-screen place-items-center bg-page p-6 text-center"><div><p className="text-lg font-bold">This view link is not valid.</p><p className="text-sm text-slate-500">Open the author again from the POS and click “View panel”.</p></div></div>;
  return <PageLoader full />;
}
