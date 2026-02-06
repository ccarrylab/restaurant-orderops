import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Users, 
  Eye, 
  TrendingUp,
  Zap,
  Globe,
  Shield
} from 'lucide-react'

interface GameStats {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  quarter: string
  timeRemaining: string
  viewers: number
  peakViewers: number
  edgeLocations: number
  cacheHitRate: number
}

export function Scoreboard() {
  const [gameStats, setGameStats] = useState<GameStats>({
    homeTeam: 'CHIEFS',
    awayTeam: 'EAGLES',
    homeScore: 24,
    awayScore: 21,
    quarter: 'Q4',
    timeRemaining: '2:34',
    viewers: 8472934,
    peakViewers: 12500000,
    edgeLocations: 450,
    cacheHitRate: 94.7
  })

  // Simulate live game updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 10000 - 3000),
        cacheHitRate: Math.min(99, Math.max(85, prev.cacheHitRate + (Math.random() - 0.5) * 2))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Main Scoreboard */}
      <Card className="overflow-hidden scoreboard">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white font-bold">SUPER BOWL LVIII</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
              <span className="text-white/80 text-sm">{gameStats.quarter} • {gameStats.timeRemaining}</span>
            </div>
          </div>

          {/* Score Display */}
          <div className="p-8">
            <div className="flex items-center justify-center gap-8">
              {/* Away Team */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <span className="text-3xl font-black text-white">{gameStats.awayTeam[0]}</span>
                </div>
                <h3 className="text-2xl font-bold">{gameStats.awayTeam}</h3>
                <p className="text-muted-foreground text-sm">Away</p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-6">
                <span className="text-7xl font-black gradient-text">{gameStats.awayScore}</span>
                <span className="text-4xl font-bold text-muted-foreground">-</span>
                <span className="text-7xl font-black gradient-text">{gameStats.homeScore}</span>
              </div>

              {/* Home Team */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <span className="text-3xl font-black text-white">{gameStats.homeTeam[0]}</span>
                </div>
                <h3 className="text-2xl font-bold">{gameStats.homeTeam}</h3>
                <p className="text-muted-foreground text-sm">Home</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Viewers</p>
                <p className="text-3xl font-bold">{formatNumber(gameStats.viewers)}</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last quarter
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peak Viewers</p>
                <p className="text-3xl font-bold text-amber-400">{formatNumber(gameStats.peakViewers)}</p>
                <p className="text-xs text-muted-foreground">All-time high</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Edge Locations</p>
                <p className="text-3xl font-bold text-emerald-400">{gameStats.edgeLocations}</p>
                <p className="text-xs text-emerald-400/70">Global coverage</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-3xl font-bold text-purple-400">{gameStats.cacheHitRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-400/70">CloudFront</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Row */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          <Shield className="w-4 h-4 mr-2" />
          WAF Active
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/30">
          <Globe className="w-4 h-4 mr-2" />
          CloudFront Healthy
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border-amber-500/30">
          <Zap className="w-4 h-4 mr-2" />
          HAProxy Origin: OK
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border-purple-500/30">
          <TrendingUp className="w-4 h-4 mr-2" />
          Latency: 45ms
        </Badge>
      </div>
    </div>
  )
}
