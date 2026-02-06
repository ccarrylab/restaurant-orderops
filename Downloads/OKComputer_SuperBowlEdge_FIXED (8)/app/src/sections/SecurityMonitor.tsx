import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  FileKey,
  Globe,
  Scan,
  Download,
  Ban
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SecurityCheck {
  id: string
  name: string
  status: 'pass' | 'warning' | 'fail'
  score: number
  description: string
  details?: string[]
}

interface ThreatEvent {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  source: string
  blocked: boolean
  timestamp: string
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'waf',
    name: 'AWS WAF Rules',
    status: 'pass',
    score: 100,
    description: 'Web Application Firewall rules active and blocking threats',
    details: ['SQL Injection protection', 'XSS filtering', 'Rate limiting enabled', 'Geo-blocking active']
  },
  {
    id: 'shield',
    name: 'AWS Shield Advanced',
    status: 'pass',
    score: 100,
    description: 'DDoS protection enabled for all edge endpoints',
    details: ['Automatic detection', '24/7 DRT support', 'Cost protection', 'Real-time metrics']
  },
  {
    id: 'ssl',
    name: 'SSL/TLS Configuration',
    status: 'pass',
    score: 95,
    description: 'Certificates valid and properly configured',
    details: ['TLS 1.3 enabled', 'Auto-renewal active', 'HSTS enabled', 'Perfect forward secrecy']
  },
  {
    id: 'iam',
    name: 'IAM Access Control',
    status: 'pass',
    score: 100,
    description: 'Role-based access control properly configured',
    details: ['Least privilege applied', 'MFA enforced', 'Regular access reviews', 'Service accounts restricted']
  },
  {
    id: 'logging',
    name: 'Security Logging',
    status: 'pass',
    score: 100,
    description: 'Comprehensive audit logging enabled',
    details: ['CloudTrail active', 'WAF logs enabled', 'Real-time alerting', '90-day retention']
  },
]

const threatEvents: ThreatEvent[] = [
  { id: '1', severity: 'high', type: 'DDoS Attempt', source: '103.45.67.89', blocked: true, timestamp: '2 min ago' },
  { id: '2', severity: 'medium', type: 'SQL Injection', source: '45.23.78.12', blocked: true, timestamp: '5 min ago' },
  { id: '3', severity: 'medium', type: 'XSS Attempt', source: '78.90.123.45', blocked: true, timestamp: '8 min ago' },
  { id: '4', severity: 'low', type: 'Rate Limit Exceeded', source: '12.34.56.78', blocked: true, timestamp: '12 min ago' },
  { id: '5', severity: 'high', type: 'Bot Traffic', source: '89.123.45.67', blocked: true, timestamp: '15 min ago' },
]

const severityColors = {
  critical: 'text-red-500 bg-red-500/10',
  high: 'text-orange-500 bg-orange-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  low: 'text-blue-500 bg-blue-500/10',
}

const statusIcons = {
  pass: { icon: CheckCircle, color: 'text-emerald-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  fail: { icon: XCircle, color: 'text-red-400' },
}

export function SecurityMonitor() {
  const overallScore = Math.round(securityChecks.reduce((sum, check) => sum + check.score, 0) / securityChecks.length)
  const totalBlocked = 1247

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitor</h2>
          <p className="text-muted-foreground">WAF, Shield, and threat detection</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Scan className="w-4 h-4 mr-2" />
            Run Scan
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-3xl font-bold text-emerald-400">{overallScore}/100</p>
                <p className="text-xs text-emerald-400/70">Production Ready</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checks Passed</p>
                <p className="text-3xl font-bold text-primary">{securityChecks.length}/{securityChecks.length}</p>
                <p className="text-xs text-primary/70">100% pass rate</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                <p className="text-3xl font-bold text-red-400">{totalBlocked}</p>
                <p className="text-xs text-red-400/70">Last 24 hours</p>
              </div>
              <Ban className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Scan</p>
                <p className="text-3xl font-bold text-amber-400">5m ago</p>
                <p className="text-xs text-amber-400/70">Automated</p>
              </div>
              <Scan className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="checks">Security Checks</TabsTrigger>
          <TabsTrigger value="threats">Threat Events</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {securityChecks.map((check) => {
              const StatusIcon = statusIcons[check.status].icon
              return (
                <Card key={check.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusIcons[check.status].color.replace('text', 'bg')}/10`}>
                          <StatusIcon className={`w-6 h-6 ${statusIcons[check.status].color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{check.name}</h4>
                            <Badge variant={check.status === 'pass' ? 'default' : check.status === 'warning' ? 'secondary' : 'destructive'}>
                              {check.score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                          {check.details && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {check.details.map((detail, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary">
                                  {detail}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-24">
                        <Progress value={check.score} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Recent Threat Events</CardTitle>
              <CardDescription>Blocked attacks in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threatEvents.map((threat) => (
                  <div 
                    key={threat.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={`${severityColors[threat.severity]}`}>
                        {threat.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{threat.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Source: {threat.source} • {threat.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge variant={threat.blocked ? 'default' : 'outline'} className={threat.blocked ? 'bg-emerald-500' : ''}>
                      {threat.blocked ? 'Blocked' : 'Allowed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Layers */}
      <Card>
        <CardHeader>
          <CardTitle>Defense Layers</CardTitle>
          <CardDescription>Multi-layered security architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Globe, title: 'CloudFront', desc: 'Edge DDoS protection' },
              { icon: Shield, title: 'AWS WAF', desc: 'Application firewall' },
              { icon: Lock, title: 'AWS Shield', desc: 'DDoS mitigation' },
              { icon: FileKey, title: 'ACM', desc: 'SSL/TLS certificates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
