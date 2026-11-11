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
        {(endpoint || actions) && (
          <div className="flex items-center gap-3">
            {endpoint && (
              <a
                href={endpoint}
                title={`API response: ${endpoint}`}
                aria-label={`API response: ${endpoint}`}
                className="text-xs font-semibold text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                API
              </a>
            )}
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        )}
      </div>
      {description && (
        <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
