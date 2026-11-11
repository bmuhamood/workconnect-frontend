import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { workerProfiles, employerProfiles, users, categories } from "@/db/schema";
import { PageHeader, Badge } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { AvatarUpload } from "@/components/avatar-upload";

export const metadata: Metadata = { title: "Profile" };
export default async function Profile() {
  const s = await requireSession();
  const d = await tdb(async (tx) => ({
    u: (await tx.select({ first: users.firstName, last: users.lastName, email: users.email, avatar: users.avatarUrl }).from(users).where(eq(users.id, s.userId)))[0],
    w: s.role === "worker" ? (await tx.select().from(workerProfiles).where(eq(workerProfiles.userId, s.userId)))[0] : null,
    e: s.role === "employer" ? (await tx.select().from(employerProfiles).where(eq(employerProfiles.userId, s.userId)))[0] : null,
    cats: await tx.select().from(categories).orderBy(categories.name),
  }));
  return (
    <div className="container-x max-w-2xl py-10">
      <PageHeader title="Your profile" subtitle={d.u.email} action={d.w?.verified ? <Badge tone="green">Verified</Badge> : undefined} />
      <div className="card mb-4 p-6"><AvatarUpload name={`${d.u.first} ${d.u.last}`} src={d.u.avatar} /></div>
      <div className="card p-6">
        <AjaxForm url="/api/profile" method="PATCH" sendEmpty success="Profile saved">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="First name"><input name="firstName" required defaultValue={d.u.first} className="input" /></Field><Field label="Last name"><input name="lastName" required defaultValue={d.u.last} className="input" /></Field></div>
          {d.w && <>
            <Field label="Profession"><input name="profession" defaultValue={d.w.profession} className="input" /></Field>
            <Field label="Category"><select name="categoryId" defaultValue={d.w.categoryId ?? ""} className="input"><option value="">Select…</option>{d.cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="About you"><textarea name="bio" rows={4} defaultValue={d.w.bio} className="input" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="City"><input name="city" required defaultValue={d.w.city} className="input" /></Field><Field label="Years of experience"><input name="experienceYears" type="number" min={0} defaultValue={d.w.experienceYears} className="input" /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Expected monthly salary (UGX)"><input name="expectedSalary" type="number" min={0} defaultValue={d.w.expectedSalary} className="input" /></Field><Field label="Availability"><select name="availability" defaultValue={d.w.availability} className="input"><option value="available">Available</option><option value="part_time">Part-time only</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select></Field></div>
            <Field label="Skills" hint="Comma separated"><input name="skills" defaultValue={d.w.skills.join(", ")} className="input" /></Field>
            <Field label="Languages" hint="Comma separated"><input name="languages" defaultValue={d.w.languages.join(", ")} className="input" /></Field>
          </>}
          {d.e && <>
            <Field label="Company / household name"><input name="companyName" defaultValue={d.e.companyName ?? ""} className="input" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="City"><input name="city" required defaultValue={d.e.city} className="input" /></Field><Field label="Address"><input name="address" defaultValue={d.e.address ?? ""} className="input" /></Field></div>
          </>}
        </AjaxForm>
      </div>
    </div>
  );
}
