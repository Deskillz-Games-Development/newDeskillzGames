import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import GridBackground from '../effects/GridBackground'
import { AmbientOrbs } from '../effects/GlowOrb'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gaming-dark">
      {/* Background effects */}
      <GridBackground />
      <AmbientOrbs />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1 relative z-10 pt-16 lg:pt-20">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
