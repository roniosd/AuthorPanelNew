import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { AuthShell, Stepper } from "@/components/AuthShell";
import PasswordFields, { passwordChecks } from "@/components/PasswordFields";
import { Button, ErrorBox } from "@/components/ui";

// Onboarding step 1 (also used for "forgot password"): the emailed link carries ?token=.
export default function SetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { resetPassword, login, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = passwordChecks(password, confirm).every((check) => check.ok);

  const submit = async (event) => {
    event.preventDefault();
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      logout();
      const email = result?.data?.email;
      if (email) {
        await login(email, password);
        navigate("/welcome", { replace: true });
      } else navigate("/login", { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return (
      <AuthShell>
        <h1 className="text-3xl font-bold">This link is not valid</h1>
        <p className="mt-2 text-sm text-slate-500">Open the latest link from your email, or ask for a new one.</p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline">Send a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Stepper step={0} />
      <h1 className="text-3xl font-bold">Set your password</h1>
      <p className="mt-1 mb-8 text-sm text-slate-500">You will use this password from now on. The temporary link stops working.</p>
      <form onSubmit={submit} className="space-y-6">
        {error && <ErrorBox error={error} />}
        <PasswordFields password={password} confirm={confirm} setPassword={setPassword} setConfirm={setConfirm} />
        <Button type="submit" size="lg" loading={loading} disabled={!valid} className="w-full">Continue <ArrowRight className="size-4" /></Button>
      </form>
    </AuthShell>
  );
}
