import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  endpoint?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  endpoint,
  badge,
  actions,
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {endpoint && (
            <code className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/70">GET</span>{" "}
              {endpoint}
            </code>
          )}
          {actions}
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
