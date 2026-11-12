export interface RomPhoneSlide {
  id: string;
  name: string;
}

/** White marks for the ROMs that have one, from their own projects. */
export const ROM_LOGOS: Record<string, string> = {
  lineageos: "/brand/lineageos.png",
  "lineageos-microg": "/brand/lineageos.png",
  grapheneos: "/brand/grapheneos.svg",
  eos: "/brand/eos.png",
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
}: {
  slides: RomPhoneSlide[];
  index: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative w-[14.5rem] shrink-0 select-none"
    >
      <span className="absolute -bottom-5 left-1/2 h-10 w-[82%] -translate-x-1/2 rounded-full bg-black/20 blur-xl dark:bg-black/70" />

      <div className="relative flex h-[30rem] w-full flex-col overflow-hidden rounded-4xl bg-[#101318] p-[6px] shadow-[0_28px_50px_-28px_rgba(13,16,36,0.55)] ring-1 ring-black/15 dark:bg-[#0b0e15] dark:ring-white/20">
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
              {ROM_LOGOS[rom.id] && (
                <img src={ROM_LOGOS[rom.id]} alt="" className="h-10 w-auto" />
              )}
              <span className="max-w-[85%] text-center font-heading text-[26px] leading-[1.05] font-bold tracking-[-0.03em]">
                {rom.name}
              </span>
              <span className="h-[3px] w-28 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full w-10 rounded-full bg-[var(--hero-accent)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
