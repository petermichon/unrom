import { Database, Download, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label="Export the dataset"
            data-nojs-hide
          />
        }
      >
        <Download />
        <span className="hidden sm:inline">Export</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Full dataset</DropdownMenuLabel>
          <DropdownMenuItem
            render={
              <a
                href="/api/export/sqlite"
                download="unrom.sqlite"
                aria-label="Download SQLite database"
              />
            }
          >
            <Database
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            SQLite (.sqlite)
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <a
                href="/api/export/json"
                download="unrom.json"
                aria-label="Download JSON export"
              />
            }
          >
            <FileJson
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            JSON (.json)
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
