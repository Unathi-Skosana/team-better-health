"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
} from "recharts"

interface ChartData {
  name: string
  value: number
  value2?: number
  category?: string
  date?: string
  unit?: string
  normalRange?: {
    min: number
    max: number
  }
}

interface MedicalContext {
  patientId?: string
  dateRange?: string
  clinicalNotes?: string
  alertThresholds?: {
    high?: number
    low?: number
  }
}

interface ChartArtifactProps {
  chartId: string
  title: string
  type: "line" | "bar" | "area" | "pie" | "donut" | "radar" | "scatter" | "combo"
  data: ChartData[]
  xAxisLabel?: string
  yAxisLabel?: string
  description?: string
  medicalContext?: MedicalContext
}

const MEDICAL_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function ChartArtifact({
  chartId,
  title,
  type,
  data,
  xAxisLabel,
  yAxisLabel,
  description,
  medicalContext,
}: ChartArtifactProps) {
  // Generate chart config based on data
  const chartConfig = data.reduce(
    (config, item, index) => {
      const key = item.category || item.name
      if (!config[key]) {
        config[key] = {
          label: key,
          color: MEDICAL_COLORS[index % MEDICAL_COLORS.length],
        }
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  // Check for values outside normal range
  const hasAlerts = data.some((item) => {
    if (!item.normalRange) return false
    return item.value < item.normalRange.min || item.value > item.normalRange.max
  })

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
            />
            <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {/* Add reference lines for normal ranges */}
            {data[0]?.normalRange && (
              <>
                <ReferenceLine y={data[0].normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={data[0].normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />
              </>
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)" }}
            />
          </LineChart>
        )

      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
            />
            <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {/* Add reference lines for normal ranges */}
            {data[0]?.normalRange && (
              <>
                <ReferenceLine y={data[0].normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={data[0].normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />
              </>
            )}
            <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
            />
            <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {/* Add reference lines for normal ranges */}
            {data[0]?.normalRange && (
              <>
                <ReferenceLine y={data[0].normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={data[0].normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />
              </>
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, value }) =>
                `${name}: ${value}${data[0]?.unit ? ` ${data[0].unit}` : ""} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
          </PieChart>
        )

      case "donut":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, value }) =>
                `${name}: ${value}${data[0]?.unit ? ` ${data[0].unit}` : ""} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
          </PieChart>
        )

      case "combo":
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -10 } : undefined}
            />
            <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value}${data[0]?.unit ? ` ${data[0].unit}` : ""}`, name]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="value" fill="var(--color-value)" name="Systolic" />
            <Line type="monotone" dataKey="value2" stroke="var(--color-value2)" strokeWidth={2} name="Diastolic" />
          </ComposedChart>
        )

      default:
        return null
    }
  }

  // Enhanced chart config for proper theming
  const enhancedConfig = {
    ...chartConfig,
    value: {
      label: yAxisLabel || "Primary Value",
      color: "hsl(var(--chart-1))",
    },
    value2: {
      label: "Secondary Value",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            {title}
          </CardTitle>
          {hasAlerts && (
            <Badge variant="destructive" className="gap-1">
              <span>⚠️</span>
              Alert
            </Badge>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {medicalContext?.patientId && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Patient: {medicalContext.patientId}</span>
            {medicalContext.dateRange && <span>• {medicalContext.dateRange}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={enhancedConfig} className="h-[400px] w-full">
          {renderChart()}
        </ChartContainer>
        {data[0]?.normalRange && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span>
              Normal range: {data[0].normalRange.min} - {data[0].normalRange.max} {data[0].unit}
            </span>
          </div>
        )}
        {medicalContext?.clinicalNotes && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Clinical Notes:</strong> {medicalContext.clinicalNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
