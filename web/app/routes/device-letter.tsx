import { redirect } from "react-router";
import type { Route } from "./+types/device-letter";

// Letter browsing moved into the directory's `letter` filter. Keep the old
// URLs as permanent redirects so existing links and indexed pages resolve.
function target(value: string): string {
  const letter =
    value === "0-9"
      ? "#"
      : value === "other"
        ? "other"
        : /^[A-Za-z]$/.test(value)
          ? value.toUpperCase()
          : null;
  if (!letter) throw new Response("Not found", { status: 404 });
  const slug =
    letter === "#"
      ? "0-9"
      : letter === "other"
        ? "other"
        : letter.toLowerCase();
  return `/devices?letter=${slug}`;
}

export async function loader({ params }: Route.LoaderArgs) {
  throw redirect(target(params.letter), 301);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  throw redirect(target(params.letter), 301);
}
