import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { actions, useAction, useOnboarding, usePayMethods, useProfile } from "@/lib/queries";
import { authorName, fmtDate, methodSub, methodTitle } from "@/lib/format";
import { AuthShell, Stepper } from "@/components/AuthShell";
import PayMethodForm, { emptyMethod, methodErrors, toPayload } from "@/components/PayMethodForm";
import { AboutFields, PersonalFields, PhotoPicker, aboutPayload, checkPhoto, fromProfile, personalErrors, personalPayload } from "@/components/ProfileFields";
import { Avatar, Button, ErrorBox, Spinner, cn } from "@/components/ui";

const Heading = ({ title, sub, badge }) => (
  <div className="mb-8">
    <h1 className="flex items-center gap-3 text-3xl font-bold">{title}{badge && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{badge}</span>}</h1>
    {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
  </div>
);

function ReviewCard({ title, onEdit, rows }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-5 text-emerald-500" /> {title}</p>
        {onEdit && <button type="button" onClick={onEdit} className="text-xs font-semibold text-brand-600">Edit</button>}
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 py-1 text-xs"><span className="text-slate-500">{label}</span><span className="bn text-right font-semibold">{value || "—"}</span></div>
      ))}
    </div>
  );
}

// Onboarding steps after the password: Photo → Personal → Payment → About you → Review → Done.
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const onboarding = useOnboarding();
  const profile = useProfile();
  const methods = usePayMethods();
  const finish = useAction(actions.finishOnboarding);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(fromProfile());
  const [method, setMethod] = useState(emptyMethod(user?.name));
  const [methodId, setMethodId] = useState(null);
  const [photo, setPhoto] = useState({ preview: "", file: null, error: "", uploading: false, uploaded: false });
  const [showPhoto, setShowPhoto] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [agree, setAgree] = useState(false);
  const linked = onboarding.data?.linked !== false && !profile.isError;

  useEffect(() => {
    if (profile.data) {
      setForm(fromProfile(profile.data));
      setShowPhoto(profile.data.showPhoto !== false);
    }
  }, [profile.data]);

  if (onboarding.isLoading || profile.isLoading) return <Spinner className="min-h-screen" />;
  if (onboarding.data && !onboarding.data.needed && step < 7) return <Navigate to="/" replace />;

  const name = authorName(profile.data) || user?.name;
  const go = (next) => {
    setErrors({});
    setError("");
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const run = async (task, next) => {
    setSaving(true);
    setError("");
    try {
      await task();
      go(next);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = (file) => {
    const message = checkPhoto(file);
    if (message) return setPhoto((state) => ({ ...state, error: message }));
    setPhoto({ preview: URL.createObjectURL(file), file, error: "", uploading: false, uploaded: false });
  };

  const next = {
    1: () =>
      run(async () => {
        if (!linked) return;
        if (photo.file && !photo.uploaded) {
          const data = new FormData();
          data.append("file", photo.file);
          data.append("showPhoto", String(showPhoto));
          await actions.uploadPhoto(data);
          setPhoto((state) => ({ ...state, uploaded: true }));
        } else await actions.saveProfile({ showPhoto });
      }, 2),
    2: () => {
      if (!linked) return go(3);
      const found = personalErrors(form);
      if (Object.keys(found).length) return setErrors(found);
      run(() => actions.saveProfile(personalPayload(form)), 3);
    },
    3: () => {
      const found = methodErrors(method);
      if (Object.keys(found).length) return setErrors(found);
      run(async () => {
        const body = toPayload(method);
        const result = methodId ? await actions.editMethod({ id: methodId, ...body }) : await actions.addMethod(body);
        const id = methodId || result?.data?._id;
        if (id) {
          setMethodId(id);
          await actions.defaultMethod(id);
        }
        methods.refetch();
      }, 4);
    },
    4: () => run(() => (linked ? actions.saveProfile(aboutPayload(form)) : null), 5),
    5: () => run(() => finish.mutateAsync(), 7),
  };

  const social = [form.facebook && "Facebook", form.youtube && "YouTube", form.website && "Website"].filter(Boolean).join(", ");

  return (
    <AuthShell wide={step === 5}>
      <Stepper step={step === 7 ? 6 : step} />

      {step === 1 && (
        <>
          <Heading title="Add your photo" sub="Readers see this on your author page." />
          <PhotoPicker name={name} photo={profile.data?.photo} preview={photo.preview} onFile={choosePhoto} error={photo.error} showPhoto={showPhoto} onShowPhoto={setShowPhoto} />
        </>
      )}

      {step === 2 && (
        <>
          <Heading title="Personal information" />
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Avatar name={name} photo={profile.data?.photo} />
            <div className="min-w-0 flex-1">
              <p className="bn font-bold">{name}</p>
              <p className="truncate text-xs text-slate-500">{[profile.data?.en_author, profile.data?.email || user?.email].filter(Boolean).join(" · ")}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500"><Lock className="size-3" /> Set by Nobokothon</span>
          </div>
          <PersonalFields form={form} setForm={setForm} errors={errors} />
        </>
      )}

      {step === 3 && (
        <>
          <Heading title="How should we pay you?" sub="Royalty and withdraw money will be sent here." />
          <PayMethodForm form={method} setForm={setMethod} errors={errors} />
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700"><Info className="size-4" /> This will be your default payment method. You can add more later from Pay Method.</p>
        </>
      )}

      {step === 4 && (
        <>
          <Heading title="About you" badge="Optional" />
          <AboutFields form={form} setForm={setForm} />
        </>
      )}

      {step === 5 && (
        <>
          <Heading title="Check and finish" />
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewCard title="Account" onEdit={() => go(1)} rows={[["Password", "Set"], ["Photo", photo.uploaded || profile.data?.photo ? "Added" : "Not added"], ["Photo on website", showPhoto ? "Shown" : "Hidden"]]} />
            <ReviewCard title="Personal information" onEdit={() => go(2)} rows={[["Phone", form.phone], ["Date of birth", form.dob && fmtDate(form.dob)], ["Gender", form.gender], [form.idType === "NID" ? "NID number" : "Birth certificate", `•••• ${(form.idType === "NID" ? form.nidNumber : form.birthCertificateNumber).slice(-4)}`]]} />
            <ReviewCard title="Payment method" onEdit={() => go(3)} rows={[["Method", `${methodTitle(toPayload(method))} ${method.accountType}`], ["Number", methodSub(toPayload(method))], ["Account name", method.accountTitle]]} />
            <ReviewCard title="About you" onEdit={() => go(4)} rows={[["Bio", form.bio ? "Added" : "Not added"], ["Social links", social]]} />
          </div>
          <label className="mt-6 flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="size-4 accent-brand-600" />
            The information I gave is correct
          </label>
        </>
      )}

      {step === 7 && (
        <div className="grid place-items-center gap-4 py-10 text-center">
          <div className="grid size-28 place-items-center rounded-full bg-emerald-50"><div className="grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"><Check className="size-10" /></div></div>
          <h1 className="text-3xl font-bold">Your author panel is ready</h1>
          <p className="max-w-md text-sm text-slate-500">Thank you for completing your profile. You can now see your books, sales, royalty and withdraw from your dashboard.</p>
          <div className="flex flex-wrap justify-center gap-2">{["Password set", "Personal information", "Payment method", "About you"].map((item) => <span key={item} className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Check className="size-3" /> {item}</span>)}</div>
          <Button size="lg" className="mt-4" onClick={() => navigate("/", { replace: true })}>Go to dashboard <ArrowRight className="size-4" /></Button>
        </div>
      )}

      {step < 7 && (
        <div className="mt-8 space-y-4">
          {!linked && step !== 3 && step !== 5 && <ErrorBox error="Your website profile is not linked yet, so photo and personal details cannot be saved now. You can continue and add them later from Profile." />}
          {error && <ErrorBox error={error} />}
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={step === 1} onClick={() => go(step - 1)}><ArrowLeft className="size-4" /> Back</Button>
            <div className="flex items-center gap-2">
              {step === 4 && <Button variant="outline" onClick={() => go(5)}>Skip</Button>}
              <Button size="lg" loading={saving} disabled={step === 5 && !agree} onClick={next[step]} className={cn(step === 5 && "min-w-40")}>{step === 5 ? "Finish" : "Continue"} <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
