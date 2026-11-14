import { Badge } from "@/components/ui/badge";
import type { BootloaderPolicy } from "@/lib/types";

const STATUS_LABELS = {
  supported: "Supported",
  conditional: "Conditional",
  unsupported: "Not supported",
  unknown: "Unknown",
} as const;

const SCOPE_LABELS = {
  all: "All models",
  most: "Most models",
  some: "Some models",
  unknown: "Scope unknown",
} as const;

export function BootloaderPolicyCard({ policy }: { policy: BootloaderPolicy }) {
  return (
    <section
      aria-labelledby="bootloader-policy"
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="bootloader-policy" className="font-heading text-base font-bold">
          Bootloader unlock
        </h2>
        <Badge variant="outline">{STATUS_LABELS[policy.status]}</Badge>
        <span className="text-xs text-muted-foreground">
          {SCOPE_LABELS[policy.scope]}
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{policy.summary}</p>

      {policy.conditions.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {policy.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Vendor-level policy; carrier, region, variant and firmware can change
        the result. Verified{" "}
        <time dateTime={policy.verifiedAt}>{policy.verifiedAt}</time> ·{" "}
        <a
          href={policy.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand hover:underline"
        >
          Official source
        </a>
      </p>
    </section>
  );
}
