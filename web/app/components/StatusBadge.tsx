import { Badge } from "@/components/ui/badge";

export function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <Badge className="border-brand/20 bg-brand/15 text-brand">Active</Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Discontinued
    </Badge>
  );
}
