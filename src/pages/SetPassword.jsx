import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { toast } from "@/lib/toast";
import { AuthShell, StepFooter, StepTitle, Stepper } from "@/components/AuthShell";
import PasswordFields, { passwordChecks } from "@/components/PasswordFields";
import { ErrorBox } from "@/components/ui";

// Onboarding step 1 (design 28), also used by "forgot password": the emailed link carries ?token=.
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

  const submit = async () => {
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      logout();
      toast.success("Password set.");
      const email = result?.data?.email;
      if (email) {
        await login(email, password);
        navigate("/welcome", { replace: true });
      } else navigate("/login", { replace: true });
    } catch (err) {
      setError(errorText(err));
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return (
      <AuthShell>
        <StepTitle title="This link is not valid" sub="Open the latest link from your email, or ask for a new one." />
        <Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline">Send a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell footer={<StepFooter onNext={submit} loading={loading} disabled={!valid} />}>
      <Stepper step={0} />
      <StepTitle title="Set your password" sub="You will use this password from now on. The temporary code stops working." />
      {error && <div className="mb-5"><ErrorBox error={error} /></div>}
      <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <PasswordFields password={password} confirm={confirm} setPassword={setPassword} setConfirm={setConfirm} />
        <button type="submit" className="hidden" />
      </form>
    </AuthShell>
  );
}
