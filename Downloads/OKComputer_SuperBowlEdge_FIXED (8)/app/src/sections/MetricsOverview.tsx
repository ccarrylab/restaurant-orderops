import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  subtitle?: string
}

function MetricCard({ title, value, change, changeType, icon: Icon, subtitle }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge 
            variant={changeType === 'positive' ? 'default' : changeType === 'negative' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {changeType === 'positive' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
             changeType === 'negative' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
            {change}
          </Badge>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsOverview() {
  const [metrics, setMetrics] = useState<{
    p99Latency: { value: string; change: string; changeType: 'positive' | 'negative' }
    errorRate: { value: string; change: string; changeType: 'positive' | 'negative' }
    uptime: { value: string; change: string; changeType: 'positive' | 'negative' }
    requestsPerSecond: { value: string; change: string; changeType: 'positive' | 'negative' }
  }>({
    p99Latency: { value: '1,247ms', change: '-18%', changeType: 'positive' },
    errorRate: { value: '0.12%', change: '-3%', changeType: 'positive' },
    uptime: { value: '99.7%', change: '+0.2%', changeType: 'positive' },
    requestsPerSecond: { value: '2,847', change: '+12%', changeType: 'positive' },
  })

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        p99Latency: { 
          value: `${Math.floor(1200 + Math.random() * 200)}ms`, 
          change: `${Math.random() > 0.5 ? '-' : '+'}${Math.floor(Math.random() * 20)}%`,
          changeType: Math.random() > 0.3 ? 'positive' : 'negative'
        },
        errorRate: { 
          value: `${(0.1 + Math.random() * 0.05).toFixed(2)}%`, 
          change: `${Math.random() > 0.5 ? '-' : '+'}${Math.floor(Math.random() * 5)}%`,
          changeType: Math.random() > 0.3 ? 'positive' : 'negative'
        },
        uptime: { 
          value: `${(99.5 + Math.random() * 0.5).toFixed(1)}%`, 
          change: `+${(Math.random() * 0.3).toFixed(1)}%`,
          changeType: 'positive'
        },
        requestsPerSecond: { 
          value: `${Math.floor(2500 + Math.random() * 500)}`, 
          change: `+${Math.floor(Math.random() * 20)}%`,
          changeType: 'positive'
        },
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Key Metrics</h2>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Real-time
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="P99 Latency"
          value={metrics.p99Latency.value}
          change={metrics.p99Latency.change}
          changeType={metrics.p99Latency.changeType}
          icon={Clock}
          subtitle="vs last hour"
        />
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate.value}
          change={metrics.errorRate.change}
          changeType={metrics.errorRate.changeType}
          icon={AlertTriangle}
          subtitle="vs last hour"
        />
        <MetricCard
          title="Uptime"
          value={metrics.uptime.value}
          change={metrics.uptime.change}
          changeType={metrics.uptime.changeType}
          icon={CheckCircle}
          subtitle="last 30 days"
        />
        <MetricCard
          title="Requests/sec"
          value={metrics.requestsPerSecond.value}
          change={metrics.requestsPerSecond.change}
          changeType={metrics.requestsPerSecond.changeType}
          icon={Zap}
          subtitle="avg"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Pods</p>
              <p className="text-2xl font-bold text-emerald-400">24/24</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Chaos Tests Run</p>
              <p className="text-2xl font-bold text-primary">156</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Resilience Score</p>
              <p className="text-2xl font-bold text-accent">96/100</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
