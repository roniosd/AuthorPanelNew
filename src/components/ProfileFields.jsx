import { useRef } from "react";
import { Calendar, Camera, CreditCard, Eye, Globe, ImagePlus, MapPin, Phone } from "lucide-react";
import { Avatar, Field, FieldInput, Input, Textarea, cn } from "@/components/ui";

// E-commerce self-profile ↔ form helpers (fields accepted by /api/v1/author/self-profile PUT).
export const emptyProfile = { phone: "", dob: "", gender: "", idType: "NID", nidNumber: "", birthCertificateNumber: "", address: "", bio: "", facebook: "", youtube: "", website: "" };

const linkOf = (links, test) => links.find((link) => test.test(link)) || "";
export const fromProfile = (profile = {}) => {
  const links = String(profile.social || "").split(/[\s|,]+/).filter(Boolean);
  const facebook = linkOf(links, /facebook|fb\.com/i);
  const youtube = linkOf(links, /youtube|youtu\.be/i);
  return {
    ...emptyProfile,
    phone: profile.phone || "",
    dob: profile.dob ? String(profile.dob).slice(0, 10) : "",
    gender: profile.gender || "",
    idType: profile.idType || "NID",
    nidNumber: profile.nidNumber || "",
    birthCertificateNumber: profile.birthCertificateNumber || "",
    address: profile.address || "",
    bio: profile.bio || "",
    facebook,
    youtube,
    website: links.find((link) => link !== facebook && link !== youtube) || "",
  };
};
export const personalPayload = (form) => ({ phone: form.phone.trim(), dob: form.dob, gender: form.gender || undefined, idType: form.idType, nidNumber: form.idType === "NID" ? form.nidNumber.trim() : "", birthCertificateNumber: form.idType === "Birth certificate" ? form.birthCertificateNumber.trim() : "", address: form.address.trim() });
export const aboutPayload = (form) => ({ bio: form.bio.trim(), social: [form.facebook, form.youtube, form.website].map((link) => link.trim()).filter(Boolean).join(" | ") });

export const personalErrors = (form) => {
  const errors = {};
  if (!/^(\+?88)?01[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) errors.phone = "Enter a valid mobile number.";
  if (!form.dob) errors.dob = "Date of birth is required.";
  if (!form.gender) errors.gender = "Please choose one.";
  const id = form.idType === "NID" ? form.nidNumber : form.birthCertificateNumber;
  if (!/^\d{10,17}$/.test(id.replace(/\s/g, ""))) errors.id = "Enter a valid number (10–17 digits).";
  if (!form.address.trim()) errors.address = "Address is required.";
  return errors;
};

const Choice = ({ active, onClick, children }) => <button type="button" onClick={onClick} className={cn("h-11 rounded-xl border text-sm font-semibold transition", active ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/15" : "border-slate-200 hover:bg-slate-50")}>{children}</button>;
const Icon = ({ icon: I, children }) => <div className="relative">{<I className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />}{children}</div>;

export function PersonalFields({ form, setForm, errors = {} }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FieldInput label="Phone" required error={errors.phone} icon={Phone} inputMode="tel" value={form.phone} onChange={set("phone")} placeholder="01XXX-XXXXXX" />
      <FieldInput label="Date of birth" required error={errors.dob} icon={Calendar} type="date" value={form.dob} max={new Date().toISOString().slice(0, 10)} onChange={set("dob")} />
      <Field label="Gender" required error={errors.gender}><div className="grid grid-cols-2 gap-2">{["Male", "Female"].map((value) => <Choice key={value} active={form.gender === value} onClick={() => setForm({ ...form, gender: value })}>{value}</Choice>)}</div></Field>
      <Field label="ID type" required><div className="grid grid-cols-2 gap-2">{["NID", "Birth certificate"].map((value) => <Choice key={value} active={form.idType === value} onClick={() => setForm({ ...form, idType: value })}>{value}</Choice>)}</div></Field>
      <Field label={form.idType === "NID" ? "NID number" : "Birth certificate number"} required error={errors.id} className="sm:col-span-2">
        <Icon icon={CreditCard}>{form.idType === "NID" ? <Input inputMode="numeric" value={form.nidNumber} onChange={set("nidNumber")} placeholder="NID number" className="pl-10" /> : <Input inputMode="numeric" value={form.birthCertificateNumber} onChange={set("birthCertificateNumber")} placeholder="Birth certificate number" className="pl-10" />}</Icon>
      </Field>
      <FieldInput label="Address" required error={errors.address} fieldClassName="sm:col-span-2" icon={MapPin} value={form.address} onChange={set("address")} placeholder="House, road, area, city" />
    </div>
  );
}

export function AboutFields({ form, setForm }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <div className="space-y-5">
      <Field label="Author bio" hint={`${form.bio.length} / 600`}><Textarea className="bn" maxLength={600} rows={4} value={form.bio} onChange={set("bio")} placeholder="Readers see this on your author page." /></Field>
      <Field label="Social links">
        <div className="grid gap-3 sm:grid-cols-3">
          <Icon icon={Globe}><input className="input pl-10" value={form.facebook} onChange={set("facebook")} placeholder="facebook.com/…" /></Icon>
          <Icon icon={Globe}><input className="input pl-10" value={form.youtube} onChange={set("youtube")} placeholder="youtube.com/@…" /></Icon>
          <Icon icon={Globe}><input className="input pl-10" value={form.website} onChange={set("website")} placeholder="Website link" /></Icon>
        </div>
      </Field>
    </div>
  );
}

// Round preview + drop zone; calls onFile(File) after a local type/size check.
export function PhotoPicker({ name, photo, preview, onFile, uploading, error, showPhoto, onShowPhoto }) {
  const input = useRef(null);
  const pick = (file) => file && onFile(file);
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0 rounded-full border-2 border-dashed border-slate-300 p-2">
          {preview ? <img src={preview} alt="" className="size-32 rounded-full object-cover" /> : <Avatar name={name} photo={photo} size="size-32" className="bg-brand-50 text-5xl text-brand-700" />}
          <button type="button" onClick={() => input.current?.click()} className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-amber-400 text-white shadow"><Camera className="size-4" /></button>
        </div>
        <div className="w-full flex-1 rounded-2xl border-2 border-dashed border-slate-200 p-6" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); pick(event.dataTransfer.files?.[0]); }}>
          <p className="font-semibold">Drag a photo here</p>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP, up to 5 MB. A clear, front-facing photo works best.</p>
          <button type="button" disabled={uploading} onClick={() => input.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"><ImagePlus className="size-4" /> {uploading ? "Uploading…" : "Choose photo"}</button>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ""; }} />
      </div>
      {onShowPhoto && (
        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">
          <span className="flex items-center gap-2"><Eye className="size-4 text-brand-600" /> Show my photo on the website</span>
          <button type="button" onClick={() => onShowPhoto(!showPhoto)} className={cn("relative h-6 w-11 rounded-full transition", showPhoto ? "bg-brand-600" : "bg-slate-300")}><span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", showPhoto ? "left-[22px]" : "left-0.5")} /></button>
        </label>
      )}
    </div>
  );
}

export const checkPhoto = (file) => (!/^image\/(jpeg|png|webp)$/.test(file.type) ? "Please choose a JPG, PNG or WEBP photo." : file.size > 5 * 1024 * 1024 ? "Photo must be 5 MB or smaller." : "");
export { Input };
