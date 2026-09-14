import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "cn";
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
  const selected = new Set((column.getFilterValue() as string[]) ?? []);

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
                    onSelect={() => {
                      const next = new Set(selected);
                      if (isSelected) next.delete(option.value);
                      else next.add(option.value);
                      column.setFilterValue(next.size ? [...next] : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
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
