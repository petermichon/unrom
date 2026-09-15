// Device identity is the codename, but sources disagree on its casing. We
// canonicalize explicitly (reviewable) with a case-insensitive fallback
// (first-seen wins) for anything new, and record the merges as aliases.
//
// Canonical casing follows the most authoritative source for each device:
// LineageOS / PixelExperience / Evolution X where available.
export const CANONICAL_CODENAMES: Record<string, string> = {
  dubai: "dubai",
  Dubai: "dubai",
  f62: "f62",
  F62: "f62",
  miami: "miami",
  Miami: "miami",
  Pong: "Pong",
  pong: "Pong",
  Spacewar: "Spacewar",
  spacewar: "Spacewar",
  drg: "DRG",
  DRG: "DRG",
  pl2: "PL2",
  PL2: "PL2",
  rmx1971: "RMX1971",
  RMX1971: "RMX1971",
  Mi439: "Mi439",
  mi439: "Mi439",
  Tetris: "Tetris",
  tetris: "Tetris",
  asteroids: "asteroids",
  Asteroids: "asteroids",
};

export interface CodenameResolver {
  resolve: (codename: string) => string;
  aliases: () => Array<{ alias: string; codename: string }>;
}

export function createCodenameResolver(): CodenameResolver {
  const canonicalByLower = new Map<string, string>();
  const aliases = new Map<string, string>();

  return {
    resolve(codename: string): string {
      const explicit = CANONICAL_CODENAMES[codename];
      if (explicit) {
        if (explicit !== codename) aliases.set(codename, explicit);
        canonicalByLower.set(explicit.toLowerCase(), explicit);
        return explicit;
      }

      const lower = codename.toLowerCase();
      const seen = canonicalByLower.get(lower);
      if (seen) {
        if (seen !== codename) aliases.set(codename, seen);
        return seen;
      }

      canonicalByLower.set(lower, codename);
      return codename;
    },

    aliases(): Array<{ alias: string; codename: string }> {
      return [...aliases].map(([alias, codename]) => ({ alias, codename }));
    },
  };
}
