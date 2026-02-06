import { useState, useEffect } from 'react'
import { Sidebar } from './sections/Sidebar'
import { Header } from './sections/Header'
import { Scoreboard } from './sections/Scoreboard'
import { CDNMetrics } from './sections/CDNMetrics'
import { ChaosExperiments } from './sections/ChaosExperiments'
import { EdgeInfrastructure } from './sections/EdgeInfrastructure'
import { SecurityMonitor } from './sections/SecurityMonitor'
import { LiveStream } from './sections/LiveStream'
import { CostAnalysis } from './sections/CostAnalysis'

export type ViewType = 'scoreboard' | 'cdn' | 'chaos' | 'infrastructure' | 'security' | 'stream' | 'cost'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('scoreboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const renderContent = () => {
    switch (currentView) {
      case 'scoreboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <Scoreboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CDNMetrics compact />
              <EdgeInfrastructure compact />
            </div>
            <LiveStream compact />
          </div>
        )
      case 'cdn':
        return <CDNMetrics />
      case 'chaos':
        return <ChaosExperiments />
      case 'infrastructure':
        return <EdgeInfrastructure />
      case 'security':
        return <SecurityMonitor />
      case 'stream':
        return <LiveStream />
      case 'cost':
        return <CostAnalysis />
      default:
        return <Scoreboard />
    }
  }

  return (
    <div className="min-h-screen bg-background flex field-pattern">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header lastUpdate={lastUpdate} />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
