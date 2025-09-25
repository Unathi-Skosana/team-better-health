"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaperclipIcon, SendIcon, LoaderIcon } from "lucide-react"

export interface PromptInputMessage {
  text?: string
  files?: File[]
}

interface PromptInputContextType {
  files: File[]
  addFiles: (files: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  openFileDialog: () => void
}

const PromptInputContext = React.createContext<PromptInputContextType | null>(null)

export const usePromptInputAttachments = () => {
  const context = React.useContext(PromptInputContext)
  if (!context) {
    throw new Error("usePromptInputAttachments must be used within a PromptInput")
  }
  return context
}

const PromptInput = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    onSubmit: (message: PromptInputMessage, event: React.FormEvent) => void
    accept?: string
    multiple?: boolean
    maxFiles?: number
    maxFileSize?: number
    globalDrop?: boolean
  }
>(
  (
    {
      className,
      onSubmit,
      accept,
      multiple = true,
      maxFiles = 10,
      maxFileSize = 10 * 1024 * 1024,
      globalDrop,
      children,
      ...props
    },
    ref,
  ) => {
    const [files, setFiles] = React.useState<File[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const addFiles = React.useCallback(
      (newFiles: File[]) => {
        setFiles((prev) => {
          const combined = [...prev, ...newFiles]
          return combined.slice(0, maxFiles)
        })
      },
      [maxFiles],
    )

    const removeFile = React.useCallback((index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const clearFiles = React.useCallback(() => {
      setFiles([])
    }, [])

    const openFileDialog = React.useCallback(() => {
      fileInputRef.current?.click()
    }, [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const text = formData.get("message") as string

      onSubmit({ text: text || undefined, files: files.length > 0 ? files : undefined }, e)

      // Clear form
      const form = e.currentTarget
      form.reset()
      setFiles([])
    }

    const contextValue: PromptInputContextType = {
      files,
      addFiles,
      removeFile,
      clearFiles,
      openFileDialog,
    }

    return (
      <PromptInputContext.Provider value={contextValue}>
        <form ref={ref} className={cn("relative", className)} onSubmit={handleSubmit} {...props}>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || [])
              addFiles(selectedFiles)
            }}
          />
          {children}
        </form>
      </PromptInputContext.Provider>
    )
  },
)
PromptInput.displayName = "PromptInput"

const PromptInputBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("relative", className)} {...props} />,
)
PromptInputBody.displayName = "PromptInputBody"

const PromptInputAttachments = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: (attachment: File & { id: string }) => React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  const { files } = usePromptInputAttachments()

  if (files.length === 0) return null

  return (
    <div ref={ref} className={cn("flex flex-wrap gap-2 mb-3", className)} {...props}>
      {files.map((file, index) => children({ ...file, id: `${index}-${file.name}` }))}
    </div>
  )
})
PromptInputAttachments.displayName = "PromptInputAttachments"

const PromptInputAttachment = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: File & { id: string }
  }
>(({ className, data, ...props }, ref) => {
  const { removeFile, files } = usePromptInputAttachments()
  const index = files.findIndex((f) => f.name === data.name)

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm border", className)}
      {...props}
    >
      <PaperclipIcon className="w-4 h-4" />
      <span className="truncate max-w-32">{data.name}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-destructive/10"
        onClick={() => removeFile(index)}
      >
        ×
      </Button>
    </div>
  )
})
PromptInputAttachment.displayName = "PromptInputAttachment"

const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea>>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
      }
    }, [])

    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight, props.value])

    return (
      <Textarea
        ref={textareaRef}
        className={cn(
          "min-h-[48px] max-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 shadow-sm",
          className,
        )}
        onInput={adjustHeight}
        {...props}
      />
    )
  },
)
PromptInputTextarea.displayName = "PromptInputTextarea"

const PromptInputToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between mt-3", className)} {...props} />
  ),
)
PromptInputToolbar.displayName = "PromptInputToolbar"

const PromptInputTools = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />,
)
PromptInputTools.displayName = "PromptInputTools"

const PromptInputActionMenu = DropdownMenu
const PromptInputActionMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuTrigger asChild ref={ref} {...props}>
    <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
      <PaperclipIcon className="w-4 h-4" />
      <span className="sr-only">Add attachments</span>
    </Button>
  </DropdownMenuTrigger>
))
PromptInputActionMenuTrigger.displayName = "PromptInputActionMenuTrigger"

const PromptInputActionMenuContent = DropdownMenuContent
const PromptInputActionMenuItem = DropdownMenuItem

const PromptInputActionAddAttachments = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    label?: string
  }
>(({ label = "Add photos or files", ...props }, ref) => {
  const { openFileDialog } = usePromptInputAttachments()

  return (
    <DropdownMenuItem ref={ref} onClick={openFileDialog} {...props}>
      <PaperclipIcon className="w-4 h-4 mr-2" />
      {label}
    </DropdownMenuItem>
  )
})
PromptInputActionAddAttachments.displayName = "PromptInputActionAddAttachments"

const PromptInputButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} type="button" variant="ghost" size="sm" className={cn("h-8 px-3", className)} {...props} />
  ),
)
PromptInputButton.displayName = "PromptInputButton"

const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    status?: "ready" | "in_progress" | "error"
  }
>(({ className, children, status = "ready", disabled, ...props }, ref) => {
  const getIcon = () => {
    switch (status) {
      case "in_progress":
        return <LoaderIcon className="w-4 h-4 animate-spin" />
      case "error":
        return <span className="text-lg">⚠️</span>
      default:
        return <SendIcon className="w-4 h-4" />
    }
  }

  return (
    <Button
      ref={ref}
      type="submit"
      size="sm"
      className={cn(
        "h-8 px-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm",
        className,
      )}
      disabled={disabled || status === "in_progress"}
      {...props}
    >
      {children || getIcon()}
    </Button>
  )
})
PromptInputSubmit.displayName = "PromptInputSubmit"

const PromptInputModelSelect = Select
const PromptInputModelSelectTrigger = SelectTrigger
const PromptInputModelSelectContent = SelectContent
const PromptInputModelSelectItem = SelectItem
const PromptInputModelSelectValue = SelectValue

export {
  PromptInput,
  PromptInputBody,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionAddAttachments,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
}
