import { useState } from "react";
import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface FacetOption {
  label: string;
  value: string;
}

const EMPTY: string[] = [];

interface Props<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: FacetOption[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: Props<TData, TValue>) {
  // Optimistic local copy so the checkbox reflects a click immediately, even
  // while the controlled filter value is still catching up (e.g. a router
  // transition). Re-synced when the column value changes externally.
  const propValue = (column.getFilterValue() as string[] | undefined) ?? EMPTY;
  const [value, setValue] = useState<string[]>(propValue);
  const [synced, setSynced] = useState<string[]>(propValue);
  if (propValue !== synced) {
    setSynced(propValue);
    setValue(propValue);
  }
  const selected = new Set(value);

  const toggle = (optionValue: string) => {
    const next = new Set(value);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    const array = [...next];
    setValue(array);
    column.setFilterValue(array.length ? array : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" className="border-dashed" />}
      >
        <PlusCircle className="size-4" />
        {title}
        {selected.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            <Badge variant="secondary" className="rounded px-1 font-normal">
              {selected.size}
            </Badge>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="size-3.5" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
