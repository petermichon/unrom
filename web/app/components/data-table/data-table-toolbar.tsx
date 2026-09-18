import type { ReactNode } from "react";

export function DataTableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}
