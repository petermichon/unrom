import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import CommandPalette from "@/components/CommandPalette";
import { GitHubIcon } from "@/components/GitHubIcon";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

interface Props {
  updatedAt?: string;
  children: ReactNode;
}

export default function AppShell({ updatedAt, children }: Props) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                nativeButton={false}
                aria-label="GitHub repository"
                render={
                  <a
                    href="https://github.com/petermichon/unrom"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <GitHubIcon className="size-4" />
              </Button>
              <ModeToggle />
              <CommandPalette />
            </div>
          </header>
          <main id="content" tabIndex={-1} className="flex-1 px-4 py-10 sm:px-6">
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          </main>
          <footer className="border-t border-border/60 px-4 py-6 text-xs text-muted-foreground sm:px-6">
            Last updated {updatedAt ?? "—"}
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
