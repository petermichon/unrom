/**
 * OpenAPI 3.1 description of the unrom API.
 *
 * Every shape here mirrors `@unrom/contract` — that package stays the single
 * source of truth for the DTOs, and this document is the machine-readable view
 * of it so clients (and their generators) do not have to reverse-engineer the
 * endpoints from the README.
 */

const nullableString = { type: ["string", "null"] };

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
};

const romChipSchema = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
  },
};

const romSupportSchema = {
  type: "object",
  required: ["id", "name", "referenceUrl", "inheritedFrom"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    referenceUrl: { ...nullableString, format: "uri" },
    inheritedFrom: {
      ...nullableString,
      description:
        "Set when the ROM supports this device via a covering build target.",
    },
  },
};

const deviceSummarySchema = {
  type: "object",
  required: ["vendor", "codename", "name", "romCount"],
  properties: {
    vendor: { type: "string" },
    codename: { type: "string" },
    name: nullableString,
    romCount: { type: "integer", minimum: 0 },
  },
};

const browseDeviceSchema = {
  type: "object",
  required: [
    "vendor",
    "vendorName",
    "codename",
    "name",
    "names",
    "aliases",
    "group",
    "roms",
    "confidence",
  ],
  properties: {
    vendor: { type: "string" },
    vendorName: { type: "string" },
    codename: { type: "string" },
    name: { ...nullableString, description: "Primary marketing name." },
    names: {
      type: "array",
      items: { type: "string" },
      description: "Every canonical model name for this codename.",
    },
    aliases: {
      type: "array",
      items: { type: "string" },
      description: "Alternate codenames that resolve to this device.",
    },
    group: {
      type: "array",
      items: { type: "string" },
      description: "Every codename a single build is valid for.",
    },
    roms: { type: "array", items: { $ref: "#/components/schemas/RomChip" } },
    confidence: {
      type: ["string", "null"],
      enum: ["verified", "inferred", "manual", "unverified", null],
      description:
        "How well source data backs the curated names; null when uncurated.",
    },
  },
};

const deviceDetailSchema = {
  type: "object",
  required: [
    "vendor",
    "vendorName",
    "codename",
    "name",
    "names",
    "aliases",
    "group",
    "roms",
    "confidence",
    "sources",
  ],
  properties: {
    vendor: { type: "string" },
    vendorName: { type: "string" },
    codename: { type: "string" },
    name: nullableString,
    names: { type: "array", items: { type: "string" } },
    aliases: { type: "array", items: { type: "string" } },
    group: { type: "array", items: { type: "string" } },
    roms: {
      type: "array",
      items: { $ref: "#/components/schemas/RomSupport" },
    },
    confidence: {
      type: ["string", "null"],
      enum: ["verified", "inferred", "manual", "unverified", null],
      description:
        "How well source data backs the curated names; null when uncurated.",
    },
    sources: {
      type: "array",
      items: { type: "string" },
      description: "ROM ids whose reported names match the curated names.",
    },
  },
};

const registryEntrySchema = {
  type: "object",
  required: [
    "vendor",
    "vendorName",
    "codename",
    "name",
    "names",
    "supported",
    "confidence",
    "sources",
  ],
  properties: {
    vendor: { type: "string" },
    vendorName: { type: "string" },
    codename: { type: "string" },
    name: nullableString,
    names: { type: "array", items: { type: "string" } },
    supported: {
      type: "boolean",
      description:
        "Whether the device appears in the current ROM coverage data.",
    },
    confidence: {
      type: "string",
      enum: ["verified", "inferred", "manual", "unverified"],
      description: "How well source data backs the curated names.",
    },
    sources: {
      type: "array",
      items: { type: "string" },
      description: "ROM ids whose reported names match the curated names.",
    },
  },
};

const romDetailSchema = {
  type: "object",
  required: ["id", "name", "status", "deviceCount", "devices"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    status: {
      type: "string",
      enum: ["active", "discontinued", "unknown"],
      description: "Whether the project still ships builds upstream.",
    },
    deviceCount: {
      type: "integer",
      minimum: 0,
      description:
        "Devices currently in the dataset; 0 for a ROM we track but hold no build data for.",
    },
    devices: {
      type: "array",
      items: { $ref: "#/components/schemas/DeviceSummary" },
    },
  },
};

const mappingSchema = {
  type: "object",
  required: [
    "vendor",
    "vendorName",
    "codename",
    "deviceName",
    "romId",
    "romName",
    "referenceUrl",
    "reportedCodename",
  ],
  properties: {
    vendor: { type: "string" },
    vendorName: { type: "string" },
    codename: { type: "string" },
    deviceName: nullableString,
    romId: { type: "string" },
    romName: { type: "string" },
    referenceUrl: { ...nullableString, format: "uri" },
    reportedCodename: nullableString,
  },
};

const jsonResponse = (schema: unknown) => ({
  description: "Successful response.",
  content: { "application/json": { schema } },
});

const searchParameters = [
  {
    name: "q",
    in: "query",
    required: false,
    description: "Case-insensitive substring match on name or codename.",
    schema: { type: "string" },
  },
  {
    name: "vendor",
    in: "query",
    required: false,
    description: "Exact vendor id, e.g. `google`.",
    schema: { type: "string" },
  },
];

const deviceListParameters = [
  ...searchParameters,
  {
    name: "letter",
    in: "query",
    required: false,
    description:
      "Display-name initial, A-Z, or `#` for names starting with a digit.",
    schema: { type: "string", pattern: "^[A-Z#]$" },
  },
  {
    name: "limit",
    in: "query",
    required: false,
    description: "Page size, 1-200. Omit for the full filtered list.",
    schema: { type: "integer", minimum: 1, maximum: 200 },
  },
  {
    name: "offset",
    in: "query",
    required: false,
    description: "Rows to skip. Defaults to 0.",
    schema: { type: "integer", minimum: 0 },
  },
];

const letterSummarySchema = {
  type: "object",
  required: ["letter", "deviceCount"],
  properties: {
    letter: { type: "string", pattern: "^[A-Z#]$" },
    deviceCount: { type: "integer", minimum: 0 },
  },
};

const brandSummarySchema = {
  type: "object",
  required: ["vendor", "vendorName", "deviceCount", "withRoms"],
  properties: {
    vendor: { type: "string" },
    vendorName: { type: "string" },
    deviceCount: { type: "integer", minimum: 0 },
    withRoms: {
      type: "integer",
      minimum: 0,
      description:
        "Devices with at least one ROM build, directly or via a covered variant.",
    },
  },
};

const romSummarySchema = {
  type: "object",
  required: ["id", "name", "status", "deviceCount"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    status: { type: "string", enum: ["active", "discontinued", "unknown"] },
    deviceCount: { type: "integer", minimum: 0 },
  },
};

const summarySchema = {
  type: "object",
  required: [
    "deviceCount",
    "brandCount",
    "romCount",
    "coveredRomCount",
    "topDevices",
  ],
  properties: {
    deviceCount: { type: "integer", minimum: 0 },
    brandCount: { type: "integer", minimum: 0 },
    romCount: { type: "integer", minimum: 0 },
    coveredRomCount: { type: "integer", minimum: 0 },
    topDevices: {
      type: "array",
      items: { $ref: "#/components/schemas/BrowseDevice" },
    },
  },
};

const searchResponseSchema = {
  type: "object",
  required: ["devices", "brands", "roms", "totals"],
  properties: {
    devices: {
      type: "array",
      items: { $ref: "#/components/schemas/BrowseDevice" },
    },
    brands: {
      type: "array",
      items: { $ref: "#/components/schemas/BrandSummary" },
    },
    roms: {
      type: "array",
      items: { $ref: "#/components/schemas/RomSummary" },
    },
    totals: {
      type: "object",
      required: ["devices", "brands", "roms"],
      properties: {
        devices: { type: "integer", minimum: 0 },
        brands: { type: "integer", minimum: 0 },
        roms: { type: "integer", minimum: 0 },
      },
    },
  },
};

const notFound = {
  description: "No entity matches the requested key.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
};

export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "unrom API",
    version: "1.6.0",
    summary: "Open database for device–ROM compatibility.",
    description:
      "Which custom Android ROMs support which devices. Every response is " +
      "the same JSON the web app renders, and the full dataset is available " +
      "as JSON or SQLite exports. Data is licensed ODbL-1.0; code is AGPL-3.0-only.",
    license: {
      name: "ODbL-1.0",
      url: "https://opendatacommons.org/licenses/odbl/1-0/",
    },
  },
  externalDocs: {
    description: "Source repository",
    url: "https://github.com/petermichon/unrom",
  },
  servers: [{ url: "/", description: "This host" }],
  tags: [
    { name: "meta", description: "Health and dataset freshness." },
    { name: "devices", description: "Devices and their ROM support." },
    { name: "brands", description: "Device counts by vendor." },
    { name: "roms", description: "ROMs and the devices they support." },
    { name: "registry", description: "Curated device name mappings." },
    { name: "data", description: "Flat mappings and bulk exports." },
  ],
  paths: {
    "/api": {
      get: {
        tags: ["meta"],
        summary: "List the available endpoints",
        operationId: "getApiIndex",
        responses: {
          200: jsonResponse({
            type: "object",
            required: ["name", "endpoints"],
            properties: {
              name: { type: "string" },
              endpoints: { type: "array", items: { type: "string" } },
            },
          }),
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["meta"],
        summary: "Liveness probe",
        operationId: "getHealth",
        responses: {
          200: jsonResponse({
            type: "object",
            required: ["ok"],
            properties: { ok: { type: "boolean" } },
          }),
        },
      },
    },
    "/api/meta": {
      get: {
        tags: ["meta"],
        summary: "Dataset freshness",
        description:
          "`contentHash` changes whenever the baked dataset changes, so it " +
          "doubles as a cheap ETag for clients.",
        operationId: "getMeta",
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/Meta" }),
        },
      },
    },
    "/api/summary": {
      get: {
        tags: ["meta"],
        summary: "Dataset counts and top ROM-covered devices",
        operationId: "getSummary",
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/Summary" }),
        },
      },
    },
    "/api/devices": {
      get: {
        tags: ["devices"],
        summary: "Browse devices",
        description:
          "Returns devices matching the filters. Use `limit`/`offset` and the " +
          "`x-total-count` response header for paged browsing; without a limit " +
          "the full filtered list is returned.",
        operationId: "listDevices",
        parameters: deviceListParameters,
        responses: {
          200: {
            ...jsonResponse({
              type: "array",
              items: { $ref: "#/components/schemas/BrowseDevice" },
            }),
            headers: {
              "x-total-count": {
                description: "Total rows matching the filters, before paging.",
                schema: { type: "integer", minimum: 0 },
              },
            },
          },
        },
      },
    },
    "/api/devices/{vendor}/{codename}": {
      get: {
        tags: ["devices"],
        summary: "Get one device with its ROM support",
        operationId: "getDevice",
        parameters: [
          {
            name: "vendor",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "codename",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/DeviceDetail" }),
          404: notFound,
        },
      },
    },
    "/api/brands": {
      get: {
        tags: ["brands"],
        summary: "List brands with device and ROM counts",
        operationId: "listBrands",
        responses: {
          200: jsonResponse({
            type: "array",
            items: { $ref: "#/components/schemas/BrandSummary" },
          }),
        },
      },
    },
    "/api/devices/letters": {
      get: {
        tags: ["devices"],
        summary: "Device counts by first letter",
        operationId: "listDeviceLetters",
        responses: {
          200: jsonResponse({
            type: "array",
            items: { $ref: "#/components/schemas/LetterSummary" },
          }),
        },
      },
    },
    "/api/search": {
      get: {
        tags: ["search"],
        summary: "Grouped search over devices, brands and ROMs",
        description:
          "Caps results (20 devices, 10 brands, 20 ROMs) and reports totals " +
          "for each group.",
        operationId: "search",
        parameters: [
          {
            name: "q",
            in: "query",
            required: false,
            description: "Search terms; every term must match.",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: jsonResponse({
            $ref: "#/components/schemas/SearchResponse",
          }),
        },
      },
    },
    "/api/registry": {
      get: {
        tags: ["registry"],
        summary: "Browse curated name mappings",
        operationId: "listRegistry",
        parameters: [...searchParameters],
        responses: {
          200: jsonResponse({
            type: "array",
            items: { $ref: "#/components/schemas/RegistryEntry" },
          }),
        },
      },
    },
    "/api/roms": {
      get: {
        tags: ["roms"],
        summary: "List ROMs",
        description: "Includes the devices each ROM supports.",
        operationId: "listRoms",
        responses: {
          200: jsonResponse({
            type: "array",
            items: { $ref: "#/components/schemas/RomDetail" },
          }),
        },
      },
    },
    "/api/roms/{id}": {
      get: {
        tags: ["roms"],
        summary: "Get one ROM",
        operationId: "getRom",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/RomDetail" }),
          404: notFound,
        },
      },
    },
    "/api/data": {
      get: {
        tags: ["data"],
        summary: "Flat device–ROM mappings",
        description:
          "One row per (device, ROM) pair, with provenance for each edge.",
        operationId: "listMappings",
        responses: {
          200: jsonResponse({
            type: "array",
            items: { $ref: "#/components/schemas/Mapping" },
          }),
        },
      },
    },
    "/api/export/json": {
      get: {
        tags: ["data"],
        summary: "Download the full dataset as JSON",
        operationId: "exportJson",
        responses: {
          200: {
            description: "Dataset attachment.",
            content: {
              "application/json": { schema: { type: "object" } },
            },
          },
        },
      },
    },
    "/api/export/sqlite": {
      get: {
        tags: ["data"],
        summary: "Download the full dataset as SQLite",
        operationId: "exportSqlite",
        responses: {
          200: {
            description: "SQLite database attachment.",
            content: {
              "application/vnd.sqlite3": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: errorSchema,
      Meta: {
        type: "object",
        required: ["generatedAt", "contentHash"],
        properties: {
          generatedAt: { type: "string", format: "date-time" },
          contentHash: { type: "string" },
        },
      },
      RomChip: romChipSchema,
      RomSupport: romSupportSchema,
      DeviceSummary: deviceSummarySchema,
      BrowseDevice: browseDeviceSchema,
      LetterSummary: letterSummarySchema,
      BrandSummary: brandSummarySchema,
      RomSummary: romSummarySchema,
      Summary: summarySchema,
      SearchResponse: searchResponseSchema,
      DeviceDetail: deviceDetailSchema,
      RegistryEntry: registryEntrySchema,
      RomDetail: romDetailSchema,
      Mapping: mappingSchema,
    },
  },
};
