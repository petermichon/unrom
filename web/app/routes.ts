import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("devices", "routes/devices.tsx"),
  route("roms", "routes/roms.tsx"),
  route("data", "routes/data.tsx"),
  route("devices/:codename", "routes/device.tsx"),
  route("roms/:id", "routes/rom.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  // Legacy singular paths.
  route("device/:codename", "routes/legacy-device.ts"),
  route("rom/:id", "routes/legacy-rom.ts"),
] satisfies RouteConfig;
