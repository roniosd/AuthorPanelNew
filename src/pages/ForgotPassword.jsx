import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";
import { Button, ErrorBox, FieldInput } from "@/components/ui";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ loading: false, sent: false, error: "" });

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, sent: false, error: "" });
    try {
      await forgotPassword(email.trim());
      setState({ loading: false, sent: true, error: "" });
    } catch (err) {
      setState({ loading: false, sent: false, error: errorText(err) });
    }
  };

  return (
    <AuthShell>
      {state.sent ? (
        <div className="space-y-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="size-7" /></div>
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="text-sm text-slate-500">If <b>{email}</b> belongs to an author account, a link to set a new password is on its way.</p>
          <Link to="/login" className="inline-block text-sm font-semibold text-brand-600 hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-500">We will email you a link to set a new password.</p>
          </div>
          {state.error && <ErrorBox error={state.error} />}
          <FieldInput label="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <Button type="submit" loading={state.loading} className="w-full" size="lg">Send link</Button>
          <Link to="/login" className="block text-center text-sm font-semibold text-slate-500 hover:text-ink">Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
