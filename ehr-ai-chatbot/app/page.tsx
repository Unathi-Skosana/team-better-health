"use client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChartArtifact } from "@/components/chart-artifact"
import { ThinkingSkeleton, AnalyzingSkeleton, CreatingChartSkeleton } from "@/components/loading-skeletons"
import type { EHRChatMessage } from "./api/chat/route"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import {
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
  PromptInputActionAddAttachments,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Response } from "@/components/ai-elements/response"
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat<EHRChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const [model, setModel] = useState("gemini-1.5-pro")
  const [useMicrophone, setUseMicrophone] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(false)

  const medicalSuggestions = [
    "How do I create a comprehensive patient summary?",
    "What are the current guidelines for hypertension management?",
    "Tell me about common drug interactions with warfarin",
    "What are the side effects of metformin?",
    "Create a blood pressure chart for the last month",
    "Show glucose trends over 3 months",
    "Explain diabetes management protocols",
    "What are the symptoms of heart failure?",
  ]

  const models = [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ]

  const handleSuggestionClick = async (suggestion: string) => {
    try {
      await sendMessage({ text: suggestion })
    } catch (error) {
      console.error("Error sending suggestion:", error)
    }
  }

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    try {
      await sendMessage(
        {
          text: message.text || "Sent with attachments",
          files: message.files,
        },
        {
          body: {
            model: model,
            webSearch: useWebSearch,
          },
        },
      )
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const isLoading = status === "in_progress"
  const hasError = status === "error"

  const getLoadingState = () => {
    if (!isLoading) return null

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role === "user") {
      return "thinking"
    }

    const hasChartTool = lastMessage.parts.some((part) => part.type === "tool-createChart")
    if (hasChartTool) {
      return "creating-chart"
    }

    return "analyzing"
  }

  const loadingState = getLoadingState()

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold">AI Chat Assistant</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {messages.length === 0 ? "Ready to help" : `${messages.length} messages`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PromptInputModelSelect onValueChange={(value) => setModel(value)} value={model}>
              <PromptInputModelSelectTrigger className="w-[140px] h-8">
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((model) => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            <Button variant="ghost" size="sm">
              <span className="text-lg">⋯</span>
            </Button>
          </div>
        </div>

        {/* Suggestion Tags */}
        {messages.length === 0 && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Medical Expert
              </Badge>
              <Badge variant="secondary" className="text-xs">
                EHR Specialist
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Clinical Assistant
              </Badge>
              <Badge variant="secondary" className="text-xs">
                HIPAA Compliant
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {hasError && (
          <div className="mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive font-medium">
              <strong>Connection Error:</strong> Unable to connect to AI service. Please check if Google AI integration
              is properly configured.
            </div>
          </div>
        )}

        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && !hasError && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-2xl w-full px-4">
                  <div className="text-muted-foreground mb-6">
                    Welcome to your AI EHR Assistant. How can I help you today?
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Clinical Questions:</h3>
                      <Suggestions>
                        {medicalSuggestions.slice(0, 4).map((suggestion) => (
                          <Suggestion
                            key={suggestion}
                            suggestion={suggestion}
                            onClick={handleSuggestionClick}
                            disabled={isLoading}
                          />
                        ))}
                      </Suggestions>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Data Visualization:</h3>
                      <Suggestions>
                        {medicalSuggestions.slice(4).map((suggestion) => (
                          <Suggestion
                            key={suggestion}
                            suggestion={suggestion}
                            onClick={handleSuggestionClick}
                            disabled={isLoading}
                          />
                        ))}
                      </Suggestions>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return <Response key={partIndex}>{part.text}</Response>
                      } else if (part.type === "tool-createChart") {
                        switch (part.state) {
                          case "input-available":
                            return <CreatingChartSkeleton key={partIndex} />
                          case "partial-output":
                            if (part.partialOutput?.status) {
                              return (
                                <div key={partIndex} className="mb-4">
                                  <div className="bg-muted/50 border rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                                      <div className="text-foreground font-medium">
                                        {part.partialOutput.message || "Processing..."}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return <CreatingChartSkeleton key={partIndex} />
                          case "output-available":
                            if (!part.output) {
                              return (
                                <div
                                  key={partIndex}
                                  className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                                >
                                  <div className="text-destructive">Error: Chart data not available</div>
                                </div>
                              )
                            }

                            return (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/30 border rounded-lg p-6">
                                  <div className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    {part.output.title}
                                  </div>
                                  <ChartArtifact
                                    chartId={part.output.chartId}
                                    title={part.output.title}
                                    type={part.output.type}
                                    data={part.output.data}
                                    xAxisLabel={part.output.xAxisLabel}
                                    yAxisLabel={part.output.yAxisLabel}
                                    description={part.output.description}
                                  />
                                </div>
                              </div>
                            )
                          default:
                            return <CreatingChartSkeleton key={partIndex} />
                        }
                      }
                      return null
                    })}
                  </MessageContent>
                </Message>
              )
            })}

            {loadingState === "thinking" && <ThinkingSkeleton />}
            {loadingState === "analyzing" && <AnalyzingSkeleton />}
            {loadingState === "creating-chart" && <CreatingChartSkeleton />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="text-xs text-muted-foreground mb-2">Suggestions:</div>
              <Suggestions>
                {medicalSuggestions.slice(0, 4).map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={handleSuggestionClick}
                    disabled={isLoading}
                  />
                ))}
              </Suggestions>
            </div>
          )}

          <PromptInput
            onSubmit={handlePromptSubmit}
            className="max-w-4xl mx-auto"
            accept="image/*,.pdf,.doc,.docx,.txt"
            multiple
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024} // 10MB
          >
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                name="message"
                placeholder="Ask about patient care, upload medical documents, or get clinical insights..."
                disabled={isLoading}
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Add medical documents" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? "default" : "ghost"}
                  title="Voice input (coming soon)"
                >
                  <span className="text-sm">🎤</span>
                  <span className="sr-only">Microphone</span>
                </PromptInputButton>

                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? "default" : "ghost"}
                  title="Search medical databases"
                >
                  <span className="text-sm">🌐</span>
                  <span className="hidden sm:inline ml-1">Search</span>
                </PromptInputButton>
              </PromptInputTools>

              <PromptInputSubmit status={status === "in_progress" ? "in_progress" : hasError ? "error" : "ready"} />
            </PromptInputToolbar>
          </PromptInput>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Press Enter to send • Upload medical documents • Try: "What are the symptoms of diabetes?" or "Explain
            hypertension treatment"
          </p>
        </div>
      </div>
    </div>
  )
}
