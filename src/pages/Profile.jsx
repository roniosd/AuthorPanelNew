import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Pencil,
  Plus,
  ShieldCheck,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/api";
import {
  actions,
  useAction,
  usePosProfile,
  useProfile,
  useSummary,
} from "@/lib/queries";
import { dateShort, methodNumber, methodTitle } from "@/lib/format";
import {
  AboutFields,
  PersonalFields,
  SocialDot,
  socialPayload,
  checkPhoto,
  fromProfile,
  personalErrors,
  personalPayload,
} from "@/components/ProfileFields";
import PasswordFields, { passwordChecks } from "@/components/PasswordFields";
import {
  Avatar,
  Button,
  Card,
  Cover,
  ErrorBox,
  Field,
  MethodIcon,
  Modal,
  PageTitle,
  Spinner,
  cn,
} from "@/components/ui";

const SITE = import.meta.env.VITE_SITE_URL || "https://nobokothon.com";

const SectionHead = ({ icon: Icon, tone, title, badge, onEdit, editing }) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-11 place-items-center rounded-xl text-white",
          tone,
        )}
      >
        <Icon className="size-5" />
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      {badge && (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {badge}
        </span>
      )}
    </div>
    {onEdit && !editing && (
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="size-3.5" /> Edit
      </Button>
    )}
  </div>
);

const InfoTile = ({
  icon: Icon,
  label,
  children,
  locked,
  action,
  badge,
  className,
}) => (
  <div
    className={cn(
      "flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5",
      className,
    )}
  >
    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        {label}
        {badge}
      </p>
      <div className="truncate font-semibold">
        {children || (
          <span className="font-normal text-slate-400">Not added</span>
        )}
      </div>
    </div>
    {locked && <Lock className="size-4 text-slate-300" />}
    {action}
  </div>
);

function ChangePassword({ open, onClose }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const change = useAction(actions.changePassword, ["pos-profile"]);
  const valid =
    current && passwordChecks(password, confirm).every((check) => check.ok);
  const submit = async () => {
    setError("");
    try {
      await change.mutateAsync({ current, password });
      setDone(true);
    } catch (err) {
      setError(errorText(err));
    }
  };
  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <div className="space-y-5 p-6">
        <h2 className="text-2xl font-bold">Change password</h2>
        {done ? (
          <p className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
            Your password was changed. Use the new one next time you sign in.
          </p>
        ) : (
          <>
            {error && <ErrorBox error={error} />}
            <Field label="Current password" required>
              <input
                type="password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                className="input"
                autoComplete="current-password"
              />
            </Field>
            <PasswordFields
              password={password}
              confirm={confirm}
              setPassword={setPassword}
              setConfirm={setConfirm}
            />
          </>
        )}
        <div className="flex justify-end gap-3">
          {done ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                loading={change.isPending}
                disabled={!valid}
                onClick={submit}
              >
                Change password
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Profile (design 15). Website fields go to the e-commerce profile; education stays in the POS.
export default function Profile() {
  const { user, viewOnly } = useAuth();
  const { data, isLoading, error } = useProfile();
  const { data: pos } = usePosProfile();
  const { data: summary } = useSummary();
  const save = useAction(actions.saveProfile, ["self-profile", "summary"]);
  const upload = useAction(actions.uploadPhoto, ["self-profile", "summary"]);
  const saveEducation = useAction(actions.saveEducation, ["pos-profile"]);
  const fileInput = useRef(null);
  const [form, setForm] = useState(fromProfile());
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showId, setShowId] = useState(false);
  const [password, setPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data)
      setForm((state) => ({
        ...fromProfile(data),
        education: state.education,
      }));
  }, [data]);
  useEffect(() => {
    if (pos) setForm((state) => ({ ...state, education: pos.education || "" }));
  }, [pos]);

  if (isLoading) return <Spinner />;

  const profile = data || {};
  const linked = !error && !viewOnly;
  const name = profile.bn_author || summary?.author?.bn_author || user?.name;
  const method = summary?.paymentMethods?.[0];
  const authorPage = profile.authorSlug
    ? `${SITE}/${profile.authorSlug}`
    : SITE;
  const idNumber =
    form.idType === "NID" ? form.nidNumber : form.birthCertificateNumber;
  const cancel = () => {
    setEditing(null);
    setErrors({});
    if (data)
      setForm({ ...fromProfile(data), education: pos?.education || "" });
  };
  const run = async (task) => {
    setMessage("");
    try {
      await task();
      setEditing(null);
    } catch (err) {
      setMessage(errorText(err));
    }
  };
  const savePersonal = () => {
    const found = personalErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    run(async () => {
      await save.mutateAsync(personalPayload(form));
      await saveEducation.mutateAsync(form.education);
    });
  };
  const choosePhoto = (file) => {
    const problem = checkPhoto(file);
    if (problem) return setMessage(problem);
    const body = new FormData();
    body.append("file", file);
    body.append("showPhoto", String(profile.showPhoto !== false));
    run(() => upload.mutateAsync(body));
  };
  const EditBar = ({ onSave }) => (
    <div className="mt-5 flex justify-end gap-3">
      <Button variant="outline" onClick={cancel}>
        Cancel
      </Button>
      <Button
        loading={save.isPending || saveEducation.isPending}
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );

  return (
    <>
      <PageTitle title="Profile" />
      {!linked && (
        <div className="mb-5">
          <ErrorBox
            error={`${errorText(error)} Website details (photo, phone, bio) can be edited once your profile is linked.`}
          />
        </div>
      )}
      {message && (
        <div className="mb-5">
          <ErrorBox error={message} />
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,460px)_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-36 bg-navy bg-[radial-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] bg-size-[14px_14px]" />
            <div className="-mt-20 px-6 pb-6 text-center">
              <div className="relative mx-auto w-fit">
                <Avatar
                  name={name}
                  photo={profile.photo}
                  size="size-36"
                  className="border-[6px] border-white text-6xl shadow-lg"
                />
                {linked && (
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="absolute right-2 bottom-2 grid size-10 place-items-center rounded-full border-4 border-white bg-amber-400 text-white"
                    title="Change photo"
                  >
                    {upload.isPending ? "…" : <Camera className="size-4" />}
                  </button>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) choosePhoto(file);
                    event.target.value = "";
                  }}
                />
              </div>
              <p className="bn mt-4 text-3xl font-bold">{name}</p>
              <p className="text-slate-500">{profile.en_author || ""}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                <Pencil className="size-3.5" /> Author
              </span>
              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50/60 py-4">
                {[
                  ["Books", pos?.books ?? "—"],
                  ["Editions", pos?.editions ?? "—"],
                  ["Author since", pos?.authorSince ?? "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="display text-2xl font-bold text-brand-700">
                      {value}
                    </p>
                    <p className="text-sm text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              {pos?.covers?.length > 0 && (
                <div className="mt-8 flex justify-center items-center">
                  {pos.covers.map((cover, index) => {
                    const offset = index - (pos.covers.length - 1) / 2;
                    const rotation = offset * 7;
                    const translateY = Math.abs(offset) * 3;

                    return (
                      <Cover
                        key={cover}
                        cover={cover}
                        className={cn(
                          "h-24 w-16 shrink-0 border-4 border-white shadow-lg rounded-md transition-transform duration-300 hover:z-50 hover:scale-110",
                          index > 0 && "-ml-4",
                        )}
                        style={{
                          transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                          transformOrigin: "bottom center",
                          zIndex: pos.covers.length - Math.abs(offset),
                        }}
                      />
                    );
                  })}
                </div>
              )}
              {linked && (
                <label className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3.5 text-left font-semibold">
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-slate-100">
                      <Camera className="size-4 text-slate-500" />
                    </span>{" "}
                    Show my photo on the website
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      run(() =>
                        save.mutateAsync({
                          showPhoto: profile.showPhoto === false,
                        }),
                      )
                    }
                    className={cn(
                      "edit-only relative h-7 w-12 rounded-full transition",
                      profile.showPhoto !== false ? "bg-navy" : "bg-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
                        profile.showPhoto !== false ? "left-6" : "left-1",
                      )}
                    />
                  </button>
                </label>
              )}
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left">
                <span className="grid size-9 place-items-center rounded-lg bg-slate-100">
                  <Link2 className="size-4 text-slate-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Author page</p>
                  <p className="truncate font-semibold text-brand-700">
                    {authorPage.replace(/^https?:\/\//, "")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(authorPage);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="grid size-9 place-items-center rounded-lg border border-slate-200"
                  title="Copy"
                >
                  {copied ? "✓" : <Copy className="size-4" />}
                </button>
                <a
                  href={authorPage}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-slate-200"
                  title="Open"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionHead
              icon={BookOpen}
              tone="bg-amber-500"
              title="Author bio"
              onEdit={linked ? () => setEditing("bio") : null}
              editing={editing === "bio"}
            />
            {editing === "bio" ? (
              <>
                <textarea
                  className="input bn h-auto min-h-40 py-3"
                  maxLength={600}
                  value={form.bio}
                  onChange={(event) =>
                    setForm({ ...form, bio: event.target.value })
                  }
                />
                <EditBar
                  onSave={() =>
                    run(() => save.mutateAsync({ bio: form.bio.trim() }))
                  }
                />
              </>
            ) : (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <span className="display text-4xl leading-none text-amber-400">
                  “
                </span>
                <p className="bn -mt-3 pl-6 leading-relaxed text-slate-700">
                  {profile.bio || "No bio yet."}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <SectionHead
              icon={User}
              tone="bg-brand-600"
              title="Personal information"
              onEdit={linked ? () => setEditing("personal") : null}
              editing={editing === "personal"}
            />
            {editing === "personal" ? (
              <>
                <PersonalFields form={form} setForm={setForm} errors={errors} />
                <div className="mt-5">
                  <Field label="Education">
                    <div className="relative">
                      <Award className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        className="input pl-11"
                        maxLength={200}
                        value={form.education}
                        onChange={(event) =>
                          setForm({ ...form, education: event.target.value })
                        }
                        placeholder="Optional"
                      />
                    </div>
                  </Field>
                </div>
                <EditBar onSave={savePersonal} />
              </>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile icon={User} label="Name (Bangla)" locked>
                  <span className="bn">{profile.bn_author || name}</span>
                </InfoTile>
                <InfoTile icon={User} label="Name (English)" locked>
                  {profile.en_author}
                </InfoTile>
                <InfoTile icon={Mail} label="Email" locked>
                  {profile.email || user?.email}
                </InfoTile>
                <InfoTile icon={Smartphone} label="Phone">
                  {profile.phone}
                </InfoTile>
                <InfoTile icon={Calendar} label="Date of birth">
                  {profile.dob ? dateShort(profile.dob) : ""}
                </InfoTile>
                <InfoTile icon={Users} label="Gender">
                  {profile.gender}
                </InfoTile>
                <InfoTile
                  icon={CreditCard}
                  label={
                    form.idType === "NID" ? "NID number" : "Birth certificate"
                  }
                  badge={
                    <span className="rounded bg-brand-50 px-1.5 text-[10px] font-bold text-brand-700">
                      {form.idType === "NID" ? "NID" : "BC"}
                    </span>
                  }
                  action={
                    idNumber && (
                      <button
                        onClick={() => setShowId(!showId)}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200"
                      >
                        {showId ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    )
                  }
                >
                  {idNumber
                    ? showId
                      ? idNumber
                      : `•••• •••• ••${idNumber.slice(-4)}`
                    : ""}
                </InfoTile>
                <Link to="/pay-method">
                  <InfoTile
                    icon={CreditCard}
                    label="Payment number"
                    badge={
                      method && (
                        <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">
                          Default
                        </span>
                      )
                    }
                    action={<ChevronRight className="size-4 text-slate-400" />}
                  >
                    {method && (
                      <span className="flex items-center gap-2">
                        <MethodIcon
                          method={method}
                          className="size-6 rounded-md border-0"
                        />
                        {methodTitle(method)} {methodNumber(method)}
                      </span>
                    )}
                  </InfoTile>
                </Link>
                <InfoTile
                  icon={Award}
                  label="Education"
                  badge={
                    <span className="rounded bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
                      Optional
                    </span>
                  }
                  className="md:col-span-2"
                >
                  {form.education}
                </InfoTile>
                <InfoTile
                  icon={MapPin}
                  label="Address"
                  className="md:col-span-2"
                >
                  {profile.address}
                </InfoTile>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <SectionHead
              icon={Link2}
              tone="bg-violet-600"
              title="Social links"
              badge="Optional"
              onEdit={linked ? () => setEditing("social") : null}
              editing={editing === "social"}
            />
            {editing === "social" ? (
              <>
                <AboutFields form={form} setForm={setForm} socialOnly />
                <EditBar
                  onSave={() =>
                    run(() => save.mutateAsync(socialPayload(form)))
                  }
                />
              </>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["facebook", "Facebook"],
                  ["youtube", "YouTube"],
                  ["website", "Website"],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
                  >
                    <SocialDot type={key} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">{label}</p>
                      {form[key] ? (
                        <p className="truncate font-semibold text-brand-700">
                          {form[key].replace(/^https?:\/\/(www\.)?/, "")}
                        </p>
                      ) : (
                        <p className="text-slate-400">Not added</p>
                      )}
                    </div>
                    {form[key] ? (
                      <a
                        href={
                          /^https?:/.test(form[key])
                            ? form[key]
                            : `https://${form[key]}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="grid size-8 place-items-center rounded-lg border border-slate-200"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      linked && (
                        <button
                          onClick={() => setEditing("social")}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-brand-300 px-2 py-1 text-sm font-semibold text-brand-700"
                        >
                          <Plus className="size-3.5" /> Add
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <SectionHead
              icon={ShieldCheck}
              tone="bg-emerald-600"
              title="Security"
            />
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-4">
              <span className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
                <Lock className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Password</p>
                <p className="font-bold tracking-widest">••••••••••</p>
              </div>
              <Button className="edit-only" onClick={() => setPassword(true)}>
                Change password
              </Button>
            </div>
            <p className="mt-5 mb-2 text-sm text-slate-500">
              Logged in devices
            </p>
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-500">
                <Monitor className="size-4" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {/Android|iPhone/.test(navigator.userAgent)
                    ? "Phone"
                    : "This computer"}{" "}
                  ·{" "}
                  {/Chrome/.test(navigator.userAgent)
                    ? "Chrome"
                    : /Firefox/.test(navigator.userAgent)
                      ? "Firefox"
                      : /Safari/.test(navigator.userAgent)
                        ? "Safari"
                        : "Browser"}
                </p>
                <p className="text-sm text-slate-500">Active now</p>
              </div>
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                This device
              </span>
            </div>
          </Card>
        </div>
      </div>
      <ChangePassword open={password} onClose={() => setPassword(false)} />
    </>
  );
}
