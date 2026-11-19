import {
  Clock,
  LayoutGridCircles,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";

import { MENU_BRANDS, MENU_ROMS } from "@/lib/nav";
import { PanelCard } from "@/components/PanelCard";
import { hasRomMenuMark, RomMenuMark } from "@/components/RomMenuMark";
import { cn } from "@/lib/utils";

interface MenuCardsProps {
  onNavigate: () => void;
  /** Grid columns for the shell; the items themselves are identical. */
  className?: string;
}

const GRID = "grid gap-1.5";

/**
 * Lucide draws on a 24-unit grid, so at 20px its 2-unit stroke lands at about
 * 1.67px. A small bump matches the solid brand and ROM marks; 2.5 starts to
 * clog the grid-circles glyph.
 */
const DEVICE_ICON_STROKE = 2.25;

/** The fallback mark for a vendor or project with no published glyph. */
function Monogram({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="text-sm font-bold">
      {name.charAt(0)}
    </span>
  );
}

/**
 * The menu is curated navigation, not a data view: it renders before any
 * request and stays usable when the API is down. Live counts and statuses
 * belong to the pages it opens. Shared by the desktop mega panel and the phone
 * sheet so the two cannot drift.
 */
export function DeviceMenuCards({ onNavigate, className }: MenuCardsProps) {
  return (
    <div className={cn(GRID, className)}>
      <PanelCard
        to="/device-groups/hardened"
        title="Hardened"
        subtitle="Patches, relock and mitigations"
        icon={<Shield className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/device-groups/relock-supported"
        title="Relock supported"
        subtitle="A documented relock path"
        icon={<Lock className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/device-groups/recently-updated"
        title="Recently updated"
        subtitle="Newest build in the last 90 days"
        icon={<Clock className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/device-groups/with-roms"
        title="Devices with ROMs"
        subtitle="Only devices with ROM data"
        icon={
          <Smartphone className="size-5" strokeWidth={DEVICE_ICON_STROKE} />
        }
        onNavigate={onNavigate}
      />
      {/* The desktop trigger is the full index, so this card exists only for
          the phone sheet, which has no trigger. */}
      <PanelCard
        to="/devices"
        title="All devices"
        subtitle="Search by name or codename"
        icon={
          <LayoutGridCircles
            className="size-5"
            strokeWidth={DEVICE_ICON_STROKE}
          />
        }
        onNavigate={onNavigate}
        className="lg:hidden"
      />
    </div>
  );
}

export function BrandMenuCards({ onNavigate, className }: MenuCardsProps) {
  return (
    <div className={cn(GRID, className)}>
      {MENU_BRANDS.map((brand) => (
        <PanelCard
          key={brand.id}
          to={`/devices/${brand.id}`}
          title={brand.name}
          subtitle={brand.description}
          icon={<Monogram name={brand.name} />}
          onNavigate={onNavigate}
        />
      ))}
      <PanelCard
        to="/brands"
        title="All brands"
        subtitle="Full catalogue"
        icon={<LayoutGridCircles className="size-5" />}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export function RomMenuCards({ onNavigate, className }: MenuCardsProps) {
  return (
    <div className={cn(GRID, className)}>
      {MENU_ROMS.map((rom) => (
        <PanelCard
          key={rom.id}
          to={`/roms/${rom.id}`}
          title={rom.name}
          subtitle={rom.description}
          icon={
            hasRomMenuMark(rom.id) ? (
              <RomMenuMark id={rom.id} />
            ) : (
              <Monogram name={rom.name} />
            )
          }
          onNavigate={onNavigate}
        />
      ))}
      <PanelCard
        to="/roms"
        title="All ROMs"
        subtitle="Full catalogue"
        icon={<LayoutGridCircles className="size-5" />}
        onNavigate={onNavigate}
      />
    </div>
  );
}
