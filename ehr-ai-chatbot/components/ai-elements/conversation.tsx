"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const ConversationContext = React.createContext<{
  scrollToBottom: () => void
  isAtBottom: boolean
}>({
  scrollToBottom: () => {},
  isAtBottom: true,
})

const Conversation = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const [isAtBottom, setIsAtBottom] = React.useState(true)
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = React.useCallback(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }, [])

    const handleScroll = React.useCallback(() => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        const threshold = 100
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold)
      }
    }, [])

    React.useEffect(() => {
      if (isAtBottom) {
        scrollToBottom()
      }
    }, [children, isAtBottom, scrollToBottom])

    return (
      <ConversationContext.Provider value={{ scrollToBottom, isAtBottom }}>
        <div ref={ref} className={cn("relative flex flex-col h-full", className)} {...props}>
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            {children}
          </div>
        </div>
      </ConversationContext.Provider>
    )
  },
)
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-6 p-6", className)} {...props} />,
)
ConversationContent.displayName = "ConversationContent"

const ConversationEmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode
    title?: string
    description?: string
  }
>(({ className, icon, title, description, ...props }, ref) => (
  <div ref={ref} className={cn("text-center py-16", className)} {...props}>
    {icon && (
      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
        {icon}
      </div>
    )}
    {title && (
      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {title}
      </h3>
    )}
    {description && <p className="text-muted-foreground text-pretty max-w-md mx-auto leading-relaxed">{description}</p>}
  </div>
))
ConversationEmptyState.displayName = "ConversationEmptyState"

const ConversationScrollButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { scrollToBottom, isAtBottom } = React.useContext(ConversationContext)

    if (isAtBottom) return null

    return (
      <Button
        ref={ref}
        variant="outline"
        size="icon"
        className={cn("absolute bottom-4 right-4 rounded-full shadow-lg bg-background/80 backdrop-blur-sm", className)}
        onClick={scrollToBottom}
        {...props}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    )
  },
)
ConversationScrollButton.displayName = "ConversationScrollButton"

export { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton }
