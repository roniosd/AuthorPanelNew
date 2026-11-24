import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth, onboardingSkipped } from "@/lib/auth";
import { useOnboarding } from "@/lib/queries";
import Layout from "@/components/Layout";
import { Spinner } from "@/components/ui";
import Login from "@/pages/Login";

const page = (load) => lazy(load);
const ForgotPassword = page(() => import("@/pages/ForgotPassword"));
const SetPassword = page(() => import("@/pages/SetPassword"));
const Onboarding = page(() => import("@/pages/Onboarding"));
const Dashboard = page(() => import("@/pages/Dashboard"));
const Books = page(() => import("@/pages/Books"));
const BookDetails = page(() => import("@/pages/BookDetails"));
const Sales = page(() => import("@/pages/Sales"));
const RoyaltyHistory = page(() => import("@/pages/RoyaltyHistory"));
const Withdraw = page(() => import("@/pages/Withdraw"));
const WithdrawHistory = page(() => import("@/pages/WithdrawHistory"));
const PayMethods = page(() => import("@/pages/PayMethods"));
const Profile = page(() => import("@/pages/Profile"));
const Notifications = page(() => import("@/pages/Notifications"));
const Receipt = page(() => import("@/pages/Receipt"));
const ViewPanel = page(() => import("@/pages/ViewPanel"));

// Signed-in pages; new authors are sent to the onboarding first.
function Private({ children }) {
  const { token, viewOnly } = useAuth();
  const location = useLocation();
  const onboarding = useOnboarding(Boolean(token));
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (onboarding.isLoading) return <Spinner className="min-h-screen" />;
  if (onboarding.data?.needed && !viewOnly && !onboardingSkipped(token)) return <Navigate to="/welcome" replace />;
  return children;
}

export default function App() {
  const { token } = useAuth();
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <Routes>
        <Route path="/view" element={<ViewPanel />} />
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<SetPassword />} />
        <Route path="/welcome" element={token ? <Onboarding /> : <Navigate to="/login" replace />} />
        <Route element={<Private><Layout /></Private>}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="sales" element={<Sales />} />
          <Route path="royalty-history" element={<RoyaltyHistory />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="withdraw-history" element={<WithdrawHistory />} />
          <Route path="pay-method" element={<PayMethods />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="receipt/:kind/:id" element={<Receipt />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
