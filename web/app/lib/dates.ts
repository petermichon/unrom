// Fixed locale and UTC so the server and the client render the same string.
// The API keeps `YYYY-MM-DD`; only the display is human.
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** `2026-06-08` → `8 Jun 2026`. */
export const formatDate = (iso: string) => DATE_FORMAT.format(asDate(iso));

/** `2026-06-01` → `Jun 2026`, the precision a patch level carries. */
export const formatMonth = (iso: string) => MONTH_FORMAT.format(asDate(iso));
