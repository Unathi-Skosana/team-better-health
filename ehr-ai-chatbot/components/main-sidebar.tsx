"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquareIcon,
  FileTextIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  SearchIcon,
  PlusIcon,
  HomeIcon,
  CalendarIcon,
  ClipboardListIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    description: "Overview and quick actions",
  },
  {
    name: "AI Chat",
    href: "/",
    icon: MessageSquareIcon,
    description: "Chat with AI assistant",
  },
  {
    name: "Patient Records",
    href: "/patients",
    icon: UsersIcon,
    description: "Manage patient information",
  },
  {
    name: "Medical Charts",
    href: "/charts",
    icon: BarChart3Icon,
    description: "View and analyze medical data",
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarIcon,
    description: "Schedule and manage appointments",
  },
  {
    name: "Clinical Notes",
    href: "/notes",
    icon: ClipboardListIcon,
    description: "Create and review clinical notes",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileTextIcon,
    description: "Medical documents and reports",
  },
]

const quickActions = ["New Patient Consultation", "Emergency Protocol", "Lab Results Review", "Medication Check"]

export function MainSidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">EHR Assistant</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Healthcare</p>
          </div>
        </div>

        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, records..."
            className="pl-10 bg-sidebar-accent border-sidebar-border text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Consultation
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Navigation</div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                  {isActive && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Quick Actions</div>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-muted-foreground hover:text-sidebar-foreground"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">System Status</span>
            <Badge variant="secondary" className="text-xs">
              Online
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">All systems operational</div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  )
}
