import { 
  Trophy, 
  Globe, 
  Zap, 
  Server, 
  Shield, 
  Video, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Github,
  ExternalLink,
  Radio
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ViewType } from '@/App'

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
  { id: 'cdn', label: 'CDN Metrics', icon: Globe },
  { id: 'chaos', label: 'Chaos Experiments', icon: Zap },
  { id: 'infrastructure', label: 'Edge Infrastructure', icon: Server },
  { id: 'security', label: 'Security Monitor', icon: Shield },
  { id: 'stream', label: 'Live Stream', icon: Video },
  { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
]

export function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-amber-500 to-red-500 flex items-center justify-center animate-pulse-glow">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg gradient-text">SuperBowl</span>
                <span className="text-xs text-muted-foreground block -mt-1">Edge Chaos</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-amber-500 to-red-500 flex items-center justify-center mx-auto animate-pulse-glow">
              <Radio className="w-5 h-5 text-white" />
            </div>
          )}
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Collapse button when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-sidebar-border">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return isCollapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full h-10 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full status-online animate-pulse" />
                <span>Edge Operational</span>
              </div>
              <a 
                href="https://github.com/ccarrylab/SuperBowlEdge-Chaos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://github.com/ccarrylab/SuperBowlEdge-Chaos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex justify-center"
                >
                  <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
