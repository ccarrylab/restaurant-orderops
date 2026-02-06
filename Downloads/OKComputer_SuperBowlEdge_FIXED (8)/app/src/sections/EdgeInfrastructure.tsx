import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Cloud, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ChevronRight,
  Activity,
  Globe,
  Cpu,
  HardDrive
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  icon: React.ElementType
  uptime: string
  latency: string
  details?: string[]
}

interface InstanceStatus {
  id: string
  name: string
  type: string
  status: 'running' | 'stopped' | 'pending'
  cpu: number
  memory: number
  network: number
}

const statusConfig = {
  operational: { color: 'text-emerald-400', bg: 'bg-emerald-500', icon: CheckCircle },
  degraded: { color: 'text-amber-400', bg: 'bg-amber-500', icon: AlertTriangle },
  down: { color: 'text-red-400', bg: 'bg-red-500', icon: AlertTriangle },
  maintenance: { color: 'text-blue-400', bg: 'bg-blue-500', icon: RefreshCw },
  running: { color: 'text-emerald-400', bg: 'bg-emerald-500' },
  stopped: { color: 'text-red-400', bg: 'bg-red-500' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500' },
}

export function EdgeInfrastructure({ compact = false }: { compact?: boolean }) {
  const [services] = useState<ServiceStatus[]>([
    { 
      id: 'cloudfront', 
      name: 'CloudFront', 
      status: 'operational', 
      icon: Cloud, 
      uptime: '99.99%', 
      latency: '23ms',
      details: ['450+ Edge Locations', 'Cache Hit Rate: 94.7%', 'SSL/TLS Enabled']
    },
    { 
      id: 'alb', 
      name: 'Application Load Balancer', 
      status: 'operational', 
      icon: Server, 
      uptime: '99.95%', 
      latency: '12ms',
      details: ['Cross-AZ Enabled', 'Health Checks: Passing', 'Target Groups: 3']
    },
    { 
      id: 'haproxy', 
      name: 'HAProxy Origin', 
      status: 'operational', 
      icon: Activity, 
      uptime: '99.9%', 
      latency: '8ms',
      details: ['Active: 2 instances', 'Failover: Enabled', 'Connections: 4,521']
    },
    { 
      id: 'waf', 
      name: 'AWS WAF', 
      status: 'operational', 
      icon: Shield, 
      uptime: '100%', 
      latency: '2ms',
      details: ['Rules: 15 Active', 'Blocked: 1,247/min', 'Rate Limiting: On']
    },
  ])

  const [instances] = useState<InstanceStatus[]>([
    { id: 'i-1', name: 'haproxy-origin-1', type: 't3.medium', status: 'running', cpu: 42, memory: 58, network: 234 },
    { id: 'i-2', name: 'haproxy-origin-2', type: 't3.medium', status: 'running', cpu: 38, memory: 52, network: 198 },
    { id: 'i-3', name: 'haproxy-backup', type: 't3.small', status: 'running', cpu: 12, memory: 28, network: 45 },
  ])

  const [openServices, setOpenServices] = useState<string[]>([])

  const toggleService = (id: string) => {
    setOpenServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const ServiceCard = ({ service }: { service: ServiceStatus }) => {
    const isOpen = openServices.includes(service.id)
    const ServiceIcon = service.icon

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleService(service.id)}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardContent className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ServiceIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`flex items-center gap-1 ${statusConfig[service.status].color}`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig[service.status].bg} animate-pulse`} />
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                      <span>•</span>
                      <span>{service.latency}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-semibold">{service.uptime}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4 space-y-2">
                {service.details?.map((detail, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  const InstanceCard = ({ instance }: { instance: InstanceStatus }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusConfig[instance.status].bg} animate-pulse`} />
            <div>
              <span className="font-medium">{instance.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{instance.type}</span>
            </div>
          </div>
          <Badge variant={instance.status === 'running' ? 'default' : 'secondary'}>
            {instance.status}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                CPU
              </span>
              <span>{instance.cpu}%</span>
            </div>
            <Progress value={instance.cpu} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Memory
              </span>
              <span>{instance.memory}%</span>
            </div>
            <Progress value={instance.memory} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Network
              </span>
              <span>{instance.network} MB/s</span>
            </div>
            <Progress value={(instance.network / 500) * 100} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (compact) {
    return (
      <Card className="animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Infrastructure
          </CardTitle>
          <Badge variant="outline" className="text-xs text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Healthy
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.slice(0, 3).map(service => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <service.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${statusConfig[service.status].color}`}>
                  {service.latency}
                </span>
                <div className={`w-2 h-2 rounded-full ${statusConfig[service.status].bg}`} />
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">HAProxy Instances</span>
              <span className="font-medium">3/3 Running</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edge Infrastructure</h2>
          <p className="text-muted-foreground">AWS edge tier components</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold text-emerald-400">4/4</p>
                <p className="text-xs text-emerald-400/70">Operational</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Instances</p>
                <p className="text-2xl font-bold text-primary">3/3</p>
                <p className="text-xs text-primary/70">Running</p>
              </div>
              <Server className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Edge Locations</p>
                <p className="text-2xl font-bold text-blue-400">450+</p>
                <p className="text-xs text-blue-400/70">Global</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold text-amber-400">23ms</p>
                <p className="text-xs text-amber-400/70">Edge to Origin</p>
              </div>
              <Activity className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Core Services</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Instances */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">HAProxy Origin Instances</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {instances.map(instance => (
            <InstanceCard key={instance.id} instance={instance} />
          ))}
        </div>
      </div>
    </div>
  )
}
