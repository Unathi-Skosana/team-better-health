import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod/v4"

export const maxDuration = 30

const generatePatientVitalsChart = tool({
  description: "Generate a chart showing patient vital signs over time (blood pressure, heart rate, temperature)",
  inputSchema: z.object({
    patientId: z.string().optional().describe("Patient identifier (anonymized)"),
    timeRange: z.enum(["24h", "7d", "30d", "90d"]).default("7d").describe("Time range for the chart"),
    vitals: z
      .array(z.enum(["bloodPressure", "heartRate", "temperature", "oxygenSaturation"]))
      .default(["bloodPressure", "heartRate"])
      .describe("Which vital signs to include"),
  }),
  async *execute({ patientId, timeRange, vitals }) {
    yield { state: "generating" as const, message: "Generating patient vitals chart..." }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate sample medical data
    const generateVitalData = (vital: string, days: number) => {
      const data = []
      const baseValues = {
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 72,
        temperature: 98.6,
        oxygenSaturation: 98,
      }

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const entry: any = {
          date: date.toISOString().split("T")[0],
          time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }

        if (vital === "bloodPressure") {
          entry.systolic = baseValues.bloodPressure.systolic + Math.floor(Math.random() * 40) - 20
          entry.diastolic = baseValues.bloodPressure.diastolic + Math.floor(Math.random() * 20) - 10
        } else if (vital === "heartRate") {
          entry.heartRate = baseValues.heartRate + Math.floor(Math.random() * 30) - 15
        } else if (vital === "temperature") {
          entry.temperature = (baseValues.temperature + Math.random() * 4 - 2).toFixed(1)
        } else if (vital === "oxygenSaturation") {
          entry.oxygenSaturation = baseValues.oxygenSaturation + Math.floor(Math.random() * 4) - 2
        }

        data.push(entry)
      }
      return data
    }

    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const chartData = generateVitalData(vitals[0], days)

    yield {
      state: "ready" as const,
      chartType: "vitals",
      data: chartData,
      config: {
        title: `Patient Vital Signs - ${timeRange}`,
        vitals: vitals,
        timeRange: timeRange,
        patientId: patientId || "Anonymous",
      },
    }
  },
})

const generateLabResultsChart = tool({
  description: "Generate a chart showing lab test results over time (glucose, cholesterol, hemoglobin, etc.)",
  inputSchema: z.object({
    patientId: z.string().optional().describe("Patient identifier (anonymized)"),
    labTests: z
      .array(z.enum(["glucose", "cholesterol", "hemoglobin", "whiteBloodCells", "creatinine"]))
      .default(["glucose", "cholesterol"])
      .describe("Which lab tests to include"),
    timeRange: z.enum(["3m", "6m", "1y", "2y"]).default("6m").describe("Time range for the chart"),
  }),
  async *execute({ patientId, labTests, timeRange }) {
    yield { state: "generating" as const, message: "Generating lab results chart..." }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const generateLabData = (tests: string[], months: number) => {
      const data = []
      const normalRanges = {
        glucose: { min: 70, max: 100, unit: "mg/dL" },
        cholesterol: { min: 125, max: 200, unit: "mg/dL" },
        hemoglobin: { min: 12, max: 16, unit: "g/dL" },
        whiteBloodCells: { min: 4000, max: 11000, unit: "cells/μL" },
        creatinine: { min: 0.6, max: 1.2, unit: "mg/dL" },
      }

      for (let i = months; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        const entry: any = {
          date: date.toISOString().split("T")[0],
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        }

        tests.forEach((test) => {
          const range = normalRanges[test as keyof typeof normalRanges]
          const variation = (range.max - range.min) * 0.3
          const baseValue = (range.min + range.max) / 2
          entry[test] = Number((baseValue + Math.random() * variation * 2 - variation).toFixed(1))
        })

        data.push(entry)
      }
      return data
    }

    const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : timeRange === "1y" ? 12 : 24
    const chartData = generateLabData(labTests, months)

    yield {
      state: "ready" as const,
      chartType: "labs",
      data: chartData,
      config: {
        title: `Lab Results Trend - ${timeRange}`,
        tests: labTests,
        timeRange: timeRange,
        patientId: patientId || "Anonymous",
      },
    }
  },
})

const generateMedicationAdherenceChart = tool({
  description: "Generate a chart showing medication adherence rates over time",
  inputSchema: z.object({
    patientId: z.string().optional().describe("Patient identifier (anonymized)"),
    medications: z
      .array(z.string())
      .default(["Metformin", "Lisinopril", "Atorvastatin"])
      .describe("List of medications to track"),
    timeRange: z.enum(["1m", "3m", "6m"]).default("3m").describe("Time range for adherence tracking"),
  }),
  async *execute({ patientId, medications, timeRange }) {
    yield { state: "generating" as const, message: "Generating medication adherence chart..." }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const generateAdherenceData = (meds: string[], weeks: number) => {
      const data = []

      for (let i = weeks; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i * 7)

        const entry: any = {
          week: `Week ${weeks - i + 1}`,
          date: date.toISOString().split("T")[0],
        }

        meds.forEach((med) => {
          // Generate adherence percentage (70-100%)
          entry[med] = Math.floor(Math.random() * 30) + 70
        })

        data.push(entry)
      }
      return data
    }

    const weeks = timeRange === "1m" ? 4 : timeRange === "3m" ? 12 : 24
    const chartData = generateAdherenceData(medications, weeks)

    yield {
      state: "ready" as const,
      chartType: "adherence",
      data: chartData,
      config: {
        title: `Medication Adherence - ${timeRange}`,
        medications: medications,
        timeRange: timeRange,
        patientId: patientId || "Anonymous",
      },
    }
  },
})

const tools = {
  generatePatientVitalsChart,
  generateLabResultsChart,
  generateMedicationAdherenceChart,
} as const

export type EHRChatToolsMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<EHRChatToolsMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: google("gemini-1.5-pro"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
    system: `You are MedAssist, an AI assistant for Electronic Health Records (EHR) systems. You help healthcare professionals with:

- Patient information queries and summaries
- Clinical decision support and medical insights  
- Medication interactions and dosage guidance
- Diagnostic code lookups (ICD-10, CPT)
- Treatment protocol recommendations
- Medical terminology explanations
- Lab result interpretations
- Care plan suggestions
- **Medical data visualization and charts**

When users ask for patient data visualization, charts, or trends, use the available tools to generate appropriate medical charts:
- Use generatePatientVitalsChart for vital signs tracking
- Use generateLabResultsChart for lab test trends
- Use generateMedicationAdherenceChart for medication compliance tracking

Always prioritize patient safety and remind users that your suggestions should be verified with current medical guidelines and professional judgment. Maintain HIPAA compliance awareness and never store or remember specific patient data between conversations.

Respond professionally, concisely, and with appropriate medical terminology while remaining accessible to healthcare staff.`,
    temperature: 0.3,
  })

  return result.toUIMessageStreamResponse({
    onFinish: (options) => {
      console.log("EHR Chat Tools finished", options)
    },
  })
}
