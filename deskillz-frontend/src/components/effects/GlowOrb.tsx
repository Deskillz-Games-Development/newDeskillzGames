import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowOrbProps {
  className?: string
  color?: 'cyan' | 'purple' | 'pink' | 'green'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  blur?: number
  animate?: boolean
}

export default function GlowOrb({
  className,
  color = 'cyan',
  size = 'md',
  blur = 100,
  animate = true,
}: GlowOrbProps) {
  const colors = {
    cyan: 'bg-neon-cyan',
    purple: 'bg-neon-purple',
    pink: 'bg-neon-pink',
    green: 'bg-neon-green',
  }

  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
    xl: 'w-[500px] h-[500px]',
  }

  return (
    <motion.div
      className={cn(
        'absolute rounded-full opacity-30 pointer-events-none',
        colors[color],
        sizes[size],
        className
      )}
      style={{ filter: `blur(${blur}px)` }}
      animate={
        animate
          ? {
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }
          : undefined
      }
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Pre-configured ambient orbs for backgrounds
export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <GlowOrb
        color="cyan"
        size="xl"
        className="top-[-200px] left-[-200px]"
      />
      <GlowOrb
        color="purple"
        size="lg"
        className="top-[30%] right-[-100px]"
        blur={120}
      />
      <GlowOrb
        color="pink"
        size="md"
        className="bottom-[-100px] left-[30%]"
        blur={80}
      />
      <GlowOrb
        color="cyan"
        size="md"
        className="bottom-[20%] right-[20%]"
        blur={100}
      />
    </div>
  )
}
