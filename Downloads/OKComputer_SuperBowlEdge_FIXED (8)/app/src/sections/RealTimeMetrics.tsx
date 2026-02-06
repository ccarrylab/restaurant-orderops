import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Cpu, MemoryStick, HardDrive, Network } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MetricData {
  timestamp: number
  value: number
}

interface SparklineProps {
  data: MetricData[]
  color: string
  height?: number
  showArea?: boolean
}

function Sparkline({ data, color, height = 60, showArea = true }: SparklineProps) {
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

    // Clear canvas
    ctx.clearRect(0, 0, width, chartHeight)

    // Calculate scales
    const values = data.map(d => d.value)
    const min = Math.min(...values) * 0.9
    const max = Math.max(...values) * 1.1
    const range = max - min || 1

    // Draw area
    if (showArea) {
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
    }

    // Draw line
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

    // Draw current value dot
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
  }, [data, color, height, showArea])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full"
      style={{ height: `${height}px` }}
    />
  )
}

interface MetricCardProps {
  title: string
  value: string
  unit: string
  data: MetricData[]
  color: string
  icon: React.ElementType
  maxValue?: number
}

function MetricCard({ title, value, unit, data, color, icon: Icon, maxValue }: MetricCardProps) {
  const percentage = maxValue ? (parseFloat(value) / maxValue) * 100 : 0
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
      
      <Sparkline data={data} color={color} />
      
      {maxValue && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Usage</span>
            <span style={{ color }}>{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function RealTimeMetrics({ fullView = false }: { fullView?: boolean }) {
  const [cpuData, setCpuData] = useState<MetricData[]>([])
  const [memoryData, setMemoryData] = useState<MetricData[]>([])
  const [networkData, setNetworkData] = useState<MetricData[]>([])
  const [diskData, setDiskData] = useState<MetricData[]>([])

  // Generate initial data
  useEffect(() => {
    const now = Date.now()
    const initialData: MetricData[] = []
    
    for (let i = 0; i < 30; i++) {
      initialData.push({
        timestamp: now - (29 - i) * 5000,
        value: 40 + Math.random() * 30
      })
    }
    
    setCpuData(initialData)
    setMemoryData(initialData.map(d => ({ ...d, value: 60 + Math.random() * 20 })))
    setNetworkData(initialData.map(d => ({ ...d, value: 100 + Math.random() * 200 })))
    setDiskData(initialData.map(d => ({ ...d, value: 20 + Math.random() * 15 })))
  }, [])

  // Update data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      
      setCpuData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 35 + Math.random() * 40 }]
        return newData
      })
      
      setMemoryData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 55 + Math.random() * 25 }]
        return newData
      })
      
      setNetworkData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 80 + Math.random() * 250 }]
        return newData
      })
      
      setDiskData(prev => {
        const newData = [...prev.slice(1), { timestamp: now, value: 18 + Math.random() * 20 }]
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentCpu = cpuData[cpuData.length - 1]?.value.toFixed(1) || '0'
  const currentMemory = memoryData[memoryData.length - 1]?.value.toFixed(1) || '0'
  const currentNetwork = networkData[networkData.length - 1]?.value.toFixed(0) || '0'
  const currentDisk = diskData[diskData.length - 1]?.value.toFixed(1) || '0'

  if (fullView) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Real-Time Metrics</h2>
          <Badge variant="outline" className="text-xs">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <MetricCard
                    title="CPU Usage"
                    value={currentCpu}
                    unit="%"
                    data={cpuData}
                    color="#6366f1"
                    icon={Cpu}
                    maxValue={100}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <MetricCard
                    title="Memory Usage"
                    value={currentMemory}
                    unit="%"
                    data={memoryData}
                    color="#22d3ee"
                    icon={MemoryStick}
                    maxValue={100}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <MetricCard
                    title="Network I/O"
                    value={currentNetwork}
                    unit="MB/s"
                    data={networkData}
                    color="#f59e0b"
                    icon={Network}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <MetricCard
                    title="Disk Usage"
                    value={currentDisk}
                    unit="%"
                    data={diskData}
                    color="#10b981"
                    icon={HardDrive}
                    maxValue={100}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cpu">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Sparkline data={cpuData} color="#6366f1" height={300} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Sparkline data={memoryData} color="#22d3ee" height={300} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>Network I/O Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Sparkline data={networkData} color="#f59e0b" height={300} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Real-Time Metrics</CardTitle>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1 animate-pulse" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <MetricCard
          title="CPU Usage"
          value={currentCpu}
          unit="%"
          data={cpuData}
          color="#6366f1"
          icon={Cpu}
          maxValue={100}
        />
        <MetricCard
          title="Memory Usage"
          value={currentMemory}
          unit="%"
          data={memoryData}
          color="#22d3ee"
          icon={MemoryStick}
          maxValue={100}
        />
        <MetricCard
          title="Network I/O"
          value={currentNetwork}
          unit="MB/s"
          data={networkData}
          color="#f59e0b"
          icon={Network}
        />
      </CardContent>
    </Card>
  )
}
