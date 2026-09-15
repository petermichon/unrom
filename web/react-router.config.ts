import type { Config } from "@react-router/dev/config";

// SSR app: routes render on the server per request and hydrate on the client.
// Loaders read the API (see `app/lib/data.ts`); the contract is type-only.
export default {
  ssr: true,
} satisfies Config;
