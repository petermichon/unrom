import { Clock, LayoutGridCircles, Lock, Shield } from "lucide-react";

import { MENU_BRANDS, MENU_ROMS } from "@/lib/nav";
import { PanelCard } from "@/components/PanelCard";
import { RomGlyph } from "@/components/RomMark";
import { ROM_BOLD_MARKS, ROM_LOGOS } from "@/components/RomPhone";
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
        to="/devices?hardened=1"
        title="Hardened"
        subtitle="Patches, relock and mitigations"
        icon={<Shield className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/devices?relock=supported"
        title="Relock supported"
        subtitle="A documented relock path"
        icon={<Lock className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/devices?updated=90"
        title="Recently updated"
        subtitle="Newest build in the last 90 days"
        icon={<Clock className="size-5" strokeWidth={DEVICE_ICON_STROKE} />}
        onNavigate={onNavigate}
      />
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
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
}

export function RomMenuCards({ onNavigate, className }: MenuCardsProps) {
  return (
    <div className={cn(GRID, className)}>
      {MENU_ROMS.map((rom) => {
        const logo = ROM_BOLD_MARKS[rom.id] ?? ROM_LOGOS[rom.id];
        return (
          <PanelCard
            key={rom.id}
            to={`/roms/${rom.id}`}
            title={rom.name}
            subtitle={rom.description}
            icon={
              logo ? (
                <RomGlyph
                  id={rom.id}
                  src={logo}
                  className={
                    rom.id === "lineageos"
                      ? "h-3 w-7"
                      : rom.id === "grapheneos"
                        ? "size-6"
                        : "size-5"
                  }
                />
              ) : (
                <Monogram name={rom.name} />
              )
            }
            onNavigate={onNavigate}
          />
        );
      })}
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
