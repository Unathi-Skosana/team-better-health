"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { Activity, Beaker, Pill } from "lucide-react"

interface MedicalChartProps {
  chartType: "vitals" | "labs" | "adherence"
  data: any[]
  config: {
    title: string
    patientId?: string
    timeRange?: string
    vitals?: string[]
    tests?: string[]
    medications?: string[]
  }
}

export function MedicalChart({ chartType, data, config }: MedicalChartProps) {
  const getChartIcon = () => {
    switch (chartType) {
      case "vitals":
        return <Activity className="h-5 w-5 text-primary" />
      case "labs":
        return <Beaker className="h-5 w-5 text-primary" />
      case "adherence":
        return <Pill className="h-5 w-5 text-primary" />
      default:
        return <Activity className="h-5 w-5 text-primary" />
    }
  }

  const getChartConfig = () => {
    switch (chartType) {
      case "vitals":
        return {
          systolic: { label: "Systolic BP", color: "hsl(var(--chart-1))" },
          diastolic: { label: "Diastolic BP", color: "hsl(var(--chart-2))" },
          heartRate: { label: "Heart Rate", color: "hsl(var(--chart-3))" },
          temperature: { label: "Temperature", color: "hsl(var(--chart-4))" },
          oxygenSaturation: { label: "O2 Saturation", color: "hsl(var(--chart-5))" },
        }
      case "labs":
        return {
          glucose: { label: "Glucose", color: "hsl(var(--chart-1))" },
          cholesterol: { label: "Cholesterol", color: "hsl(var(--chart-2))" },
          hemoglobin: { label: "Hemoglobin", color: "hsl(var(--chart-3))" },
          whiteBloodCells: { label: "WBC", color: "hsl(var(--chart-4))" },
          creatinine: { label: "Creatinine", color: "hsl(var(--chart-5))" },
        }
      case "adherence":
        const adherenceConfig: any = {}
        config.medications?.forEach((med, index) => {
          adherenceConfig[med] = {
            label: med,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
          }
        })
        return adherenceConfig
      default:
        return {}
    }
  }

  const renderChart = () => {
    const chartConfig = getChartConfig()

    switch (chartType) {
      case "vitals":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {config.vitals?.includes("bloodPressure") && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="var(--color-systolic)"
                      name="Systolic BP"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="var(--color-diastolic)"
                      name="Diastolic BP"
                      strokeWidth={2}
                    />
                  </>
                )}
                {config.vitals?.includes("heartRate") && (
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="var(--color-heartRate)"
                    name="Heart Rate"
                    strokeWidth={2}
                  />
                )}
                {config.vitals?.includes("temperature") && (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="var(--color-temperature)"
                    name="Temperature"
                    strokeWidth={2}
                  />
                )}
                {config.vitals?.includes("oxygenSaturation") && (
                  <Line
                    type="monotone"
                    dataKey="oxygenSaturation"
                    stroke="var(--color-oxygenSaturation)"
                    name="O2 Saturation"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "labs":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {config.tests?.map((test) => (
                  <Line
                    key={test}
                    type="monotone"
                    dataKey={test}
                    stroke={`var(--color-${test})`}
                    name={chartConfig[test as keyof typeof chartConfig]?.label || test}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "adherence":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {config.medications?.map((med) => (
                  <Bar key={med} dataKey={med} fill={`var(--color-${med})`} name={med} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      default:
        return <div>Chart type not supported</div>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
            {config.patientId && <p className="text-sm text-muted-foreground">Patient: {config.patientId}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Medical Disclaimer:</strong> This chart displays sample data for demonstration purposes. Always
            verify with actual patient records and clinical guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
