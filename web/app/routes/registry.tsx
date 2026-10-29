import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RegistryTable from "@/components/RegistryTable";
import { fetchRegistry } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/registry";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const entries = loaderData?.entries ?? [];
  const updatedAt = updatedAtFromMatches(matches);
  const supported = entries.filter((entry) => entry.supported);

  return [
    ...pageMeta({
      title: "Registry — unrom",
      description: `${entries.length} curated vendor and codename to model name mappings, with provenance and confidence. Look up a device name in either direction.`,
      path: "/registry",
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        "Supported devices",
        supported.map((entry) => ({
          name: entry.name ?? entry.codename,
          path: `/devices/${entry.vendor}/${entry.codename}`,
        })),
      ),
    },
  ];
};

export async function loader() {
  return { entries: await fetchRegistry() };
}

export async function clientLoader() {
  return { entries: await fetchRegistry() };
}

export default function RegistryRoute() {
  const { entries } = useLoaderData<typeof loader>();
  const supported = entries.filter((entry) => entry.supported).length;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Registry" }]}
      />

      <PageHeader
        title="Registry"
        description={`${entries.length} curated model names, ${supported} of them on supported devices.`}
      />

      <RegistryTable entries={entries} />
    </div>
  );
}
