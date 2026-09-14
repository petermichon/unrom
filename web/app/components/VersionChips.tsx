import { Badge } from "@/components/ui/badge";

interface Props {
  androidBases: string[];
  romVersion: string | null;
}

export function VersionChips({ androidBases, romVersion }: Props) {
  if (androidBases.length === 0 && !romVersion) {
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
      {romVersion && (
        <Badge
          key={`rom-${romVersion}`}
          variant="outline"
          className="font-mono text-xs"
        >
          v{romVersion}
        </Badge>
      )}
    </>
  );
}
