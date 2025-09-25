\
# Suggestion

The `Suggestion\` component displays a horizontal row of clickable suggestions
for user interaction.
\
<Preview path="suggestion" />
\
#
#
Installation

\`\`\`sh\
npx ai-elements
@latest
add
suggestion
\`\`\`

## Usage

\`\`\`tsx
\`\`\`

\`\`\`tsx
<Suggestions>
  <Suggestion suggestion="What are the latest trends in AI?" />
</Suggestions>
\`\`\`
\
## Usage
with AI SDK
\
Build a simple input
with suggestions users
can
click
to
send
a
message
to
the
LLM.
\
Add the following component to your frontend:

\`\`\`tsx filename="app/page.tsx"
'use client'

import type React from "react"

import { Input, PromptInputTextarea, PromptInputSubmit } from "@/components/ai-elements/prompt-input"
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"

const suggestions = [
  "Can you explain how to play tennis?",
  "What is the weather in Tokyo?",
  "How do I make a really good fish taco?",
]

const SuggestionDemo = () => {
  const [input, setInput] = useState("")
  const { sendMessage, status } = useChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage({ text: input })
      setInput("")
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4">
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion key={suggestion} onClick={handleSuggestionClick} suggestion={suggestion} />
            ))}
          </Suggestions>
          <Input onSubmit={handleSubmit} className="mt-4 w-full max-w-2xl mx-auto relative">
            <PromptInputTextarea
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="pr-12"
            />
            <PromptInputSubmit
              status={status === "streaming" ? "streaming" : "ready"}
              disabled={!input.trim()}
              className="absolute bottom-1 right-1"
            />
          </Input>
        </div>
      </div>
    </div>
  )
}

export default SuggestionDemo
\`\`\`

## Features

- Horizontal row of clickable suggestion buttons\
- Customizable styling
with variant and
size
options
\
- Flexible layout that wraps suggestions on smaller screens
- onClick callback that emits the selected suggestion string\
- Support
for both individual suggestions and
suggestion
lists
\
- Clean, modern styling
with hover effects
\
- Responsive design
with mobile-friendly touch
targets
\
- TypeScript support
with proper type definitions
\
## Examples
\
### Usage
with AI Input
\
<Preview path="suggestion-input" />

## Props

### `<Suggestions />`

<PropertiesTable
  content=
{
  ;[
    {
      name: "[...props]",
      type: "React.ComponentProps<typeof ScrollArea>",
      description: "Any other props are spread to the underlying ScrollArea component.",
      isOptional: true,
    },
  ]
}
;/>
\
### `<Suggestion />`

<PropertiesTable
  content=
{
  ;[
    {
      name: "suggestion",
      type: "string",
      description: "The suggestion string to display and emit on click.",
      isOptional: false,
    },
    {
      name: "onClick",
      type: "(suggestion: string) => void",
      description: "Callback fired when the suggestion is clicked.",
      isOptional: true,
    },
    {
      name: "[...props]",
      type: 'Omit<React.ComponentProps<typeof Button>, "onClick">',
      description: "Any other props are spread to the underlying shadcn/ui Button component.",
      isOptional: true,
    },
  ]
}
;/>
