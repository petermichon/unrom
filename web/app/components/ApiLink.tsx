import { cn } from "@/lib/utils";

/**
 * The same page as machine-readable JSON. Small and quiet, because it is a
 * channel to the data rather than part of it.
 */
export function ApiLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      title={`API response: ${href}`}
      aria-label={`API response: ${href}`}
      className={cn(
        "text-xs font-semibold text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      API
    </a>
  );
}
