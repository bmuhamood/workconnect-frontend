import { Badge, StatusBadge } from "@/components/ui";
export function DayBadge({ status }: { status: string }) {
  if (status === "notyet") return <Badge>Not in yet</Badge>;
  if (status === "off") return <Badge>Non-working day</Badge>;
  return <StatusBadge status={status} />;
}
