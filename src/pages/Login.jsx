import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { AuthShell, StepTitle } from "@/components/AuthShell";
import { Button, ErrorBox, Field } from "@/components/ui";

// Sign in, in the same layout as the onboarding screens.
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mx-auto max-w-xl pt-6 lg:pt-20">
        <StepTitle title="Sign in" sub="Welcome back to your Nobokothon author panel." />
        <form onSubmit={submit} className="space-y-6">
          {error && <ErrorBox error={error} />}
          <Field label="Email" required>
            <div className="relative"><Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" /><input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input h-14 pl-12" placeholder="you@example.com" autoComplete="email" /></div>
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
              <input type={show ? "text" : "password"} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input h-14 pr-12 pl-12" placeholder="Your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-ink">{show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
            </div>
          </Field>
          <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">Forgot password?</Link></div>
          <Button type="submit" loading={loading} className="h-14 w-full bg-linear-to-r from-brand-700 to-navy text-base shadow-xl shadow-navy/25">Sign in <ArrowRight className="size-5" /></Button>
        </form>
      </div>
    </AuthShell>
  );
}
