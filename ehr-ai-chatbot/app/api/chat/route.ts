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

const createGeoLocationTool = tool({
  description:
    "Create interactive maps showing disease prevalence by province in South Africa. Use this when users ask for geographic data visualization, provincial disease statistics, or regional health analysis.",
  inputSchema: z.object({
    title: z.string().describe("Map title"),
    diseaseType: z.enum(["hypertension", "diabetes", "heart_disease", "obesity", "tuberculosis"]).describe("Type of disease to visualize"),
    description: z.string().optional().describe("Map description or clinical context"),
  }),
  async *execute({ title, diseaseType, description }) {
    console.log("[v0] Tool createGeoLocation executed with:", {
      title,
      diseaseType,
      description,
    })

    yield { status: "analyzing", message: "Analyzing geographic health data..." }
    await new Promise((resolve) => setTimeout(resolve, 800))

    yield { status: "processing", message: "Processing provincial statistics..." }
    await new Promise((resolve) => setTimeout(resolve, 600))

    yield { status: "generating", message: "Generating interactive map..." }
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Generate realistic South African provincial disease data
    const provincesData = [
      {
        name: "Western Cape",
        code: "WC",
        population: 7020000,
        diseases: {
          hypertension: 28.5,
          diabetes: 12.3,
          heart_disease: 8.7,
          obesity: 35.2,
          tuberculosis: 4.1
        }
      },
      {
        name: "Eastern Cape",
        code: "EC", 
        population: 6650000,
        diseases: {
          hypertension: 32.1,
          diabetes: 15.8,
          heart_disease: 12.3,
          obesity: 42.1,
          tuberculosis: 6.8
        }
      },
      {
        name: "Northern Cape",
        code: "NC",
        population: 1200000,
        diseases: {
          hypertension: 25.8,
          diabetes: 9.2,
          heart_disease: 6.4,
          obesity: 28.7,
          tuberculosis: 2.9
        }
      },
      {
        name: "Free State",
        code: "FS",
        population: 2900000,
        diseases: {
          hypertension: 30.2,
          diabetes: 13.5,
          heart_disease: 9.8,
          obesity: 38.9,
          tuberculosis: 5.2
        }
      },
      {
        name: "KwaZulu-Natal",
        code: "KZN",
        population: 11400000,
        diseases: {
          hypertension: 35.7,
          diabetes: 18.2,
          heart_disease: 14.1,
          obesity: 45.3,
          tuberculosis: 8.9
        }
      },
      {
        name: "North West",
        code: "NW",
        population: 4100000,
        diseases: {
          hypertension: 29.8,
          diabetes: 12.1,
          heart_disease: 8.9,
          obesity: 36.7,
          tuberculosis: 4.7
        }
      },
      {
        name: "Gauteng",
        code: "GP",
        population: 15700000,
        diseases: {
          hypertension: 26.4,
          diabetes: 10.7,
          heart_disease: 7.2,
          obesity: 32.1,
          tuberculosis: 3.8
        }
      },
      {
        name: "Mpumalanga",
        code: "MP",
        population: 4500000,
        diseases: {
          hypertension: 31.5,
          diabetes: 14.3,
          heart_disease: 10.6,
          obesity: 39.8,
          tuberculosis: 6.1
        }
      },
      {
        name: "Limpopo",
        code: "LP",
        population: 5800000,
        diseases: {
          hypertension: 33.9,
          diabetes: 16.1,
          heart_disease: 11.8,
          obesity: 41.2,
          tuberculosis: 7.4
        }
      }
    ]

    const result = {
      mapId: `map-${Date.now()}`,
      title: title || `${diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)} Prevalence by Province`,
      type: "geolocation",
      diseaseType: diseaseType,
      description: description || `Interactive map showing ${diseaseType} prevalence across South African provinces`,
      data: provincesData,
    }

    console.log("[v0] Tool createGeoLocation returning:", result)
    yield result
  },
})

const createClinicMisdiagnosisTool = tool({
  description:
    "Create interactive maps showing clinics and hospitals with prevalent misdiagnosis rates in South Africa. Use this when users ask about misdiagnosis rates, clinic performance, hospital quality, or healthcare facility analysis.",
  inputSchema: z.object({
    title: z.string().describe("Map title"),
    description: z.string().optional().describe("Map description or clinical context"),
  }),
  async *execute({ title, description }) {
    console.log("[v0] Tool createClinicMisdiagnosis executed with:", {
      title,
      description,
    })

    yield { status: "analyzing", message: "Analyzing clinic misdiagnosis data..." }
    await new Promise((resolve) => setTimeout(resolve, 800))

    yield { status: "processing", message: "Processing healthcare facility statistics..." }
    await new Promise((resolve) => setTimeout(resolve, 600))

    yield { status: "generating", message: "Generating clinic misdiagnosis map..." }
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Return the clinic misdiagnosis map data
    const result = {
      mapId: `clinic-misdiagnosis-${Date.now()}`,
      title: title || "Clinic Misdiagnosis Rates Across South Africa",
      type: "clinic-misdiagnosis",
      description: description || "Interactive map showing clinics and hospitals with prevalent misdiagnosis rates",
    }

    console.log("[v0] Tool createClinicMisdiagnosis returning:", result)
    yield result
  },
})

const tools = {
  createChart: createChartTool,
  createGeoLocation: createGeoLocationTool,
  createClinicMisdiagnosis: createClinicMisdiagnosisTool,
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

IMPORTANT: When users ask for geographic data, provincial statistics, or regional health analysis in South Africa, you MUST use the createGeoLocation tool. Examples:
- "Show the most prevalent diseases by province" → Use createGeoLocation with disease type
- "Display hypertension rates across South African provinces" → Use createGeoLocation with hypertension
- "Create a map of diabetes prevalence by region" → Use createGeoLocation with diabetes
- "Show tuberculosis distribution by province" → Use createGeoLocation with tuberculosis

IMPORTANT: When users ask about clinic performance, hospital quality, or misdiagnosis rates, you MUST use the createClinicMisdiagnosis tool. Examples:
- "Show clinics and hospitals with prevalent misdiagnosis rates" → Use createClinicMisdiagnosis
- "Display healthcare facilities with high misdiagnosis rates" → Use createClinicMisdiagnosis
- "Show hospital performance regarding misdiagnosis" → Use createClinicMisdiagnosis
- "Create a map of clinic quality based on misdiagnosis rates" → Use createClinicMisdiagnosis

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
