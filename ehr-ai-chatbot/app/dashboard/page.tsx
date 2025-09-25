"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MessageSquareIcon,
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { label: "Active Patients", value: "1,247", icon: UsersIcon, trend: "+12%" },
    { label: "Today's Appointments", value: "23", icon: CalendarIcon, trend: "+5%" },
    { label: "Pending Reviews", value: "8", icon: FileTextIcon, trend: "-2%" },
    { label: "System Health", value: "98.5%", icon: TrendingUpIcon, trend: "+0.3%" },
  ]

  const recentActivity = [
    { type: "appointment", message: "New appointment scheduled with Dr. Smith", time: "5 min ago" },
    { type: "alert", message: "Lab results ready for Patient #1234", time: "12 min ago" },
    { type: "note", message: "Clinical note updated for Patient #5678", time: "25 min ago" },
    { type: "chat", message: "AI consultation completed", time: "1 hour ago" },
  ]

  const alerts = [
    { type: "urgent", message: "Critical lab values for Patient #9876", priority: "high" },
    { type: "reminder", message: "Medication review due for 3 patients", priority: "medium" },
    { type: "system", message: "System maintenance scheduled for tonight", priority: "low" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your healthcare overview.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button size="sm">
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.trend}</span> from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const getIcon = () => {
                    switch (activity.type) {
                      case "appointment":
                        return <CalendarIcon className="w-4 h-4" />
                      case "alert":
                        return <AlertTriangleIcon className="w-4 h-4" />
                      case "note":
                        return <FileTextIcon className="w-4 h-4" />
                      case "chat":
                        return <MessageSquareIcon className="w-4 h-4" />
                      default:
                        return <CheckCircleIcon className="w-4 h-4" />
                    }
                  }

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">{getIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ClockIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Important items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => {
                  const getPriorityColor = () => {
                    switch (alert.priority) {
                      case "high":
                        return "bg-red-100 text-red-800 border-red-200"
                      case "medium":
                        return "bg-yellow-100 text-yellow-800 border-yellow-200"
                      case "low":
                        return "bg-blue-100 text-blue-800 border-blue-200"
                      default:
                        return "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  }

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangleIcon className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{alert.message}</p>
                        <Badge variant="outline" className={`mt-1 text-xs ${getPriorityColor()}`}>
                          {alert.priority} priority
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                <UsersIcon className="w-6 h-6" />
                <span className="text-sm">New Patient</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                <CalendarIcon className="w-6 h-6" />
                <span className="text-sm">Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                <FileTextIcon className="w-6 h-6" />
                <span className="text-sm">Clinical Note</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                <MessageSquareIcon className="w-6 h-6" />
                <span className="text-sm">AI Consult</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
