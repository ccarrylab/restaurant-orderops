import { Bell, RefreshCw, Settings, User, Clock, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface HeaderProps {
  lastUpdate: Date
}

export function Header({ lastUpdate }: HeaderProps) {
  const [notifications] = useState([
    { id: 1, title: 'CloudFront cache hit rate: 94%', time: '2 min ago', type: 'success' },
    { id: 2, title: 'WAF blocked 1,247 requests', time: '5 min ago', type: 'warning' },
    { id: 3, title: 'HAProxy origin healthy', time: '10 min ago', type: 'info' },
  ])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h1 className="text-xl font-semibold">SuperBowlEdge Dashboard</h1>
        </div>
        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
          LIVE
        </Badge>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Last Update */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
          <Clock className="w-4 h-4" />
          <span>Updated: {formatTime(lastUpdate)}</span>
        </div>

        {/* Refresh Button */}
        <Button variant="ghost" size="icon" className="relative">
          <RefreshCw className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
