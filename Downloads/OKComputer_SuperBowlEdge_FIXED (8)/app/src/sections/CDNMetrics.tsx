import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Activity,
  Server,
  Zap
} from 'lucide-react'


interface MetricData {
  timestamp: number
  value: number
}

interface SparklineProps {
  data: MetricData[]
  color: string
  height?: number
}

function Sparkline({ data, color, height = 60 }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const width = canvas.offsetWidth
    const chartHeight = height

    ctx.clearRect(0, 0, width, chartHeight)

    const values = data.map(d => d.value)
    const min = Math.min(...values) * 0.9
    const max = Math.max(...values) * 1.1
    const range = max - min || 1

    ctx.beginPath()
    ctx.moveTo(0, chartHeight)
    
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width
      const y = chartHeight - ((point.value - min) / range) * chartHeight
      ctx.lineTo(x, y)
    })
    
    ctx.lineTo(width, chartHeight)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight)
    gradient.addColorStop(0, color + '40')
    gradient.addColorStop(1, color + '00')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.beginPath()
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width
      const y = chartHeight - ((point.value - min) / range) * chartHeight
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    const lastPoint = data[data.length - 1]
    const lastX = width
    const lastY = chartHeight - ((lastPoint.value - min) / range) * chartHeight
    
    ctx.beginPath()
    ctx.arc(lastX - 4, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#0a0a0f'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [data, color, height])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full"
      style={{ height: `${height}px` }}
    />
  )
}

interface EdgeLocation {
  region: string
  status: 'healthy' | 'degraded' | 'down'
  requests: number
  latency: number
  hitRate: number
}

export function CDNMetrics({ compact = false }: { compact?: boolean }) {
  const [requestsData, setRequestsData] = useState<MetricData[]>([])
  const [bandwidthData, setBandwidthData] = useState<MetricData[]>([])
  const [errorRateData, setErrorRateData] = useState<MetricData[]>([])

  const [edgeLocations] = useState<EdgeLocation[]>([
    { region: 'US-East', status: 'healthy', requests: 2847293, latency: 23, hitRate: 96.2 },
    { region: 'US-West', status: 'healthy', requests: 1923847, latency: 34, hitRate: 94.8 },
    { region: 'Europe', status: 'healthy', requests: 1582934, latency: 45, hitRate: 93.5 },
    { region: 'Asia-Pacific', status: 'healthy', requests: 1238472, latency: 67, hitRate: 91.2 },
    { region: 'South America', status: 'healthy', requests: 847293, latency: 89, hitRate: 89.7 },
  ])

  useEffect(() => {
    const now = Date.now()
    const initialData: MetricData[] = []
    
    for (let i = 0; i < 30; i++) {
      initialData.push({
        timestamp: now - (29 - i) * 5000,
        value: 50000 + Math.random() * 30000
      })
    }
    
    setRequestsData(initialData)
    setBandwidthData(initialData.map(d => ({ ...d, value: 800 + Math.random() * 400 })))
    setErrorRateData(initialData.map(d => ({ ...d, value: 0.5 + Math.random() * 1.5 })))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      
      setRequestsData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 45000 + Math.random() * 35000 }]
        return newData
      })
      
      setBandwidthData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 700 + Math.random() * 500 }]
        return newData
      })
      
      setErrorRateData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 0.3 + Math.random() * 2 }]
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentRequests = requestsData[requestsData.length - 1]?.value.toFixed(0) || '0'
  const currentBandwidth = bandwidthData[bandwidthData.length - 1]?.value.toFixed(0) || '0'
  const currentErrorRate = errorRateData[errorRateData.length - 1]?.value.toFixed(2) || '0'

  if (compact) {
    return (
      <Card className="animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            CDN Performance
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Server className="w-4 h-4" />
                Requests/sec
              </span>
              <span className="font-semibold">{parseInt(currentRequests).toLocaleString()}</span>
            </div>
            <Sparkline data={requestsData} color="#3b82f6" height={40} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Bandwidth (Gbps)
              </span>
              <span className="font-semibold">{currentBandwidth}</span>
            </div>
            <Sparkline data={bandwidthData} color="#f59e0b" height={40} />
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error Rate</span>
              <span className="font-semibold text-emerald-400">{currentErrorRate}%</span>
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
          <h2 className="text-2xl font-bold">CDN Metrics</h2>
          <p className="text-muted-foreground">CloudFront performance and edge locations</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Globe className="w-4 h-4 mr-2" />
          450+ Edge Locations
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Requests/sec</span>
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{parseInt(currentRequests).toLocaleString()}</p>
            <Sparkline data={requestsData} color="#3b82f6" height={50} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Bandwidth (Gbps)</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{currentBandwidth}</p>
            <Sparkline data={bandwidthData} color="#f59e0b" height={50} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{currentErrorRate}%</p>
            <Sparkline data={errorRateData} color="#10b981" height={50} />
          </CardContent>
        </Card>
      </div>

      {/* Edge Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Edge Location Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {edgeLocations.map((location) => (
              <div key={location.region} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    location.status === 'healthy' ? 'bg-emerald-500' : 
                    location.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <div>
                    <p className="font-medium">{location.region}</p>
                    <p className="text-sm text-muted-foreground">
                      {location.requests.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="font-semibold">{location.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hit Rate</p>
                    <p className="font-semibold text-emerald-400">{location.hitRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
