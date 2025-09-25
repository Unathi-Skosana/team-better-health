import {
  convertToModelMessages,
  type InferUITools,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const maxDuration = 30

const createChartTool = tool({
  description:
    "Create medical charts and visualizations for EHR data analysis. Use this when users ask for charts, graphs, or data visualization.",
  inputSchema: z.object({
    title: z.string().describe("Chart title"),
    type: z.enum(["line", "bar", "area", "pie", "donut", "radar", "scatter", "combo"]).describe("Chart type"),
    dataLength: z.number().optional().describe("Number of data points to generate"),
    xAxisLabel: z.string().optional().describe("X-axis label"),
    yAxisLabel: z.string().optional().describe("Y-axis label"),
    description: z.string().optional().describe("Chart description or clinical context"),
  }),
  async *execute({ title, type, dataLength = 6, xAxisLabel, yAxisLabel, description }) {
    console.log("[v0] Tool createChart executed with:", {
      title,
      type,
      dataLength,
      xAxisLabel,
      yAxisLabel,
      description,
    })

    yield { status: "analyzing", message: "Analyzing medical data..." }
    await new Promise((resolve) => setTimeout(resolve, 800))

    yield { status: "processing", message: "Processing chart parameters..." }
    await new Promise((resolve) => setTimeout(resolve, 600))

    yield { status: "generating", message: "Generating visualization..." }
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Generate realistic medical data based on chart type
    let data: any[] = []

    switch (type) {
      case "pie":
      case "donut":
        data = [
          { name: "Hypertension", value: 35, unit: "%" },
          { name: "Diabetes", value: 28, unit: "%" },
          { name: "Heart Disease", value: 22, unit: "%" },
          { name: "Obesity", value: 15, unit: "%" },
        ]
        break
      case "bar":
        data = Array.from({ length: dataLength }, (_, i) => ({
          name: `Month ${i + 1}`,
          value: Math.floor(Math.random() * 50) + 100,
          unit: "mg/dL",
          normalRange: { min: 70, max: 140 },
        }))
        break
      case "combo":
        data = Array.from({ length: dataLength }, (_, i) => ({
          name: `Week ${i + 1}`,
          value: Math.floor(Math.random() * 30) + 110, // Systolic
          value2: Math.floor(Math.random() * 20) + 70, // Diastolic
          unit: "mmHg",
          date: new Date(Date.now() - (dataLength - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }))
        break
      default:
        data = Array.from({ length: dataLength }, (_, i) => ({
          name: new Date(Date.now() - (dataLength - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          value: Math.floor(Math.random() * 50) + 100,
          unit: "mg/dL",
          date: new Date(Date.now() - (dataLength - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          normalRange: { min: 70, max: 140 },
        }))
    }

    const result = {
      chartId: `chart-${Date.now()}`,
      title: title || "Medical Chart",
      type: type || "line",
      data: data,
      xAxisLabel: xAxisLabel || "Time",
      yAxisLabel: yAxisLabel || "Value",
      description: description || "Medical data visualization",
    }

    console.log("[v0] Tool createChart returning:", result)
    yield result
  },
})

const tools = {
  createChart: createChartTool,
} as const

export type EHRChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  console.log("[v0] Chat API called")

  try {
    const body = await req.json()
    console.log("[v0] Received messages:", body.messages?.length || 0)

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.log("[v0] Missing Google API key")
      return new Response(
        JSON.stringify({
          error: "Google AI integration not configured. Please add Google AI integration in your project settings.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const messages = await validateUIMessages<EHRChatMessage>({
      messages: body.messages,
      tools,
    })

    const modelMessages = convertToModelMessages(messages)

    const result = streamText({
      model: google("gemini-2.5-pro"),
      messages: modelMessages,
      system: `You are MedAssist, an AI assistant for Electronic Health Records (EHR) systems. You help healthcare professionals with:

- Patient information queries and summaries
- Clinical decision support and medical insights  
- Medication interactions and dosage guidance
- Diagnostic code lookups (ICD-10, CPT)
- Treatment protocol recommendations
- Medical terminology explanations
- Lab result interpretations
- Care plan suggestions
- Medical data visualization and charts

IMPORTANT: When users ask for charts, graphs, or data visualization, you MUST use the createChart tool. Examples:
- "Show me a glucose chart" → Use createChart with glucose data (line/area chart)
- "Create a blood pressure trend" → Use createChart with BP readings (combo chart for systolic/diastolic)
- "Display lab results over time" → Use createChart with lab data (line chart)
- "Show patient demographics" → Use createChart with demographic data (pie/donut chart)
- "Compare medication effectiveness" → Use createChart with comparison data (bar chart)

Chart Type Guidelines:
- **Line/Area**: Time series data (vitals over time, lab trends)
- **Bar**: Comparisons (monthly averages, medication dosages)
- **Pie/Donut**: Distributions (patient demographics, condition prevalence)
- **Combo**: Multiple metrics (systolic/diastolic BP, before/after comparisons)

When using createChart, always provide realistic sample medical data:
- Glucose: 70-180 mg/dL range with 6-12 data points
- Blood pressure: systolic 90-140, diastolic 60-90 mmHg
- Heart rate: 60-100 bpm
- Temperature: 97-101°F
- Include normal ranges and units when relevant

Always prioritize patient safety and remind users that your suggestions should be verified with current medical guidelines and professional judgment.`,
      temperature: 0.3,
      tools,
    })

    console.log("[v0] Streaming response created")
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please check your AI integration setup.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
