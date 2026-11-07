import { Link } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { modifiedMeta, pageMeta } from "@/lib/seo";
import type { Route } from "./+types/legal";

const REPO_URL = "https://github.com/petermichon/unrom";
const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";
const CONTACT_EMAIL = "contact@unrom.com";
const LAST_UPDATED = "2026-11-08";

export const meta: Route.MetaFunction = () => [
  ...pageMeta({
    title: "Legal notice and privacy | unrom",
    description:
      "Legal notice, privacy, cookies, and licensing for unrom, a personal non-commercial open-source device–ROM database.",
    path: "/legal",
  }),
  ...modifiedMeta(LAST_UPDATED),
];

export default function LegalRoute() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Legal" }]} />

      <PageHeader
        title="Legal"
        description="Legal notice, privacy, cookies, and licensing for unrom."
      />

      <p className="text-xs text-muted-foreground">
        Last updated <time dateTime={LAST_UPDATED}>8 November 2026</time>.
      </p>

      <section aria-labelledby="publisher" className="flex flex-col gap-2">
        <h2
          id="publisher"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Publisher
        </h2>
        <p className="text-sm text-muted-foreground">
          unrom is a personal, non-commercial open-source project. It is not a
          company and does not sell products or services.
        </p>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="text-muted-foreground">Publisher</dt>
          <dd>
            A non-professional individual who has chosen to remain anonymous
            under Article 6 III 2 of the LCEN.
          </dd>
          <dt className="text-muted-foreground">Publication director</dt>
          <dd>The publisher.</dd>
          <dt className="text-muted-foreground">Contact</dt>
          <dd>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            or{" "}
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              GitHub issues
            </a>
          </dd>
        </dl>
        <p className="text-xs text-muted-foreground">
          The publisher&apos;s identity has been communicated to the host and is
          not published here. The host may disclose it to a judicial authority.
        </p>
      </section>

      <section aria-labelledby="host" className="flex flex-col gap-2">
        <h2
          id="host"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Host
        </h2>
        <address className="text-sm text-muted-foreground not-italic">
          OVH SAS
          <br />
          2 rue Kellermann
          <br />
          59100 Roubaix
          <br />
          France
          <br />
          Phone:{" "}
          <a
            href="tel:+33972101007"
            className="hover:text-foreground hover:underline"
          >
            +33 9 72 10 10 07
          </a>
          <br />
          <a
            href="https://www.ovhcloud.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            ovhcloud.com
          </a>
        </address>
      </section>

      <section aria-labelledby="privacy" className="flex flex-col gap-2">
        <h2
          id="privacy"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Privacy
        </h2>
        <p className="text-sm text-muted-foreground">
          unrom has no accounts, newsletters, contact forms, advertising, or
          tracking cookies. Two kinds of data are processed:
        </p>
        <h3 className="text-sm font-semibold">Server logs</h3>
        <p className="text-sm text-muted-foreground">
          The web server may record your IP address, user agent, timestamp, and
          requested URL for security and abuse prevention. Legal basis:
          legitimate interest. Retention: up to 30 days.
        </p>
        <h3 className="text-sm font-semibold">Analytics</h3>
        <p className="text-sm text-muted-foreground">
          We use a self-hosted Umami instance at{" "}
          <a
            href="https://stats.unrom.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            stats.unrom.com
          </a>{" "}
          to count page views. It is cookieless and does not track you across
          sites. It records the page URL, referrer, title, screen size,
          language, browser, operating system, device type, and country. The
          server may process your IP address to derive the country and prevent
          abuse. Analytics is disabled when your browser sends Do Not Track.
          Retention: up to 12 months.
        </p>
        <p className="text-sm text-muted-foreground">
          We do not sell data or share it for advertising. The site and
          analytics are self-hosted on OVHcloud infrastructure.
        </p>
        <h3 className="text-sm font-semibold">Your rights</h3>
        <p className="text-sm text-muted-foreground">
          You have the right to access, rectify, erase, restrict, or object to
          the processing of your personal data, and to data portability. Contact{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-foreground hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . You can also complain to the CNIL at{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            cnil.fr
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="cookies" className="flex flex-col gap-2">
        <h2
          id="cookies"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Cookies and local storage
        </h2>
        <p className="text-sm text-muted-foreground">
          No cookies are used for analytics. The theme preference is stored in{" "}
          <code>localStorage</code>. Umami does not write cookies or{" "}
          <code>localStorage</code>; it only reads an optional{" "}
          <code>umami.disabled</code> flag if you choose to opt out. These are
          functional and are not used for tracking.
        </p>
      </section>

      <section aria-labelledby="licenses" className="flex flex-col gap-2">
        <h2
          id="licenses"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Licenses and attribution
        </h2>
        <p className="text-sm text-muted-foreground">
          Data is licensed under the{" "}
          <a
            href={ODBL_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            Open Database License (ODbL) 1.0
          </a>
          . Code is licensed under{" "}
          <a
            href={`${REPO_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            AGPL-3.0-only
          </a>
          . See the{" "}
          <Link to="/data" className="hover:text-foreground hover:underline">
            data page
          </Link>{" "}
          for exports, provenance, and attribution.
        </p>
        <p className="text-sm text-muted-foreground">
          Android is a trademark of Google LLC. Other product names, logos, and
          brands belong to their respective owners and are used for
          identification only. unrom is not affiliated with or endorsed by them.
        </p>
      </section>

      <section aria-labelledby="liability" className="flex flex-col gap-2">
        <h2
          id="liability"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Liability
        </h2>
        <p className="text-sm text-muted-foreground">
          The data is provided as-is, without warranty of accuracy,
          completeness, or fitness for a particular purpose. External links are
          not under our control.
        </p>
      </section>

      <section aria-labelledby="contact" className="flex flex-col gap-2">
        <h2
          id="contact"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Contact
        </h2>
        <p className="text-sm text-muted-foreground">
          Questions, corrections, or privacy requests:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-foreground hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground hover:underline"
          >
            GitHub issues
          </a>
          .
        </p>
      </section>
    </div>
  );
}
