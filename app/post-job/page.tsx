import type { Metadata } from "next";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { categories } from "@/db/schema";
import { PageHeader } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export const metadata: Metadata = { title: "Post a job" };
export default async function PostJob() {
  await requireSession(["employer", "admin"]);
  const cats = await tdb((tx) => tx.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name));
  return (
    <div className="container-x max-w-2xl py-10">
      <PageHeader title="Post a job" subtitle="Describe the role and we'll show it to available workers." />
      <div className="card p-6"><JobForm categories={cats} /></div>
    </div>
  );
}
