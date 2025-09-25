"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TextWithTooltip } from "@/components/text-with-tooltip"
import { cn } from "@/lib/utils"

interface SuggestionsProps extends React.ComponentProps<typeof ScrollArea> {}

const Suggestions = React.forwardRef<React.ElementRef<typeof ScrollArea>, SuggestionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollArea ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex gap-2 pb-2 flex-wrap justify-center">{children}</div>
      </ScrollArea>
    )
  },
)
Suggestions.displayName = "Suggestions"

interface SuggestionProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  suggestion: string
  onClick?: (suggestion: string) => void
}

const Suggestion = React.forwardRef<React.ElementRef<typeof Button>, SuggestionProps>(
  ({ suggestion, onClick, className, ...props }, ref) => {
    const handleClick = () => {
      onClick?.(suggestion)
    }

    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn(
          "hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 max-w-xs text-center",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <TextWithTooltip text={suggestion} className="w-full" />
      </Button>
    )
  },
)
Suggestion.displayName = "Suggestion"

export { Suggestions, Suggestion }
