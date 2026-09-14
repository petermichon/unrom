import { Asterisk, Home, Layers2, Smartphone, TableProperties } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { pathname } = useLocation();
  const isActive = (...paths: string[]) =>
    paths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-1 font-heading font-semibold tracking-tight group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <span
            className="grid size-6 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground"
            aria-hidden="true"
          >
            <Asterisk className="size-4" />
          </span>
          <span className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            unrom
            <Badge
              variant="outline"
              className="px-1.5 py-0 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            >
              beta
            </Badge>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Home"
                isActive={isActive("/")}
                render={<Link to="/" />}
              >
                <Home />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Devices"
                isActive={isActive("/devices", "/device")}
                render={<Link to="/devices" />}
              >
                <Smartphone />
                <span>Devices</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="ROMs"
                isActive={isActive("/roms", "/rom")}
                render={<Link to="/roms" />}
              >
                <Layers2 />
                <span>ROMs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Data"
                isActive={isActive("/data")}
                render={<Link to="/data" />}
              >
                <TableProperties />
                <span>Data</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
