import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface Event {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'infrastructure' | 'chaos' | 'security' | 'deployment'
  message: string
  details?: string
}

const levelConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', badge: 'default' as const },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'secondary' as const },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', badge: 'destructive' as const },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'default' as const },
}

const categoryColors = {
  infrastructure: 'text-purple-400',
  chaos: 'text-primary',
  security: 'text-red-400',
  deployment: 'text-blue-400',
}

const mockEvents: Event[] = [
  { 
    id: '1', 
    timestamp: '2 min ago', 
    level: 'success', 
    category: 'chaos', 
    message: 'Pod Failure experiment completed successfully',
    details: 'Zero downtime detected, recovery time: 12s'
  },
  { 
    id: '2', 
    timestamp: '5 min ago', 
    level: 'warning', 
    category: 'infrastructure', 
    message: 'High CPU usage detected on eks-node-2',
    details: 'CPU usage: 87%, threshold: 80%'
  },
  { 
    id: '3', 
    timestamp: '10 min ago', 
    level: 'info', 
    category: 'deployment', 
    message: 'Auto-scaling triggered: added 2 pods',
    details: 'New pod count: 24, reason: CPU threshold exceeded'
  },
  { 
    id: '4', 
    timestamp: '15 min ago', 
    level: 'success', 
    category: 'infrastructure', 
    message: 'Pod chaos-edge-app-7b9c4d5f2-x8k9p restarted automatically',
    details: 'Restart reason: OOMKilled, new pod healthy'
  },
  { 
    id: '5', 
    timestamp: '25 min ago', 
    level: 'info', 
    category: 'security', 
    message: 'Security scan completed',
    details: 'No vulnerabilities found, score: 95/100'
  },
  { 
    id: '6', 
    timestamp: '32 min ago', 
    level: 'warning', 
    category: 'infrastructure', 
    message: 'Network latency spike detected',
    details: 'P99 latency: 1,247ms, normal: 450ms'
  },
  { 
    id: '7', 
    timestamp: '45 min ago', 
    level: 'success', 
    category: 'chaos', 
    message: 'Network Latency experiment completed',
    details: 'Application handled +107ms latency gracefully'
  },
  { 
    id: '8', 
    timestamp: '1 hour ago', 
    level: 'info', 
    category: 'deployment', 
    message: 'New version deployed: v2.3.1',
    details: 'Rolling update completed, 0 downtime'
  },
  { 
    id: '9', 
    timestamp: '1.5 hours ago', 
    level: 'error', 
    category: 'infrastructure', 
    message: 'Database connection pool exhausted',
    details: 'Max connections reached: 100/100, resolved automatically'
  },
  { 
    id: '10', 
    timestamp: '2 hours ago', 
    level: 'success', 
    category: 'chaos', 
    message: 'CPU Stress experiment completed',
    details: 'Auto-scaling worked as expected, 99.7% uptime'
  },
]

export function EventsLog({ limit }: { limit?: number }) {
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredEvents = mockEvents
    .filter(event => filterLevel === 'all' || event.level === filterLevel)
    .filter(event => filterCategory === 'all' || event.category === filterCategory)
    .slice(0, limit || mockEvents.length)

  return (
    <Card className={limit ? '' : 'animate-fade-in'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Events Log</CardTitle>
          <Badge variant="outline" className="text-xs">
            {filteredEvents.length} events
          </Badge>
        </div>
        {!limit && (
          <div className="flex items-center gap-2">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[130px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="chaos">Chaos</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="deployment">Deployment</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const LevelIcon = levelConfig[event.level].icon
            return (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${levelConfig[event.level].bg} flex items-center justify-center flex-shrink-0`}>
                  <LevelIcon className={`w-4 h-4 ${levelConfig[event.level].color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{event.message}</span>
                    <Badge variant="outline" className={`text-xs ${categoryColors[event.category]}`}>
                      {event.category}
                    </Badge>
                  </div>
                  {event.details && (
                    <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{event.timestamp}</span>
              </div>
            )
          })}
        </div>
        
        {limit && (
          <div className="mt-4 pt-4 border-t border-border text-center">
            <span className="text-sm text-muted-foreground">Showing last {limit} events</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
