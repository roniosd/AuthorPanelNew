import { useEffect, useState } from "react";
import { BadgeCheck, KeyRound, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import { useAction, useProfile, actions } from "@/lib/queries";
import { fmtDate } from "@/lib/format";
import { AboutFields, PersonalFields, PhotoPicker, aboutPayload, checkPhoto, fromProfile, personalErrors, personalPayload } from "@/components/ProfileFields";
import { Button, Card, CardHead, ErrorBox, InfoRow, PageTitle, Spinner } from "@/components/ui";

function Saved({ text }) {
  return text ? <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><BadgeCheck className="size-4" /> {text}</p> : null;
}

export default function Profile() {
  const { user, forgotPassword } = useAuth();
  const { data, isLoading, error } = useProfile();
  const save = useAction(actions.saveProfile, ["self-profile", "summary"]);
  const upload = useAction(actions.uploadPhoto, ["self-profile", "summary"]);
  const [form, setForm] = useState(fromProfile());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({});
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (data) setForm(fromProfile(data));
  }, [data]);

  if (isLoading) return <Spinner />;
  if (error) {
    return (
      <>
        <PageTitle title="Profile" />
        <ErrorBox error={errorText(error)} />
      </>
    );
  }

  const done = (key, text) => setStatus({ [key]: text });
  const fail = (key, err) => setStatus({ [`${key}Error`]: errorText(err) });

  const choosePhoto = async (file) => {
    const message = checkPhoto(file);
    setPhotoError(message);
    if (message) return;
    const body = new FormData();
    body.append("file", file);
    body.append("showPhoto", String(data.showPhoto !== false));
    try {
      await upload.mutateAsync(body);
      done("photo", "Photo updated.");
    } catch (err) {
      setPhotoError(errorText(err));
    }
  };
  const toggleShow = (showPhoto) => save.mutateAsync({ showPhoto }).then(() => done("photo", showPhoto ? "Photo shown on website." : "Photo hidden on website.")).catch((err) => setPhotoError(errorText(err)));

  const savePersonal = async () => {
    const found = personalErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await save.mutateAsync(personalPayload(form));
      done("personal", "Saved.");
    } catch (err) {
      fail("personal", err);
    }
  };
  const saveAbout = async () => {
    try {
      await save.mutateAsync(aboutPayload(form));
      done("about", "Saved.");
    } catch (err) {
      fail("about", err);
    }
  };
  const sendReset = async () => {
    try {
      await forgotPassword(data.email || user?.email);
      done("password", "A link to change your password was sent to your email.");
    } catch (err) {
      fail("password", err);
    }
  };

  return (
    <>
      <PageTitle title="Profile" sub="Readers see your photo and bio on your author page." />
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <Card className="space-y-4 p-6">
            <CardHead icon={User} title="Photo" right={<Saved text={status.photo} />} />
            <PhotoPicker name={data.bn_author} photo={data.photo} onFile={choosePhoto} uploading={upload.isPending} error={photoError} showPhoto={data.showPhoto !== false} onShowPhoto={toggleShow} />
          </Card>
          <Card className="p-6">
            <CardHead icon={Lock} title="Account" sub="Set by Nobokothon" />
            <div className="mt-3 divide-y divide-slate-100">
              <InfoRow label="Name (Bangla)" value={<span className="bn">{data.bn_author}</span>} />
              <InfoRow label="Name (English)" value={data.en_author} />
              <InfoRow label="Email" value={<span className="flex items-center gap-1.5"><Mail className="size-3.5 text-slate-400" />{data.email || user?.email}</span>} />
              {data.dob && <InfoRow label="Date of birth" value={fmtDate(data.dob)} />}
            </div>
            <p className="mt-3 text-xs text-slate-400">To change your name or email, please contact Nobokothon.</p>
          </Card>
          <Card className="space-y-3 p-6">
            <CardHead icon={KeyRound} title="Password" />
            <p className="text-sm text-slate-500">We will email you a secure link to set a new password.</p>
            {status.passwordError && <ErrorBox error={status.passwordError} />}
            <Saved text={status.password} />
            <Button variant="outline" onClick={sendReset}>Send change-password link</Button>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="space-y-5 p-6">
            <CardHead icon={User} title="Personal information" right={<Saved text={status.personal} />} />
            {status.personalError && <ErrorBox error={status.personalError} />}
            <PersonalFields form={form} setForm={setForm} errors={errors} />
            <div className="flex justify-end"><Button loading={save.isPending} onClick={savePersonal}>Save changes</Button></div>
          </Card>
          <Card className="space-y-5 p-6">
            <CardHead icon={BadgeCheck} title="About you" right={<Saved text={status.about} />} />
            {status.aboutError && <ErrorBox error={status.aboutError} />}
            <AboutFields form={form} setForm={setForm} />
            <div className="flex justify-end"><Button loading={save.isPending} onClick={saveAbout}>Save changes</Button></div>
          </Card>
        </div>
      </div>
    </>
  );
}
