"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    from: "user" | "assistant"
    variant?: "contained" | "flat"
  }
>(({ className, from, variant = "contained", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex gap-4 mb-6", from === "user" ? "justify-end" : "justify-start", className)}
    {...props}
  >
    {from === "assistant" && (
      <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm border border-primary/10">
        <AvatarFallback className="bg-transparent">
          <img src="/gemini-logo.png" alt="Gemini AI" className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
    )}

    <div className={cn("max-w-[85%] min-w-0", from === "user" ? "ml-12" : "")}>{children}</div>

    {from === "user" && (
      <Avatar className="h-10 w-10 bg-gradient-to-br from-secondary to-secondary/80 shadow-sm border border-secondary/20">
        <AvatarFallback className="bg-transparent">
          <span className="text-lg">👤</span>
        </AvatarFallback>
      </Avatar>
    )}
  </div>
))
Message.displayName = "Message"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "contained" | "flat"
  }
>(({ className, variant = "flat", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      variant === "contained" &&
        "rounded-xl px-4 py-3 shadow-sm bg-gradient-to-r from-muted to-muted/80 border border-border/50",
      variant === "flat" && "space-y-3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
))
MessageContent.displayName = "MessageContent"

export { Message, MessageContent }
