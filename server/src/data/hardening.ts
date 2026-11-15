/**
 * ROMs whose own documentation covers the two facts "hardened" needs beyond
 * relocking: that its builds include the Android security bulletins, and which
 * platform mitigations it ships. Both are quoted, project-level statements —
 * what the project says about itself, not a verification by unrom.
 */
export interface HardeningStatement {
  summary: string;
  sourceUrl: string;
  verifiedAt: string;
}

export const HARDENED_ROMS: Record<
  string,
  { patches: HardeningStatement; mitigations: HardeningStatement }
> = {
  grapheneos: {
    patches: {
      summary:
        "The release notes state which Android security bulletins each build includes; the current release lists the latest monthly bulletins.",
      sourceUrl: "https://grapheneos.org/releases",
      verifiedAt: "2026-11-15",
    },
    mitigations: {
      summary:
        "Documents a hardened libc and memory allocator, hardware memory tagging for slab allocations, and other exploit mitigations.",
      sourceUrl: "https://grapheneos.org/features#exploit-mitigations",
      verifiedAt: "2026-11-15",
    },
  },
};
