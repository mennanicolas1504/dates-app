import * as React from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onClear?: () => void
}

export function SearchInput({
  className,
  value,
  onClear,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 size-[14px] text-muted-foreground"
        strokeWidth={1.75}
      />
      <Input
        type="text"
        value={value}
        className={cn("pl-8", onClear && value ? "pr-8" : undefined)}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="size-[14px]" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}
