import type { Config } from "@react-router/dev/config";
import { devices } from "./app/fixtures/devices";

// SSG + SPA, no SSR: pre-render every route to static HTML at build time,
// then hydrate into a client-side router. Deploy `build/client` statically.
export default {
  ssr: false,
  prerender: () => {
    const devicePaths = devices.map((device) => `/device/${device.codename}`);
    const romPaths = [...new Set(devices.flatMap((d) => d.roms.map((r) => r.id)))].map(
      (id) => `/rom/${id}`
    );
    return ["/", "/devices", "/roms", "/data", ...devicePaths, ...romPaths];
  },
} satisfies Config;
