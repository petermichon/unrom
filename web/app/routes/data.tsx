import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExportMenu } from "@/components/ExportMenu";
import MappingsTable from "@/components/MappingsTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchMappings } from "@/lib/data";
import {
  SITE_URL,
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/data";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const mappings = loaderData?.mappings ?? [];
  const updatedAt = updatedAtFromMatches(matches);
  const deviceCount = new Set(
    mappings.map((mapping) => `${mapping.vendor}/${mapping.codename}`),
  ).size;
  const romCount = new Set(mappings.map((mapping) => mapping.romId)).size;
  const description = `${mappings.length} device–ROM pairs across ${deviceCount} devices and ${romCount} custom ROMs, available via API and as JSON or SQLite exports.`;

  return [
    ...pageMeta({
      title: "Data — unrom",
      description,
      path: "/data",
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "unrom device–ROM compatibility dataset",
        description,
        url: `${SITE_URL}/data`,
        license: "https://opendatacommons.org/licenses/odbl/1-0/",
        isAccessibleForFree: true,
        creator: { "@type": "Organization", name: "unrom", url: SITE_URL },
        ...(updatedAt ? { dateModified: updatedAt } : {}),
        distribution: [
          {
            "@type": "DataDownload",
            name: "JSON export",
            contentUrl: `${SITE_URL}/api/export/json`,
            encodingFormat: "application/json",
          },
          {
            "@type": "DataDownload",
            name: "SQLite export",
            contentUrl: `${SITE_URL}/api/export/sqlite`,
            encodingFormat: "application/vnd.sqlite3",
          },
        ],
      },
    },
  ];
};

export async function loader() {
  return { mappings: await fetchMappings() };
}

export async function clientLoader() {
  return { mappings: await fetchMappings() };
}

export default function DataRoute() {
  const { mappings } = useLoaderData<typeof loader>();
  const deviceCount = new Set(
    mappings.map((mapping) => `${mapping.vendor}/${mapping.codename}`),
  ).size;
  const romCount = new Set(mappings.map((mapping) => mapping.romId)).size;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Data" }]} />

      <PageHeader
        title="Data"
        description={`${mappings.length} device–ROM pairs across ${deviceCount} devices and ${romCount} ROMs. One row per pair, available via API and export.`}
        endpoint="/api/data"
        actions={<ExportMenu />}
      />

      <MappingsTable mappings={mappings} />
    </div>
  );
}
