"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquareIcon,
  UsersIcon,
  SearchIcon,
  PlusIcon,
  HomeIcon,
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
    href: "/chat",
    icon: MessageSquareIcon,
    description: "Chat with AI assistant",
  },
  {
    name: "Patient Booking",
    href: "/booking",
    icon: UsersIcon,
    description: "Book medical appointments",
  },
]


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


      </div>

    </div>
  )
}
