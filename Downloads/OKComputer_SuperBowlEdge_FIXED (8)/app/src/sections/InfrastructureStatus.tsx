import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Database, 
  Cloud, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  icon: React.ElementType
  uptime: string
  latency: string
  lastIncident?: string
  details?: string[]
}

interface NodeStatus {
  id: string
  name: string
  status: 'ready' | 'not-ready' | 'cordoned'
  cpu: number
  memory: number
  pods: number
  maxPods: number
}

const statusConfig = {
  operational: { color: 'text-emerald-400', bg: 'bg-emerald-500', icon: CheckCircle },
  degraded: { color: 'text-amber-400', bg: 'bg-amber-500', icon: AlertTriangle },
  down: { color: 'text-red-400', bg: 'bg-red-500', icon: XCircle },
  maintenance: { color: 'text-blue-400', bg: 'bg-blue-500', icon: RefreshCw },
  ready: { color: 'text-emerald-400', bg: 'bg-emerald-500' },
  'not-ready': { color: 'text-red-400', bg: 'bg-red-500' },
  cordoned: { color: 'text-amber-400', bg: 'bg-amber-500' },
}

export function InfrastructureStatus({ fullView = false }: { fullView?: boolean }) {
  const [services, setServices] = useState<ServiceStatus[]>([
    { 
      id: 'eks', 
      name: 'EKS Cluster', 
      status: 'operational', 
      icon: Cloud, 
      uptime: '99.9%', 
      latency: '45ms',
      details: ['Control Plane: Healthy', 'Node Groups: 3/3 Ready', 'Auto-scaling: Active']
    },
    { 
      id: 'pods', 
      name: 'Application Pods', 
      status: 'operational', 
      icon: Server, 
      uptime: '99.7%', 
      latency: '12ms',
      details: ['Running: 24/24', 'Restarts: 2 (last 24h)', 'Health Checks: Passing']
    },
    { 
      id: 'database', 
      name: 'Database', 
      status: 'operational', 
      icon: Database, 
      uptime: '99.99%', 
      latency: '8ms',
      details: ['Primary: Healthy', 'Replicas: 2/2', 'Connections: 45/100']
    },
    { 
      id: 'ingress', 
      name: 'Ingress Controller', 
      status: 'operational', 
      icon: Shield, 
      uptime: '99.8%', 
      latency: '23ms',
      details: ['NGINX: Running', 'SSL: Valid', 'Routes: 12 configured']
    },
  ])

  const [nodes] = useState<NodeStatus[]>([
    { id: 'node-1', name: 'eks-node-1', status: 'ready', cpu: 45, memory: 62, pods: 8, maxPods: 17 },
    { id: 'node-2', name: 'eks-node-2', status: 'ready', cpu: 38, memory: 55, pods: 9, maxPods: 17 },
    { id: 'node-3', name: 'eks-node-3', status: 'ready', cpu: 52, memory: 71, pods: 7, maxPods: 17 },
  ])

  const [openServices, setOpenServices] = useState<string[]>([])

  // Simulate occasional status changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setServices(prev => prev.map(service => ({
          ...service,
          latency: `${Math.floor(Math.random() * 50 + 5)}ms`
        })))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

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

  const NodeCard = ({ node }: { node: NodeStatus }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusConfig[node.status].bg} animate-pulse`} />
            <span className="font-medium">{node.name}</span>
          </div>
          <Badge variant={node.status === 'ready' ? 'default' : 'secondary'}>
            {node.status}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CPU</span>
              <span>{node.cpu}%</span>
            </div>
            <Progress value={node.cpu} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Memory</span>
              <span>{node.memory}%</span>
            </div>
            <Progress value={node.memory} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Pods</span>
              <span>{node.pods}/{node.maxPods}</span>
            </div>
            <Progress value={(node.pods / node.maxPods) * 100} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (fullView) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Infrastructure Status</h2>
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
                  <p className="text-sm text-muted-foreground">Nodes</p>
                  <p className="text-2xl font-bold text-primary">3/3</p>
                  <p className="text-xs text-primary/70">Ready</p>
                </div>
                <Server className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pods</p>
                  <p className="text-2xl font-bold text-accent">24/24</p>
                  <p className="text-xs text-accent/70">Running</p>
                </div>
                <Cloud className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold text-amber-400">22ms</p>
                  <p className="text-xs text-amber-400/70">Healthy</p>
                </div>
                <Database className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Services</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Nodes */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Kubernetes Nodes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map(node => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Infrastructure</CardTitle>
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
            <span className="text-muted-foreground">Nodes</span>
            <span className="font-medium">3/3 Ready</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pods</span>
          <span className="font-medium">24/24 Running</span>
        </div>
      </CardContent>
    </Card>
  )
}
