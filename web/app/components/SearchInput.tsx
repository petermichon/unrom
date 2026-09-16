import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface Props {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  id,
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  className,
  inputClassName,
}: Props) {
  return (
    <InputGroup className={cn("flex-1", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name="q"
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={inputClassName}
      />
    </InputGroup>
  );
}
