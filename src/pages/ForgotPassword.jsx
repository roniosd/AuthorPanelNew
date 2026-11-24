import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MailCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { AuthShell, StepTitle } from "@/components/AuthShell";
import { Button, ErrorBox, Field } from "@/components/ui";

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
      <div className="mx-auto max-w-xl pt-6 lg:pt-20">
        {state.sent ? (
          <div className="space-y-5">
            <div className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="size-8" /></div>
            <StepTitle title="Check your email" sub={`If ${email} belongs to an author account, a link to set a new password is on its way.`} />
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <StepTitle title="Forgot password" sub="We will email you a link to set a new password." />
            {state.error && <ErrorBox error={state.error} />}
            <Field label="Email" required><div className="relative"><Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input h-14 pl-12" placeholder="you@example.com" /></div></Field>
            <Button type="submit" loading={state.loading} className="h-14 w-full bg-linear-to-r from-brand-700 to-navy text-base">Send link <ArrowRight className="size-5" /></Button>
            <Link to="/login" className="block text-center text-sm font-semibold text-slate-500 hover:text-ink">Back to sign in</Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
