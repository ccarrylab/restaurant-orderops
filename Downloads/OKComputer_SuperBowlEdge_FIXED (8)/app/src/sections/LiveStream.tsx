import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Video, 
  Radio, 
  Users, 
  TrendingUp,
  Globe,
  Activity,
  Play,
  Pause,
  Settings
} from 'lucide-react'

interface StreamQuality {
  resolution: string
  bitrate: string
  fps: number
  bufferHealth: number
}

interface ViewerRegion {
  region: string
  viewers: number
  percentage: number
}

export function LiveStream({ compact = false }: { compact?: boolean }) {
  const [isLive, setIsLive] = useState(true)
  const [viewerCount, setViewerCount] = useState(8472934)
  const [streamQuality] = useState<StreamQuality>({
    resolution: '4K UHD',
    bitrate: '25 Mbps',
    fps: 60,
    bufferHealth: 98
  })

  const [viewerRegions] = useState<ViewerRegion[]>([
    { region: 'North America', viewers: 4523847, percentage: 53 },
    { region: 'Europe', viewers: 1984723, percentage: 23 },
    { region: 'Asia Pacific', viewers: 1428392, percentage: 17 },
    { region: 'Latin America', viewers: 384729, percentage: 5 },
    { region: 'Other', viewers: 151243, percentage: 2 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5000 - 1500))
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

  if (compact) {
    return (
      <Card className="animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Live Stream
          </CardTitle>
          <Badge className="bg-red-500 text-white animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Radio className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-white">SUPER BOWL LVIII</p>
                <p className="text-muted-foreground">Live Stream Active</p>
              </div>
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
            </div>
            <div className="absolute bottom-4 right-4">
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                {streamQuality.resolution} • {streamQuality.bitrate}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{formatNumber(viewerCount)}</span>
              <span className="text-sm text-muted-foreground">watching</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>{streamQuality.bufferHealth}% buffer</span>
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
          <h2 className="text-2xl font-bold">Live Stream Monitor</h2>
          <p className="text-muted-foreground">Real-time streaming metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant={isLive ? "destructive" : "default"} 
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isLive ? 'Stop Stream' : 'Start Stream'}
          </Button>
        </div>
      </div>

      {/* Stream Preview */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-amber-500 to-red-500 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Radio className="w-16 h-16 text-white" />
                </div>
                <p className="text-4xl font-black gradient-text mb-2">SUPER BOWL LVIII</p>
                <p className="text-xl text-muted-foreground">Live Stream Active</p>
              </div>
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                LIVE
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                {streamQuality.resolution} • {streamQuality.fps}fps • {streamQuality.bitrate}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">{formatNumber(viewerCount)}</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{streamQuality.bufferHealth}% buffer</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution</p>
                <p className="text-2xl font-bold text-blue-400">{streamQuality.resolution}</p>
              </div>
              <Video className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bitrate</p>
                <p className="text-2xl font-bold text-amber-400">{streamQuality.bitrate}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frame Rate</p>
                <p className="text-2xl font-bold text-emerald-400">{streamQuality.fps} fps</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buffer Health</p>
                <p className="text-2xl font-bold text-purple-400">{streamQuality.bufferHealth}%</p>
              </div>
              <Radio className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Viewer Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {viewerRegions.map((region) => (
              <div key={region.region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{region.region}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{formatNumber(region.viewers)}</span>
                    <span className="text-sm text-primary w-12 text-right">{region.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
