import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Server, 
  Shield,
  Globe,
  Video,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CostItem {
  name: string
  cost: number
  optimized: number
  icon: React.ElementType
  color: string
}

const costBreakdown: CostItem[] = [
  { name: 'CloudFront', cost: 2847, optimized: 2412, icon: Globe, color: '#3b82f6' },
  { name: 'ALB', cost: 432, optimized: 432, icon: Server, color: '#f59e0b' },
  { name: 'EC2 (HAProxy)', cost: 186, optimized: 124, icon: Server, color: '#10b981' },
  { name: 'AWS WAF', cost: 127, optimized: 127, icon: Shield, color: '#8b5cf6' },
  { name: 'AWS Shield', cost: 3000, optimized: 3000, icon: Shield, color: '#ef4444' },
]

const savingsTips = [
  {
    title: 'Reserved Capacity',
    description: 'Commit to CloudFront reserved capacity for 1 year',
    savings: '$435/month',
    impact: 'High'
  },
  {
    title: 'Right-size Instances',
    description: 'Use t3.small for backup HAProxy instance',
    savings: '$62/month',
    impact: 'Medium'
  },
  {
    title: 'Cache Optimization',
    description: 'Increase cache TTL to reduce origin requests',
    savings: '$285/month',
    impact: 'High'
  },
]

export function CostAnalysis() {
  const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0)
  const optimizedCost = costBreakdown.reduce((sum, item) => sum + item.optimized, 0)
  const savings = totalCost - optimizedCost
  const savingsPercent = ((savings / totalCost) * 100).toFixed(0)

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Analysis</h2>
          <p className="text-muted-foreground">Monthly AWS infrastructure costs</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimized</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(optimizedCost)}</p>
                <p className="text-xs text-emerald-400/70">/month</p>
              </div>
              <TrendingDown className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(savings)}</p>
                <p className="text-xs text-amber-400/70">{savingsPercent}% reduction</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost per Viewer</p>
                <p className="text-2xl font-bold text-blue-400">$0.0008</p>
                <p className="text-xs text-blue-400/70">At peak 12.5M viewers</p>
              </div>
              <Video className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Breakdown</CardTitle>
              <CardDescription>Current vs optimized costs by service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {costBreakdown.map((item) => {
                const Icon = item.icon
                const itemSavings = item.cost - item.optimized
                const hasSavings = itemSavings > 0
                
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: item.color + '20' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {hasSavings ? `Save ${formatCurrency(itemSavings)}/month` : 'Already optimized'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.cost)}</p>
                        {hasSavings && (
                          <p className="text-sm text-emerald-400">→ {formatCurrency(item.optimized)}</p>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.cost / totalCost) * 100}%`, 
                          backgroundColor: item.color 
                        }}
                      />
                      {hasSavings && (
                        <div 
                          className="absolute h-full rounded-full bg-emerald-500/50 transition-all duration-500"
                          style={{ 
                            width: `${(item.optimized / totalCost) * 100}%`, 
                            left: 0
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="font-bold text-lg text-emerald-400">{formatCurrency(optimizedCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsTips.map((tip, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                    </div>
                    <Badge 
                      variant={tip.impact === 'High' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tip.impact} Impact
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Potential savings</span>
                    <span className="font-bold text-emerald-400">{tip.savings}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Cost Estimate */}
      <Card>
        <CardHeader>
          <CardTitle>Super Bowl Event Cost Estimate</CardTitle>
          <CardDescription>Projected costs for game day traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Normal Day</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
              <p className="text-xs text-muted-foreground mt-1">~2M viewers</p>
            </div>
            <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-muted-foreground mb-2">Game Day (Projected)</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalCost * 4.5)}</p>
              <p className="text-xs text-muted-foreground mt-1">~12.5M peak viewers</p>
            </div>
            <div className="text-center p-6 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <p className="text-sm text-muted-foreground mb-2">With Optimization</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(optimizedCost * 4.5)}</p>
              <p className="text-xs text-emerald-400/70 mt-1">Save {formatCurrency((totalCost - optimizedCost) * 4.5)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
