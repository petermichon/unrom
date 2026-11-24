import { Form, Link } from "react-router";
import type { ReactNode, Ref } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn, formatNumber } from "@/lib/utils";
import type { BrandSummary } from "@/lib/types";

/**
 * Brand is a navigation facet, not an in-page filter: choosing a brand opens
 * that brand's device page. The form falls back to a plain GET + redirect when
 * JavaScript is off.
 */
export function BrandPicker({
  action = "/devices",
  brands,
  current,
  q,
  roms,
  relock,
  updated,
  hardened,
  hideLabel = false,
}: {
  action?: string;
  brands: BrandSummary[];
  /** The surrounding filter group already names the control. */
  hideLabel?: boolean;
  current?: string | null;
  q?: string;
  roms?: boolean;
  relock?: boolean;
  updated?: boolean;
  hardened?: boolean;
}) {
  return (
    <Form method="get" action={action} className="flex items-center gap-2">
      {q && <input type="hidden" name="q" value={q} />}
      {roms && <input type="hidden" name="roms" value="1" />}
      {relock && <input type="hidden" name="relock" value="supported" />}
      {updated && <input type="hidden" name="updated" value="90" />}
      {hardened && <input type="hidden" name="hardened" value="1" />}
      {hideLabel ? null : (
        <label
          htmlFor="brand-picker"
          className="text-sm font-medium text-muted-foreground"
        >
          Brand
        </label>
      )}
      <select
        id="brand-picker"
        aria-label={hideLabel ? "Brand" : undefined}
        name="vendor"
        defaultValue={current ?? ""}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand.vendor} value={brand.vendor}>
            {brand.vendorName} ({formatNumber(brand.deviceCount)})
          </option>
        ))}
      </select>
      <noscript>
        <Button type="submit" variant="outline" size="sm">
          Go
        </Button>
      </noscript>
    </Form>
  );
}

export function DirectorySearch({
  action,
  q,
  placeholder = "Search name, codename or brand",
  hidden = {},
  inputRef,
}: {
  action: string;
  q: string;
  placeholder?: string;
  hidden?: Record<string, string | undefined>;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <Form method="get" action={action} className="flex gap-2">
      {Object.entries(hidden).map(([name, value]) =>
        value ? (
          <input key={name} type="hidden" name={name} value={value} />
        ) : null,
      )}
      <InputGroup className="flex-1">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          key={q}
          ref={inputRef}
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          defaultValue={q}
          placeholder={placeholder}
          aria-label="Search devices"
        />
      </InputGroup>
    </Form>
  );
}

export function CoverageToggle({
  allHref,
  romsHref,
  roms,
}: {
  allHref: string;
  romsHref: string;
  roms: boolean;
}) {
  const item = (active: boolean) =>
    cn(
      "inline-flex h-7 items-center rounded-full px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
      active
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-px">
      <Link
        to={allHref}
        prefetch="intent"
        aria-current={!roms ? "page" : undefined}
        className={item(!roms)}
      >
        All devices
      </Link>
      <Link
        to={romsHref}
        prefetch="intent"
        aria-current={roms ? "page" : undefined}
        className={item(roms)}
      >
        With ROMs
      </Link>
    </div>
  );
}

export function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function FilterToggle({
  href,
  active,
  label,
  hint,
}: {
  href: string;
  active: boolean;
  label: string;
  /** What the filter means, shown on hover and to assistive tech. */
  hint?: string;
}) {
  return (
    <Link
      to={href}
      prefetch="intent"
      aria-current={active ? "page" : undefined}
      title={hint}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

/** Two orders, rendered as links so the URL stays the source of truth. */
/** Page numbers with a gap on each side of the current page. */
function pageWindow(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const numbers = [...new Set([1, pages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  const out: (number | null)[] = [];
  for (const [index, number] of numbers.entries()) {
    if (index > 0 && number - numbers[index - 1] > 1) out.push(null);
    out.push(number);
  }
  return out;
}

export function DirectoryPager({
  page,
  pages,
  hrefForPage,
}: {
  page: number;
  pages: number;
  hrefForPage: (page: number) => string;
}) {
  if (pages <= 1) return null;

  const link =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1 border-t border-border pt-4"
    >
      {page > 1 ? (
        <Link to={hrefForPage(page - 1)} prefetch="intent" className={link}>
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-8 items-center px-2.5 text-sm text-muted-foreground">
          Previous
        </span>
      )}
      {pageWindow(page, pages).map((number, index) =>
        number === null ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={number}
            to={hrefForPage(number)}
            prefetch="intent"
            aria-label={`Page ${number}`}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              link,
              number === page && "bg-accent text-accent-foreground",
            )}
          >
            {number}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link to={hrefForPage(page + 1)} prefetch="intent" className={link}>
          Next
        </Link>
      ) : (
        <span className="inline-flex h-8 items-center px-2.5 text-sm text-muted-foreground">
          Next
        </span>
      )}
    </nav>
  );
}
