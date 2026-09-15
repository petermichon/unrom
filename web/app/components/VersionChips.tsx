import { Badge } from "@/components/ui/badge";

interface Props {
  androidBases: string[];
  romVersions: string[];
}

export function VersionChips({ androidBases, romVersions }: Props) {
  if (androidBases.length === 0 && romVersions.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      {androidBases.map((version) => (
        <Badge
          key={`android-${version}`}
          variant="outline"
          className="font-mono text-xs"
        >
          Android {version}
        </Badge>
      ))}
      {romVersions.map((version) => (
        <Badge
          key={`rom-${version}`}
          variant="outline"
          className="font-mono text-xs"
        >
          v{version}
        </Badge>
      ))}
    </>
  );
}
