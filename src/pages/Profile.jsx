import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/lib/toast";
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
  <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl text-white sm:size-11",
          tone,
        )}
      >
        <Icon className="size-5" />
      </span>
      <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      {badge && (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {badge}
        </span>
      )}
    </div>
    {onEdit && !editing && (
      <Button variant="outline" size="sm" className="shrink-0" onClick={onEdit}>
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
      "flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 sm:gap-4 sm:px-4 sm:py-3.5",
      className,
    )}
  >
    <span className="grid size-10 shrink-0 place-items-center self-start rounded-xl border border-slate-200 bg-white text-slate-500 sm:self-center">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
        {label}
        {badge}
      </p>
      <div className="text-sm font-semibold wrap-anywhere sm:text-base">
        {children || (
          <span className="font-normal text-slate-400">Not added</span>
        )}
      </div>
    </div>
    {locked && <Lock className="size-4 shrink-0 text-slate-300" />}
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
      toast.success("Password changed.");
    } catch (err) {
      setError(errorText(err));
      toast.error(err);
    }
  };
  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <div className="space-y-5 p-5 sm:p-6">
        <h2 className="pr-10 text-xl font-bold sm:text-2xl">Change password</h2>
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
        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          {done ? (
            <Button className="col-span-2" onClick={onClose}>Done</Button>
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
  const run = async (task, done = "Changes saved.") => {
    setMessage("");
    try {
      await task();
      setEditing(null);
      toast.success(done);
    } catch (err) {
      setMessage(errorText(err));
      toast.error(err);
    }
  };
  const savePersonal = () => {
    const found = personalErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return toast.error("Please fix the highlighted fields.");
    run(async () => {
      await save.mutateAsync(personalPayload(form));
      await saveEducation.mutateAsync(form.education);
    });
  };
  const choosePhoto = (file) => {
    const problem = checkPhoto(file);
    if (problem) {
      toast.error(problem);
      return setMessage(problem);
    }
    const body = new FormData();
    body.append("file", file);
    body.append("showPhoto", String(profile.showPhoto !== false));
    run(() => upload.mutateAsync(body), "Photo updated.");
  };
  const EditBar = ({ onSave }) => (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
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
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden">
            <div className="h-28 bg-navy sm:h-36 bg-[radial-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] bg-size-[14px_14px]" />
            <div className="-mt-16 px-4 pb-5 text-center sm:-mt-20 sm:px-6 sm:pb-6">
              <div className="relative mx-auto w-fit">
                <Avatar
                  name={name}
                  photo={profile.photo}
                  size="size-28 sm:size-36"
                  className="border-4 border-white text-5xl shadow-lg sm:border-[6px] sm:text-6xl"
                />
                {linked && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="absolute right-1 bottom-1 grid size-10 place-items-center rounded-full border-4 border-white bg-amber-400 text-white active:scale-95 sm:right-2 sm:bottom-2"
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
              <p className="bn mt-3 text-2xl font-bold wrap-break-word sm:mt-4 sm:text-3xl">{name}</p>
              <p className="wrap-break-word text-slate-500">{profile.en_author || ""}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                <Pencil className="size-3.5" /> Author
              </span>
              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50/60 py-3 sm:py-4">
                {[
                  ["Books", pos?.books ?? "—"],
                  ["Editions", pos?.editions ?? "—"],
                  ["Author since", pos?.authorSince ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 px-1">
                    <p className="display text-xl font-bold text-brand-700 sm:text-2xl">
                      {value}
                    </p>
                    <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
                  </div>
                ))}
              </div>
              {pos?.covers?.length > 0 && (
                <div className="mt-6 flex items-center justify-center px-2 sm:mt-8">
                  {pos.covers.map((cover, index) => {
                    const offset = index - (pos.covers.length - 1) / 2;
                    const rotation = offset * 7;
                    const translateY = Math.abs(offset) * 3;

                    return (
                      <Cover
                        key={cover}
                        cover={cover}
                        className={cn(
                          "h-20 w-14 shrink-0 rounded-md border-[3px] border-white shadow-lg transition-transform duration-300 hover:z-1000 hover:scale-110 sm:h-24 sm:w-16 sm:border-4",
                          index > 0 && "-ml-5 sm:-ml-4",
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
                <label className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3.5 py-3 text-left text-sm font-semibold sm:px-4 sm:py-3.5 sm:text-base">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100">
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
                      "edit-only relative h-7 w-12 shrink-0 rounded-full transition",
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
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 px-3.5 py-3 text-left sm:gap-3 sm:px-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100">
                  <Link2 className="size-4 text-slate-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Author page</p>
                  <p className="truncate font-semibold text-brand-700">
                    {authorPage.replace(/^https?:\/\//, "")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(authorPage);
                    toast.success("Link copied.");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 active:bg-slate-100 sm:size-9"
                  title="Copy"
                >
                  {copied ? "✓" : <Copy className="size-4" />}
                </button>
                <a
                  href={authorPage}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 active:bg-slate-100 sm:size-9"
                  title="Open"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
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
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 sm:p-5">
                <span className="display text-4xl leading-none text-amber-400">
                  “
                </span>
                <p className="bn -mt-3 pl-4 leading-relaxed wrap-break-word text-slate-700 sm:pl-6">
                  {profile.bio || "No bio yet."}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
                        type="button"
                        onClick={() => setShowId(!showId)}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white active:bg-slate-100"
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
                <Link to="/pay-method" className="block min-w-0">
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
                    action={<ChevronRight className="size-4 shrink-0 text-slate-400" />}
                  >
                    {method && (
                      <span className="flex min-w-0 items-center gap-2">
                        <MethodIcon
                          method={method}
                          className="size-6 shrink-0 rounded-md border-0"
                        />
                        <span className="truncate">{methodTitle(method)} {methodNumber(method)}</span>
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
                  className="sm:col-span-2"
                >
                  {form.education}
                </InfoTile>
                <InfoTile
                  icon={MapPin}
                  label="Address"
                  className="sm:col-span-2"
                >
                  {profile.address}
                </InfoTile>
              </div>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                {[
                  ["facebook", "Facebook"],
                  ["youtube", "YouTube"],
                  ["website", "Website"],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
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
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white active:bg-slate-100 sm:size-8"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      linked && (
                        <button
                          type="button"
                          onClick={() => setEditing("social")}
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-brand-300 px-2.5 py-1.5 text-sm font-semibold text-brand-700 active:bg-brand-50"
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

          <Card className="p-4 sm:p-6">
            <SectionHead
              icon={ShieldCheck}
              tone="bg-emerald-600"
              title="Security"
            />
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-3.5 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
                <Lock className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Password</p>
                <p className="font-bold tracking-widest">••••••••••</p>
              </div>
              <Button className="edit-only w-full sm:w-auto" onClick={() => setPassword(true)}>
                Change password
              </Button>
            </div>
            <p className="mt-5 mb-2 text-sm text-slate-500">
              Logged in devices
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3.5 py-3.5 sm:gap-4 sm:px-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500">
                <Monitor className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
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
              <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-emerald-700">
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
