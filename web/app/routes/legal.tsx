import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { modifiedMeta, pageMeta } from "@/lib/seo";
import type { Route } from "./+types/legal";

const CONTACT_EMAIL = "legal@unrom.com";
const LAST_UPDATED = "2026-11-14";

export const meta: Route.MetaFunction = () => [
  ...pageMeta({
    title: "Legal notice and privacy | unrom",
    description:
      "Publisher, host, and personal-data information for unrom, a personal non-commercial open-source project.",
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
        description="Publisher, host, and personal-data information for unrom."
      />

      <p className="text-sm text-muted-foreground">
        Last updated <time dateTime={LAST_UPDATED}>14 November 2026</time>.
      </p>

      <section aria-labelledby="publisher" className="flex flex-col gap-2">
        <h2
          id="publisher"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Publisher
        </h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="text-muted-foreground">Publisher</dt>
          <dd>
            An individual publishing unrom on a non-professional basis,
            anonymous under Article 1-1 II of the LCEN.
          </dd>
          <dt className="text-muted-foreground">Contact</dt>
          <dd>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </dd>
        </dl>
        <p className="text-sm text-muted-foreground">
          The publisher&apos;s identification details required by Article 1-1 II
          are on file with the host and are not published here. The host may
          disclose them to a judicial authority.
        </p>
      </section>

      <section aria-labelledby="host" className="flex flex-col gap-2">
        <h2 id="host" className="font-heading text-xl font-bold tracking-tight">
          Host
        </h2>
        <address className="text-sm not-italic">
          OVH SAS
          <br />
          2 rue Kellermann
          <br />
          59100 Roubaix
          <br />
          France
          <br />
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
          className="font-heading text-xl font-bold tracking-tight"
        >
          Personal data
        </h2>
        <p className="text-sm text-muted-foreground">
          The publisher is the data controller for the processing described
          here.
        </p>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[12rem_1fr]">
          <dt className="text-muted-foreground">Server logs</dt>
          <dd className="text-muted-foreground">
            IP address, request headers (including user agent, accept-language,
            and referrer when present), timestamp, and requested URL. Query
            strings are stripped and cookie values are redacted. Purpose:
            security, abuse prevention, and aggregate traffic reporting. Legal
            basis: legitimate interest. Retention: up to 30 days.
          </dd>

          <dt className="text-muted-foreground">Analytics</dt>
          <dd className="text-muted-foreground">
            A self-hosted Umami instance at{" "}
            <a
              href="https://stats.unrom.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              stats.unrom.com
            </a>{" "}
            records page URL, referrer, title, screen size, language, browser,
            operating system, device type, and country. It is cookieless. Umami
            uses the IP address to derive the country; the analytics database
            does not store the IP address. The access logs described above do
            retain it for up to 30 days. Purpose: audience measurement. Legal
            basis: legitimate interest. Retention: up to 12 months.
          </dd>

          <dt className="text-muted-foreground">Recipients</dt>
          <dd className="text-muted-foreground">
            OVHcloud hosts the site and analytics. Proton processes email sent
            to {CONTACT_EMAIL}. No data is sold or shared for advertising.
          </dd>

          <dt className="text-muted-foreground">Your rights</dt>
          <dd className="text-muted-foreground">
            You have the right to access, rectify, erase, restrict, or object to
            the processing of your personal data, and to data portability. Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            to exercise them. You can also complain to the CNIL at{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              cnil.fr
            </a>{" "}
            or to your local EU supervisory authority.
          </dd>
        </dl>
      </section>
    </div>
  );
}
