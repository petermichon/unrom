import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

interface Props {
  to: string;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ChipLink({ to, children, title, className }: Props) {
  return (
    <Badge
      render={<Link to={to} title={title} />}
      variant="outline"
      className={cn(
        "h-auto px-2 py-0.5 text-xs font-normal text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        className
      )}
    >
      {children}
    </Badge>
  );
}
