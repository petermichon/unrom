import { Clock, LayoutGrid, Lock, Shield } from "lucide-react";

import { MENU_BRANDS, MENU_ROMS } from "@/lib/nav";
import { PanelCard } from "@/components/PanelCard";
import { RomGlyph } from "@/components/RomMark";
import { ROM_BOLD_MARKS, ROM_LOGOS } from "@/components/RomPhone";
import { cn } from "@/lib/utils";

interface MenuCardsProps {
  onNavigate: () => void;
  /** Grid columns for the shell; the cards themselves are identical. */
  className?: string;
}

const GRID = "grid gap-1.5";

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
        icon={<Shield className="size-5" />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/devices?relock=supported"
        title="Relock supported"
        subtitle="A documented relock path"
        icon={<Lock className="size-5" />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/devices?updated=90"
        title="Recently updated"
        subtitle="Newest build in the last 90 days"
        icon={<Clock className="size-5" />}
        onNavigate={onNavigate}
      />
      <PanelCard
        to="/devices"
        title="All devices"
        subtitle="Search by name or codename"
        icon={<LayoutGrid className="size-5" />}
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
          onNavigate={onNavigate}
        />
      ))}
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
                <span className="text-sm font-bold">{rom.name.charAt(0)}</span>
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
        icon={<LayoutGrid className="size-5" />}
        onNavigate={onNavigate}
      />
    </div>
  );
}
