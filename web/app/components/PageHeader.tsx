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
          <h1 className="font-heading text-3xl font-extrabold tracking-[-0.02em]">
            {title}
          </h1>
          {badge}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {endpoint && (
        <p className="text-xs text-muted-foreground">
          <a
            href={endpoint}
            className="font-mono outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            title="Open this page's API response"
          >
            <span className="font-semibold text-brand">GET</span> {endpoint}
          </a>
        </p>
      )}
      {children}
    </div>
  );
}
