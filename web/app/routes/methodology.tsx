import { Link } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { modifiedMeta, pageMeta } from "@/lib/seo";
import type { Route } from "./+types/methodology";

const LAST_UPDATED = "2026-11-23";

export const meta: Route.MetaFunction = () => [
  ...pageMeta({
    title: "How the data is collected and checked | unrom",
    description:
      "How unrom records device–ROM mappings: the sources it reads, observed and derived citations, what the confidence labels mean, and what the directory does not claim.",
    path: "/methodology",
  }),
  ...modifiedMeta(LAST_UPDATED),
];

const GITHUB_ISSUES = "https://github.com/petermichon/unrom/issues";

export default function MethodologyRoute() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Methodology" }]}
      />

      <PageHeader
        title="Methodology"
        description="How the mappings are collected, what each citation and confidence label means, and what the directory does not claim."
      />

      <div className="flex max-w-[70ch] flex-col gap-8 text-sm leading-relaxed">
        <section aria-labelledby="recorded" className="flex flex-col gap-2">
          <h2
            id="recorded"
            className="font-heading text-xl font-bold tracking-tight"
          >
            What is recorded
          </h2>
          <p className="text-muted-foreground">
            unrom answers one question: which custom ROMs publish a build for a
            given Android device. Each answer is a mapping between a device — a
            vendor and a codename — and a project, with a link to the page that
            reports it. A device with no mapping has no build recorded; that is
            not a verdict, since most Android devices never had a custom ROM.
          </p>
        </section>

        <section aria-labelledby="sources" className="flex flex-col gap-2">
          <h2
            id="sources"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Where the data comes from
          </h2>
          <p className="text-muted-foreground">
            Every project&apos;s own publication: its device roster, build index
            or OTA metadata. The raw response is kept in the repository as a
            snapshot and never edited. A source that changes shape fails the
            build instead of silently dropping data, and the catalogue is
            rebuilt from those snapshots; the footer shows the build date.
          </p>
          <p>
            <Link to="/data" className="hover:underline">
              The whole dataset is downloadable
            </Link>{" "}
            <span className="text-muted-foreground">
              as JSON or SQLite, with the same fields the site shows.
            </span>
          </p>
        </section>

        <section aria-labelledby="citations" className="flex flex-col gap-2">
          <h2
            id="citations"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Observed and derived citations
          </h2>
          <p className="text-muted-foreground">
            An{" "}
            <strong className="font-semibold text-foreground">observed</strong>{" "}
            citation is the URL the source itself published for that device. A{" "}
            <strong className="font-semibold text-foreground">derived</strong>{" "}
            citation is one unrom builds from the codename, such as a
            project&apos;s device page; these are marked in the device table and
            probed, and a mapping loses its citation when the page no longer
            resolves rather than keeping a dead link.
          </p>
          <p className="text-muted-foreground">
            A mapping with no link still records what the source said; it simply
            has no page to check. Most mappings cite an observed roster entry;
            where a project has no per-device page, the derived class is the
            honest label.
          </p>
        </section>

        <section aria-labelledby="confidence" className="flex flex-col gap-2">
          <h2
            id="confidence"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Names and confidence
          </h2>
          <p className="text-muted-foreground">
            Device names are curated. The codename is the identity; the name is
            a reading aid, and each one carries how well the sources back it:
          </p>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[9rem_1fr]">
            <dt className="font-semibold">Verified</dt>
            <dd className="text-muted-foreground">
              The name matches what at least two source rosters report.
            </dd>
            <dt className="font-semibold">Inferred</dt>
            <dd className="text-muted-foreground">
              One source reports the name.
            </dd>
            <dt className="font-semibold">Manual</dt>
            <dd className="text-muted-foreground">
              Curated by hand; the names its sources report do not match it.
            </dd>
            <dt className="font-semibold">Unverified</dt>
            <dd className="text-muted-foreground">
              No source has reported a name for the device.
            </dd>
          </dl>
        </section>

        <section aria-labelledby="freshness" className="flex flex-col gap-2">
          <h2
            id="freshness"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Build dates and freshness
          </h2>
          <p className="text-muted-foreground">
            Build dates and security patch levels are taken from the newest
            build each project lists. When a source publishes neither, the
            mapping says so instead of showing an inferred date. A
            project&apos;s status says whether it ships anything at all; the ROM
            page also states the newest build, and labels an active project
            whose newest build is over a year old.
          </p>
        </section>

        <section aria-labelledby="not-claimed" className="flex flex-col gap-2">
          <h2
            id="not-claimed"
            className="font-heading text-xl font-bold tracking-tight"
          >
            What is not claimed
          </h2>
          <p className="text-muted-foreground">
            Coverage, not endorsement. unrom does not rank projects by quality
            or safety, and a mapping does not promise that a build installs or
            works. Bootloader unlocking is the vendor&apos;s decision: a device
            page shows a vendor policy where one is published and otherwise says
            the answer is unknown.
          </p>
          <p>
            <Link to="/devices" className="hover:underline">
              The device directory
            </Link>{" "}
            <span className="text-muted-foreground">
              states what it does and does not cover.
            </span>
          </p>
        </section>

        <section aria-labelledby="corrections" className="flex flex-col gap-2">
          <h2
            id="corrections"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Corrections
          </h2>
          <p className="text-muted-foreground">
            Snapshots keep what the sources said, and the catalogue is
            regenerated from them, so a wrong or missing mapping is fixed in the
            source data or the curation rather than in the output. Spotted an
            error?{" "}
            <a
              href={GITHUB_ISSUES}
              target="_blank"
              rel="noopener"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Open an issue
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
