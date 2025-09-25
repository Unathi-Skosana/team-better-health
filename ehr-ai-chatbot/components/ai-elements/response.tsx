"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string
  parseIncompleteMarkdown?: boolean
  components?: Record<string, React.ComponentType<any>>
  allowedImagePrefixes?: string[]
  allowedLinkPrefixes?: string[]
  defaultOrigin?: string
  rehypePlugins?: any[]
  remarkPlugins?: any[]
}

const Response = React.forwardRef<HTMLDivElement, ResponseProps>(
  (
    {
      className,
      children,
      parseIncompleteMarkdown = true,
      components,
      allowedImagePrefixes = ["*"],
      allowedLinkPrefixes = ["*"],
      defaultOrigin,
      rehypePlugins,
      remarkPlugins,
      ...props
    },
    ref,
  ) => {
    const processMarkdown = (content: string) => {
      if (!content) return ""

      // Basic markdown processing for now - in a real implementation,
      // this would use Streamdown for advanced markdown rendering
      let processed = content

      // Handle code blocks with syntax highlighting
      processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-muted/50 rounded-lg p-4 overflow-x-auto border"><code class="text-sm font-mono${lang ? ` language-${lang}` : ""}">${code.trim()}</code></pre>`
      })

      // Handle inline code
      processed = processed.replace(
        /`([^`]+)`/g,
        '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
      )

      // Handle bold text
      processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')

      // Handle italic text
      processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

      // Handle links
      processed = processed.replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
      )

      // Handle line breaks
      processed = processed.replace(/\n\n/g, '</p><p class="mb-4">')
      processed = processed.replace(/\n/g, "<br>")

      // Handle lists
      processed = processed.replace(/^\* (.+)$/gm, '<li class="ml-4">• $1</li>')
      processed = processed.replace(/(<li.*<\/li>)/s, '<ul class="mb-4 space-y-1">$1</ul>')

      // Handle numbered lists
      processed = processed.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
      processed = processed.replace(/(<li.*<\/li>)/s, '<ol class="mb-4 space-y-1 list-decimal list-inside">$1</ol>')

      // Wrap in paragraphs if not already wrapped
      if (!processed.startsWith("<")) {
        processed = `<p class="mb-4">${processed}</p>`
      }

      return processed
    }

    const processedContent = processMarkdown(children)

    return (
      <div
        ref={ref}
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-muted/50 prose-pre:border prose-pre:rounded-lg prose-pre:p-4",
          "prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-r-lg",
          "prose-ul:space-y-1 prose-ol:space-y-1",
          "prose-li:text-foreground",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        {...props}
      />
    )
  },
)
Response.displayName = "Response"

export { Response }
