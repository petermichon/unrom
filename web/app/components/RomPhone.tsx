import { RomGlyph } from "@/components/RomMark";

export interface RomPhoneSlide {
  id: string;
  name: string;
}

/** Marks for the ROMs that have one, from their own projects. */
export const ROM_LOGOS: Record<string, string> = {
  alphadroid: "/brand/alphadroid.svg",
  calyxos: "/brand/calyxos.png",
  crdroid: "/brand/crdroid.svg",
  derpfest: "/brand/derpfest.png",
  eos: "/brand/eos.png",
  evolutionx: "/brand/evolutionx.svg",
  grapheneos: "/brand/grapheneos.svg",
  iode: "/brand/iode.svg",
  "kali-nethunter": "/brand/kali-nethunter.png",
  lineageos: "/brand/lineageos.png",
  "lineageos-microg": "/brand/lineageos.png",
  pixelos: "/brand/pixelos.svg",
  projectinfinityx: "/brand/projectinfinityx.svg",
};

/**
 * Heavier variants for the all-ROMs banner, where a row of marks sits at the
 * same optical weight as the solid ones (CalyxOS, /e/OS). The exact artwork is
 * kept for the small menu tiles, where thinner strokes read better.
 */
export const ROM_BOLD_MARKS: Record<string, string> = {
  grapheneos: "/brand/grapheneos-bold.png",
  iode: "/brand/iode-bold.svg",
  lineageos: "/brand/lineageos-bold.png",
};

/** Vector marks for large decorative uses such as the ROM page watermark. */
export const ROM_MARKS: Record<string, string> = {
  lineageos: "/brand/lineageos.svg",
  "lineageos-microg": "/brand/lineageos.svg",
};

/**
 * The phone used by the home hero and ROM pages. Device geometry, not a UI
 * surface, so the radii and shadow sit outside the interface's shape scale.
 */
export function RomPhone({
  slides,
  index,
  label,
}: {
  slides: RomPhoneSlide[];
  index: number;
  /** When the phone is the content (a slide picker steps it), name it. */
  label?: string;
}) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="relative w-[14.5rem] shrink-0 select-none"
    >
      <span className="absolute -bottom-5 left-1/2 h-10 w-[82%] -translate-x-1/2 rounded-full bg-black/20 blur-xl dark:bg-black/40" />

      <div className="relative flex h-[30rem] w-full flex-col overflow-hidden rounded-4xl bg-[#101318] p-[6px] shadow-[0_28px_50px_-28px_rgba(13,16,36,0.55)] ring-1 ring-black/15 dark:bg-[#1a1d25] dark:ring-white/20">
        <span className="absolute top-20 -left-px h-8 w-[2px] rounded-l-full bg-white/25" />
        <span className="absolute top-32 -left-px h-12 w-[2px] rounded-l-full bg-white/25" />
        <span className="absolute top-24 -right-px h-14 w-[2px] rounded-r-full bg-white/25" />

        <div className="relative h-full overflow-hidden rounded-3xl bg-[#06080e] text-white">
          {slides.map((rom, position) => (
            <div
              key={rom.id}
              data-motion
              className={`absolute inset-0 flex flex-col items-center justify-center gap-6 pb-12 transition-opacity ${
                position === index ? "opacity-100" : "opacity-0"
              }`}
            >
              {ROM_LOGOS[rom.id] &&
                (rom.id === "eos" ? (
                  // /e/OS ships a colour mark; mask it so the screen stays
                  // monochrome like the other slides.
                  <RomGlyph
                    id={rom.id}
                    src={ROM_LOGOS[rom.id]}
                    className="size-10"
                  />
                ) : (
                  <img src={ROM_LOGOS[rom.id]} alt="" className="h-10 w-auto" />
                ))}
              <span className="max-w-[85%] text-center font-heading text-[26px] leading-[1.05] font-bold tracking-[-0.03em]">
                {rom.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
