import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("data", "routes/data.tsx"),
  route("legal", "routes/legal.tsx"),
  route("methodology", "routes/methodology.tsx"),
  route("brands", "routes/brands.tsx"),
  route("device-groups", "routes/device-groups.tsx"),
  route("device-groups/:group", "routes/device-group.tsx"),
  route("devices", "routes/devices.tsx"),
  route("devices/letter/:letter", "routes/device-letter.tsx"),
  route("devices/:vendor", "routes/vendor.tsx"),
  route("roms", "routes/roms.tsx"),
  route("devices/:vendor/:codename", "routes/device.tsx"),
  route("roms/:id", "routes/rom.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("sitemap-pages.xml", "routes/sitemap-pages.ts"),
  route("sitemap-devices.xml", "routes/sitemap-devices.ts"),
  route("sitemap-brands.xml", "routes/sitemap-brands.ts"),
  route("sitemap-roms.xml", "routes/sitemap-roms.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
