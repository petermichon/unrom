import { Form, Link } from "react-router";
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
}: {
  action?: string;
  brands: BrandSummary[];
  current?: string | null;
  q?: string;
  roms?: boolean;
}) {
  return (
    <Form method="get" action={action} className="flex items-center gap-2">
      {q && <input type="hidden" name="q" value={q} />}
      {roms && <input type="hidden" name="roms" value="1" />}
      <label
        htmlFor="brand-picker"
        className="text-sm font-medium text-muted-foreground"
      >
        Brand
      </label>
      <select
        id="brand-picker"
        name="vendor"
        defaultValue={current ?? ""}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
      <Link
        to="/brands"
        prefetch="intent"
        className="text-sm font-medium text-brand hover:underline"
      >
        All brands
      </Link>
    </Form>
  );
}

export function DirectorySearch({
  action,
  q,
  placeholder = "Search by device name, codename, or brand…",
  hidden = {},
}: {
  action: string;
  q: string;
  placeholder?: string;
  hidden?: Record<string, string | undefined>;
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
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          defaultValue={q}
          placeholder={placeholder}
          aria-label="Search devices"
        />
      </InputGroup>
      <Button type="submit">Search</Button>
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
      "rounded-full px-3 py-1 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
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
        With ROM data
      </Link>
    </div>
  );
}

export function DirectoryPager({
  page,
  pages,
  prevHref,
  nextHref,
}: {
  page: number;
  pages: number;
  prevHref: string | null;
  nextHref: string | null;
}) {
  if (pages <= 1) return null;

  const className =
    "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold outline-none transition-colors hover:border-brand/40 hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      {prevHref ? (
        <Link to={prevHref} prefetch="intent" className={className}>
          Previous
        </Link>
      ) : (
        <span className="px-3.5 py-1.5 text-sm text-muted-foreground">
          Previous
        </span>
      )}
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {pages}
      </span>
      {nextHref ? (
        <Link to={nextHref} prefetch="intent" className={className}>
          Next
        </Link>
      ) : (
        <span className="px-3.5 py-1.5 text-sm text-muted-foreground">
          Next
        </span>
      )}
    </nav>
  );
}
