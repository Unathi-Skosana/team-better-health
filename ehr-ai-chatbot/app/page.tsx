"use client"

import type React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { ChartArtifact } from "@/components/chart-artifact"
import { ThinkingSkeleton, AnalyzingSkeleton, CreatingChartSkeleton } from "@/components/loading-skeletons"
import type { EHRChatMessage } from "./api/chat/route"

export default function EHRChatbot() {
  const { messages, sendMessage, status } = useChat<EHRChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const [inputValue, setInputValue] = useState("")

  const quickActions = [
    { icon: "📄", label: "Patient Summary", query: "How do I create a comprehensive patient summary?" },
    {
      icon: "📊",
      label: "Medical Guidelines",
      query: "What are the current guidelines for hypertension management?",
    },
    {
      icon: "📈",
      label: "Drug Interactions",
      query: "Tell me about common drug interactions with warfarin",
    },
    {
      icon: "💊",
      label: "Medication Info",
      query: "What are the side effects of metformin?",
    },
    {
      icon: "📊",
      label: "Blood Pressure Chart",
      query: "Create a combo chart showing systolic and diastolic blood pressure readings over the last month",
    },
    {
      icon: "📈",
      label: "Glucose Trend",
      query: "Show me an area chart for glucose levels over the past 3 months with normal ranges",
    },
    {
      icon: "🥧",
      label: "Patient Demographics",
      query: "Create a pie chart showing the distribution of chronic conditions in our patient population",
    },
    {
      icon: "📊",
      label: "Lab Results Comparison",
      query: "Show me a bar chart comparing average lab values across different age groups",
    },
  ]

  const handleQuickAction = async (query: string) => {
    try {
      await sendMessage({ text: query })
    } catch (error) {
      console.error("[v0] Error sending quick action:", error)
    }
    setInputValue("")
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const message = formData.get("message") as string

    if (!message?.trim()) return

    try {
      await sendMessage({ text: message })
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }

    setInputValue("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  MedAssist AI
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Electronic Health Records Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2 px-3 py-1 shadow-sm">
                <span>🛡️</span>
                HIPAA Compliant
              </Badge>
              {hasError && (
                <Badge variant="destructive" className="gap-2 px-3 py-1 shadow-sm animate-pulse">
                  <span>⚠️</span>
                  Connection Error
                </Badge>
              )}
              {isLoading && (
                <Badge className="gap-2 px-3 py-1 shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Processing
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-primary">⚡</span>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-4 text-left hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
                    onClick={() => handleQuickAction(action.query)}
                    disabled={isLoading}
                  >
                    <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </span>
                    <span className="text-sm text-pretty font-medium">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">🛡️</span>
                  <div className="text-xs text-amber-800/80 text-pretty leading-relaxed">
                    <strong className="text-amber-900">Medical Disclaimer:</strong> This AI assistant provides
                    informational support only. Always verify recommendations with current medical guidelines and
                    professional judgment.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)] shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-primary">💬</span>
                    Medical Consultation
                  </CardTitle>
                  <Badge
                    variant={isLoading ? "default" : hasError ? "destructive" : "secondary"}
                    className="px-3 py-1 shadow-sm"
                  >
                    {isLoading ? "Processing..." : hasError ? "Error" : "Ready"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-full p-0">
                {hasError && (
                  <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-destructive/10 to-red-50 border border-destructive/20 rounded-xl shadow-sm">
                    <div className="text-sm text-destructive font-medium">
                      <strong>Connection Error:</strong> Unable to connect to AI service. Please check if Google AI
                      integration is properly configured.
                    </div>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 pb-4">
                    {messages.length === 0 && !hasError && (
                      <div className="text-center py-16">
                        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                          <span className="text-3xl">🩺</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          Welcome to MedAssist AI
                        </h3>
                        <p className="text-muted-foreground text-pretty max-w-md mx-auto leading-relaxed">
                          Your intelligent EHR assistant ready to help with patient care, clinical decisions, and
                          medical information queries.
                        </p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-9 w-9 bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                            <AvatarFallback>
                              <span>🤖</span>
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`max-w-[85%] ${message.role === "user" ? "ml-12" : ""}`}>
                          {message.parts.map((part, partIndex) => {
                            if (part.type === "text") {
                              return (
                                <div
                                  key={partIndex}
                                  className={`rounded-xl px-4 py-3 mb-3 shadow-sm ${
                                    message.role === "user"
                                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
                                      : "bg-gradient-to-r from-muted to-muted/80 border border-border/50"
                                  }`}
                                >
                                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {part.text}
                                  </div>
                                </div>
                              )
                            } else if (part.type === "tool-createChart") {
                              switch (part.state) {
                                case "input-available":
                                  return <CreatingChartSkeleton key={partIndex} />
                                case "partial-output":
                                  if (part.partialOutput?.status) {
                                    return (
                                      <div key={partIndex} className="mb-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6 shadow-sm">
                                          <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="text-blue-700 font-medium">
                                              {part.partialOutput.message || "Processing..."}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  }
                                  return <CreatingChartSkeleton key={partIndex} />
                                case "output-available":
                                  return (
                                    <div key={partIndex} className="mb-4">
                                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6 shadow-sm">
                                        <div className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
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
                        </div>

                        {message.role === "user" && (
                          <Avatar className="h-9 w-9 bg-gradient-to-br from-secondary to-secondary/80 shadow-sm">
                            <AvatarFallback>
                              <span>👤</span>
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {loadingState === "thinking" && <ThinkingSkeleton />}
                    {loadingState === "analyzing" && <AnalyzingSkeleton />}
                    {loadingState === "creating-chart" && <CreatingChartSkeleton />}
                  </div>
                </ScrollArea>

                <div className="border-t border-border/50 p-6 bg-gradient-to-r from-background to-muted/20">
                  <form onSubmit={handleFormSubmit} className="flex gap-3">
                    <Input
                      name="message"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Ask about patient care or get clinical insights..."
                      disabled={isLoading}
                      className="flex-1 h-12 px-4 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 shadow-sm"
                    />
                    <Button
                      type="submit"
                      disabled={!inputValue?.trim() || isLoading}
                      size="icon"
                      className="h-12 w-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
                    >
                      <span className="text-lg">➤</span>
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
                    Press Enter to send • Try: "What are the symptoms of diabetes?" or "Explain hypertension treatment"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
