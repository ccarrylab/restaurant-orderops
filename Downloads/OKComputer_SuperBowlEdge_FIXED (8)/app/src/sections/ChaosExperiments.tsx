import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  Clock,
  Activity,
  Cloud,
  Server,
  Shield,
  AlertTriangle,
  TrendingUp,
  Flame,
  Globe
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Experiment {
  id: string
  name: string
  description: string
  type: 'blackout' | 'latency' | 'origin-failure' | 'ddos' | 'cache-purge'
  status: 'idle' | 'running' | 'completed' | 'failed'
  duration: number
  progress: number
  impact: 'low' | 'medium' | 'high'
  lastRun?: string
  results?: {
    downtime: string
    recoveryTime: string
    success: boolean
  }
}

interface ExperimentRun {
  id: string
  experimentName: string
  startTime: string
  duration: string
  result: 'success' | 'failure'
  impact: string
}

const experimentIcons = {
  'blackout': Cloud,
  'latency': Activity,
  'origin-failure': Server,
  'ddos': Shield,
  'cache-purge': Globe,
}

const impactColors = {
  low: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-red-400 bg-red-500/10',
}

export function ChaosExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: 'blackout',
      name: 'Region Blackout',
      description: 'Simulate complete CloudFront edge failure in a region',
      type: 'blackout',
      status: 'idle',
      duration: 180,
      progress: 0,
      impact: 'high',
      lastRun: '2 hours ago',
      results: { downtime: '0s', recoveryTime: '8s', success: true }
    },
    {
      id: 'latency',
      name: 'Network Latency Spike',
      description: 'Inject high latency between edge and origin',
      type: 'latency',
      status: 'idle',
      duration: 120,
      progress: 0,
      impact: 'medium',
      lastRun: '5 hours ago',
      results: { downtime: '0s', recoveryTime: '3s', success: true }
    },
    {
      id: 'origin-failure',
      name: 'Origin Server Failure',
      description: 'Test HAProxy failover when origin goes down',
      type: 'origin-failure',
      status: 'idle',
      duration: 150,
      progress: 0,
      impact: 'high',
      lastRun: '1 day ago',
      results: { downtime: '2s', recoveryTime: '12s', success: true }
    },
    {
      id: 'ddos',
      name: 'DDoS Attack Simulation',
      description: 'Test WAF rate limiting under attack',
      type: 'ddos',
      status: 'idle',
      duration: 240,
      progress: 0,
      impact: 'medium',
      lastRun: '2 days ago',
      results: { downtime: '0s', recoveryTime: '5s', success: true }
    },
    {
      id: 'cache-purge',
      name: 'Mass Cache Invalidation',
      description: 'Purge all cached content and measure origin load',
      type: 'cache-purge',
      status: 'idle',
      duration: 300,
      progress: 0,
      impact: 'low',
    },
  ])

  const [recentRuns] = useState<ExperimentRun[]>([
    { id: '1', experimentName: 'Region Blackout', startTime: '2 hours ago', duration: '3m 12s', result: 'success', impact: '0% viewer loss' },
    { id: '2', experimentName: 'Network Latency Spike', startTime: '5 hours ago', duration: '2m 45s', result: 'success', impact: '+45ms latency' },
    { id: '3', experimentName: 'Origin Server Failure', startTime: '1 day ago', duration: '2m 30s', result: 'success', impact: 'Auto-failover' },
    { id: '4', experimentName: 'DDoS Attack Simulation', startTime: '2 days ago', duration: '4m 08s', result: 'success', impact: 'WAF blocked 100%' },
    { id: '5', experimentName: 'Mass Cache Invalidation', startTime: '3 days ago', duration: '5m 00s', result: 'success', impact: 'Origin handled load' },
  ])

  const [runningExperiment, setRunningExperiment] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null)

  useEffect(() => {
    if (!runningExperiment) return

    const interval = setInterval(() => {
      setExperiments(prev => prev.map(exp => {
        if (exp.id === runningExperiment && exp.status === 'running') {
          const newProgress = exp.progress + (100 / (exp.duration / 5))
          if (newProgress >= 100) {
            setRunningExperiment(null)
            return { 
              ...exp, 
              status: 'completed', 
              progress: 100,
              lastRun: 'Just now',
              results: { downtime: '0s', recoveryTime: '10s', success: true }
            }
          }
          return { ...exp, progress: newProgress }
        }
        return exp
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [runningExperiment])

  const startExperiment = (id: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'running', progress: 0 } : exp
    ))
    setRunningExperiment(id)
    setShowConfirmDialog(null)
  }

  const stopExperiment = (id: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'idle', progress: 0 } : exp
    ))
    setRunningExperiment(null)
  }

  const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
    const Icon = experimentIcons[experiment.type]
    const isRunning = experiment.status === 'running'

    return (
      <Card className={`overflow-hidden transition-all duration-300 ${isRunning ? 'border-primary animate-pulse-glow' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${impactColors[experiment.impact]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">{experiment.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{experiment.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(experiment.duration / 60)}m
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${impactColors[experiment.impact]}`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {experiment.impact} impact
                  </Badge>
                  {experiment.lastRun && (
                    <span className="text-xs text-muted-foreground">
                      Last run: {experiment.lastRun}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => stopExperiment(experiment.id)}
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              ) : (
                <Dialog open={showConfirmDialog === experiment.id} onOpenChange={(open) => setShowConfirmDialog(open ? experiment.id : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Run Chaos Experiment</DialogTitle>
                      <DialogDescription>
                        You are about to run <strong>{experiment.name}</strong> using AWS FIS 
                        (Fault Injection Simulator).
                      </DialogDescription>
                    </DialogHeader>
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        This experiment has <strong>{experiment.impact} impact</strong> and will run for {Math.floor(experiment.duration / 60)} minutes.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowConfirmDialog(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => startExperiment(experiment.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Experiment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {isRunning && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span>{Math.round(experiment.progress)}%</span>
              </div>
              <Progress value={experiment.progress} className="h-2" />
            </div>
          )}

          {experiment.results && !isRunning && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Downtime</p>
                <p className="font-semibold text-emerald-400">{experiment.results.downtime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recovery</p>
                <p className="font-semibold">{experiment.results.recoveryTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Result</p>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Passed</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chaos Engineering</h2>
          <p className="text-muted-foreground">AWS FIS experiments for edge resilience</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
            89 tests run
          </Badge>
          <Badge variant="outline" className="text-sm">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
            98/100 score
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-400">99.1%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Recovery</p>
                <p className="text-2xl font-bold text-primary">6s</p>
              </div>
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viewer Uptime</p>
                <p className="text-2xl font-bold text-amber-400">99.97%</p>
              </div>
              <Activity className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold text-red-400">
                  {experiments.filter(e => e.status === 'running').length}
                </p>
              </div>
              <Flame className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="experiments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {experiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Experiment Runs</CardTitle>
              <CardDescription>Last 30 days of chaos engineering tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{run.experimentName}</p>
                        <p className="text-sm text-muted-foreground">{run.startTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{run.duration}</p>
                      <p className="text-sm text-emerald-400">{run.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
