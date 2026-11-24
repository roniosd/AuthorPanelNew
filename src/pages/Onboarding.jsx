import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, Info, Lock } from "lucide-react";
import { useAuth, skipOnboarding } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { toast } from "@/lib/toast";
import { actions, useAction, useOnboarding, usePayMethods, usePosProfile, useProfile, useSummary } from "@/lib/queries";
import { authorName, fmtDate, methodSub, methodTitle } from "@/lib/format";
import { AuthShell, StepFooter, StepTitle, Stepper } from "@/components/AuthShell";
import PayMethodForm, { emptyMethod, methodErrors, toPayload } from "@/components/PayMethodForm";
import { AboutFields, PersonalFields, PhotoPicker, aboutPayload, checkPhoto, fromProfile, personalErrors, personalPayload } from "@/components/ProfileFields";
import { Avatar, Button, ErrorBox, Spinner } from "@/components/ui";

const Heading = StepTitle;

function ReviewCard({ title, onEdit, rows }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
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
  const { user, token } = useAuth();
  const onboarding = useOnboarding();
  const profile = useProfile();
  const methods = usePayMethods();
  const posProfile = usePosProfile();
  const { data: summary } = useSummary();
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
      setForm((state) => ({ ...fromProfile(profile.data), education: state.education }));
      setShowPhoto(profile.data.showPhoto !== false);
    }
  }, [profile.data]);
  useEffect(() => {
    if (posProfile.data) setForm((state) => ({ ...state, education: posProfile.data.education || "" }));
  }, [posProfile.data]);

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
      if (next < 7) toast.success("Saved.");
    } catch (err) {
      setError(errorText(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = (file) => {
    const message = checkPhoto(file);
    if (message) {
      toast.error(message);
      return setPhoto((state) => ({ ...state, error: message }));
    }
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
      if (Object.keys(found).length) {
        toast.error("Please fix the highlighted fields.");
        return setErrors(found);
      }
      run(() => actions.saveProfile(personalPayload(form)), 3);
    },
    3: () => {
      const found = methodErrors(method);
      if (Object.keys(found).length) {
        toast.error("Please fix the highlighted fields.");
        return setErrors(found);
      }
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
    4: () => run(async () => {
      await actions.saveEducation(form.education);
      if (linked) await actions.saveProfile(aboutPayload(form));
    }, 5),
    5: () => run(() => finish.mutateAsync(), 7),
  };

  const social = [form.facebook && "Facebook", form.youtube && "YouTube", form.website && "Website"].filter(Boolean).join(", ");
  const footer = step < 7 && (
    <div className="space-y-4">
      {!linked && step !== 3 && step !== 5 && <ErrorBox error="Your website profile is not linked yet, so photo and personal details cannot be saved now. You can continue and add them later from Profile." />}
      {error && <ErrorBox error={error} />}
      <StepFooter onBack={step > 1 ? () => go(step - 1) : null} onNext={next[step]} loading={saving} disabled={step === 5 && !agree} nextLabel={step === 5 ? "Finish" : "Save and continue"} extra={step === 4 && <Button variant="ghost" size="lg" onClick={() => go(5)}>Skip</Button>} />
    </div>
  );

  return (
    <AuthShell name={name} footer={footer}>
      {step < 5 && <div className="-mt-2 mb-4 flex justify-end"><button type="button" onClick={() => { skipOnboarding(token); navigate("/", { replace: true }); }} className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Skip for now</button></div>}
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
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
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
          <PayMethodForm form={method} setForm={setMethod} errors={errors} layout="tiles" office={summary?.office} />
          <p className="mt-6 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600"><Info className="size-4 shrink-0" /> This will be your default payment method. You can add more later from Pay Method.</p>
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
            <ReviewCard title="Payment method" onEdit={() => go(3)} rows={[["Method", `${methodTitle(toPayload(method))}${method.kind === "cash" ? "" : ` ${method.accountType}`}`], ["Number", methodSub(toPayload(method))], ["Account name", method.kind === "cash" ? (method.collector === "other" ? method.collectorName : name) : method.accountTitle]]} />
            <ReviewCard title="About you" onEdit={() => go(4)} rows={[["Bio", form.bio ? "Added" : "Not added"], ["Education", form.education], ["Social links", social]]} />
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
          <Button size="lg" className="mt-4 h-14 bg-linear-to-r from-brand-700 to-navy px-8 text-base" onClick={() => navigate("/", { replace: true })}>Go to dashboard <ArrowRight className="size-5" /></Button>
        </div>
      )}

    </AuthShell>
  );
}
