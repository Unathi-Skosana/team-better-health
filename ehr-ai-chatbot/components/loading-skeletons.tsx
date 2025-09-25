import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 bg-primary/10">
        <AvatarFallback>
          <span>🤖</span>
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] space-y-2">
        <div className="bg-muted rounded-lg px-4 py-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-muted/50 border border-muted rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Skeleton className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function ThinkingSkeleton() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 bg-primary/10">
        <AvatarFallback>
          <span>🤖</span>
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
        </div>
      </div>
    </div>
  )
}

export function AnalyzingSkeleton() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 bg-primary/10">
        <AvatarFallback>
          <span>🤖</span>
        </AvatarFallback>
      </Avatar>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[240px]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <span className="text-sm text-blue-700 font-medium">Analyzing medical data...</span>
        </div>
      </div>
    </div>
  )
}

export function CreatingChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-start">
        <Avatar className="h-8 w-8 bg-primary/10">
          <AvatarFallback>
            <span>🤖</span>
          </AvatarFallback>
        </Avatar>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
            </div>
            <span className="text-sm text-green-700 font-medium">Creating chart...</span>
          </div>
        </div>
      </div>

      <div className="ml-11">
        <ChartSkeleton />
      </div>
    </div>
  )
}
