"use client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import React from "react"
import { ChartArtifact } from "@/components/chart-artifact"
import { GeoLocationArtifact } from "@/components/geolocation-artifact"
import { ClinicMisdiagnosisMap } from "@/components/clinic-misdiagnosis-map"
import { Loader } from "@/components/ai-elements/loader"
import type { EHRChatMessage } from "../../api/chat/route"
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
    "Show disease prevalence trends across South African provinces",
    "Create a map of hypertension rates by region",
    "Display diabetes distribution patterns nationwide",
    "Analyze tuberculosis hotspots by province",
    "Show clinic misdiagnosis rates across regions",
    "Compare cardiovascular disease prevalence by province",
    "Map obesity rates across South African regions",
    "Analyze healthcare facility performance by province",
    "Show emerging disease trends by geographic region",
    "Create epidemiological maps for disease surveillance",
    "Compare provincial health outcomes and indicators",
    "Display regional healthcare resource allocation",
    "Analyze disease burden patterns nationwide",
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

  const isLoading = status === "streaming"
  const isSubmitted = status === "submitted"
  const hasError = status === "error"

  const getLoadingState = () => {
    if (!isLoading && !isSubmitted) return null

    // Show thinking state when submitted (before streaming starts)
    if (isSubmitted) {
      return "thinking"
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role === "user") {
      return "thinking"
    }

    const hasChartTool = lastMessage.parts.some((part) => part.type === "tool-createChart" || part.type === "tool-createGeoLocation" || part.type === "tool-createClinicMisdiagnosis")
    if (hasChartTool) {
      return "creating-chart"
    }

    return "analyzing"
  }

  const loadingState = getLoadingState()

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="font-semibold">Health Analytics Assistant</span>
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
                Regional Health Analyst
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Epidemiological Expert
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Country-wide Trends
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Provincial Analytics
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {hasError && (
          <div className="mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive font-medium">
              <strong>Connection Error:</strong> Unable to connect to AI service. Please check if Google AI integration
              is properly configured.
            </div>
          </div>
        )}

        <Conversation className="flex-1 min-h-0">
          <ConversationContent>
            {messages.length === 0 && !hasError && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-2xl w-full px-4">
                  <div className="text-muted-foreground mb-6">
                    Welcome to your AI Health Analytics Assistant. I specialize in country-wide health trend analysis, regional epidemiological insights, and provincial healthcare performance metrics. Perfect for doctors and regional administrators analyzing nationwide health patterns and disease surveillance across South Africa.
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Regional Health Analysis:</h3>
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
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Epidemiological Insights:</h3>
                      <Suggestions>
                        {medicalSuggestions.slice(4, 8).map((suggestion) => (
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
                <Message key={message.id} from={message.role === "system" ? "assistant" : message.role}>
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return <Response key={partIndex}>{part.text}</Response>
                      } else if (part.type === "tool-createChart" || part.type === "tool-createGeoLocation" || part.type === "tool-createClinicMisdiagnosis") {
                        switch (part.state) {
                          case "input-available":
                            return part.type === "tool-createGeoLocation" || part.type === "tool-createClinicMisdiagnosis" ? (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/50 border rounded-lg p-4">
                                  <div className="flex items-center gap-3">
                                    <Loader size={16} />
                                    <div className="text-foreground font-medium">
                                      {part.type === "tool-createClinicMisdiagnosis" ? "Creating clinic misdiagnosis map..." : "Creating interactive map..."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/50 border rounded-lg p-4">
                                  <div className="flex items-center gap-3">
                                    <Loader size={16} />
                                    <div className="text-foreground font-medium">Creating chart...</div>
                                  </div>
                                </div>
                              </div>
                            )
                          case "output-available":
                            if (!part.output || typeof part.output === 'string') {
                              return (
                                <div
                                  key={partIndex}
                                  className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                                >
                                  <div className="text-destructive">Error: Chart/Map data not available</div>
                                </div>
                              )
                            }

                            // Type guard for output
                            const output = part.output as any
                            if (!output || typeof output !== 'object') {
                              return (
                                <div
                                  key={partIndex}
                                  className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                                >
                                  <div className="text-destructive">Error: Invalid output data</div>
                                </div>
                              )
                            }

                            return (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/30 border rounded-lg p-6">
                                  <div className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span className="text-xl">
                                      {output.type === "geolocation" ? "🗺️" : 
                                       output.type === "clinic-misdiagnosis" ? "🏥" : "📊"}
                                    </span>
                                    {output.title}
                                  </div>
                                  {output.type === "geolocation" ? (
                                    <GeoLocationArtifact
                                      mapId={output.mapId}
                                      title={output.title}
                                      description={output.description}
                                      diseaseType={output.diseaseType}
                                      data={output.data}
                                    />
                                  ) : output.type === "clinic-misdiagnosis" ? (
                                    <ClinicMisdiagnosisMap
                                      mapId={output.mapId}
                                      title={output.title}
                                      description={output.description}
                                    />
                                  ) : (
                                    <ChartArtifact
                                      chartId={output.chartId}
                                      title={output.title}
                                      type={output.type}
                                      data={output.data}
                                      xAxisLabel={output.xAxisLabel}
                                      yAxisLabel={output.yAxisLabel}
                                      description={output.description}
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          default:
                            return part.type === "tool-createGeoLocation" || part.type === "tool-createClinicMisdiagnosis" ? (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/50 border rounded-lg p-4">
                                  <div className="flex items-center gap-3">
                                    <Loader size={16} />
                                    <div className="text-foreground font-medium">
                                      {part.type === "tool-createClinicMisdiagnosis" ? "Creating clinic misdiagnosis map..." : "Creating interactive map..."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div key={partIndex} className="mb-4">
                                <div className="bg-muted/50 border rounded-lg p-4">
                                  <div className="flex items-center gap-3">
                                    <Loader size={16} />
                                    <div className="text-foreground font-medium">Creating chart...</div>
                                  </div>
                                </div>
                              </div>
                            )
                        }
                      }
                      return null
                    })}
                  </MessageContent>
                </Message>
              )
            })}

            {loadingState === "thinking" && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader size={16} />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
            {loadingState === "analyzing" && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-3 text-blue-600">
                    <Loader size={16} />
                    <span className="text-sm font-medium">Analyzing medical data...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
            {loadingState === "creating-chart" && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-3 text-green-600 mb-4">
                    <Loader size={16} />
                    <span className="text-sm font-medium">Creating visualization...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="text-xs text-muted-foreground mb-2">Suggestions:</div>
              <Suggestions>
                {medicalSuggestions.slice(0, 3).map((suggestion) => (
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
              <PromptInputTextarea
                name="message"
                placeholder="Analyze regional health trends, create epidemiological maps, or explore country-wide disease patterns..."
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
              </PromptInputTools>

              <PromptInputSubmit status={isLoading || isSubmitted ? "in_progress" : hasError ? "error" : "ready"} />
            </PromptInputToolbar>
          </PromptInput>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Press Enter to send • Try: "Show disease prevalence by province" or "Analyze regional health trends"
          </p>
        </div>
      </div>
    </div>
  )
}
