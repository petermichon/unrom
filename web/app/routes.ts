import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("devices", "routes/devices.tsx"),
  route("devices/:vendor", "routes/vendor.tsx"),
  route("registry", "routes/registry.tsx"),
  route("roms", "routes/roms.tsx"),
  route("data", "routes/data.tsx"),
  route("devices/:vendor/:codename", "routes/device.tsx"),
  route("roms/:id", "routes/rom.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
] satisfies RouteConfig;
