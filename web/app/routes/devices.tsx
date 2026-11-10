import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { fetchDeviceLetters } from "@/lib/data";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/devices";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const letters = loaderData?.letters ?? [];
  const total = letters.reduce((sum, letter) => sum + letter.deviceCount, 0);

  return [
    ...pageMeta({
      title: "Android devices and ROM support | unrom",
      description: `${formatNumber(total)} devices. Browse by first letter, open a brand, or search by name or codename.`,
      path: "/devices",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
  ];
};

export async function loader() {
  return { letters: await fetchDeviceLetters() };
}

export async function clientLoader() {
  return { letters: await fetchDeviceLetters() };
}

export default function DevicesRoute() {
  const { letters } = useLoaderData<typeof loader>();
  const total = letters.reduce((sum, letter) => sum + letter.deviceCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description={`${formatNumber(total)} devices. Pick a letter, or use search above to find a device by name or codename.`}
        endpoint="/api/devices"
      />

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {letters.map((letter) => (
          <li key={letter.letter}>
            <Link
              to={`/devices/letter/${
                letter.letter === "#"
                  ? "0-9"
                  : letter.letter === "other"
                    ? "other"
                    : letter.letter.toLowerCase()
              }`}
              prefetch="intent"
              className="directory-row"
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-heading text-2xl font-extrabold tracking-[-0.02em]">
                  {letter.letter === "#"
                    ? "0–9"
                    : letter.letter === "other"
                      ? "Other"
                      : letter.letter}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatNumber(letter.withRoms)} with{" "}
                  {letter.withRoms === 1 ? "ROM" : "ROMs"}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatNumber(letter.deviceCount)}{" "}
                {letter.deviceCount === 1 ? "device" : "devices"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Prefer brands?{" "}
        <Link
          to="/brands"
          className="text-foreground hover:underline"
          prefetch="intent"
        >
          Browse by brand
        </Link>{" "}
        instead.
      </p>
    </div>
  );
}
