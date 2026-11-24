import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";
import { Button, ErrorBox, FieldInput } from "@/components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
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
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-1 mb-8 text-sm text-slate-500">
        Welcome back to your Nobokothon author panel.
      </p>
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorBox error={error} />}
        <FieldInput
          label="Email"
          required
          icon={Mail}
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FieldInput
          label="Password"
          required
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
          placeholder="Your password"
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
