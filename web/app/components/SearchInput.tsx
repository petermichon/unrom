import { Search } from "lucide-react";
import { cn } from "cn";
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
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  id,
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  autoFocus,
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
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={inputClassName}
      />
    </InputGroup>
  );
}
