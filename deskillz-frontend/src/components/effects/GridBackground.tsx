import { cn } from '@/lib/utils'

interface GridBackgroundProps {
  className?: string
  variant?: 'default' | 'perspective' | 'hex'
}

export default function GridBackground({ className, variant = 'default' }: GridBackgroundProps) {
  if (variant === 'perspective') {
    return (
      <div className={cn('fixed inset-0 pointer-events-none overflow-hidden', className)}>
        {/* Perspective grid floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[60vh]"
          style={{
            perspective: '500px',
            perspectiveOrigin: '50% 0%',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(60deg)',
              transformOrigin: 'top center',
            }}
          />
          {/* Gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-gaming-dark/50 to-transparent" />
        </div>
        
        {/* Glow line at horizon */}
        <div
          className="absolute bottom-[40vh] left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)',
            boxShadow: '0 0 30px 5px rgba(0, 240, 255, 0.3)',
          }}
        />
      </div>
    )
  }

  if (variant === 'hex') {
    return (
      <div className={cn('fixed inset-0 pointer-events-none hex-pattern opacity-50', className)} />
    )
  }

  // Default flat grid
  return (
    <div className={cn('fixed inset-0 pointer-events-none', className)}>
      <div className="absolute inset-0 bg-grid-animated opacity-50" />
      {/* Radial glow in center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 50%)',
        }}
      />
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-96 h-96"
        style={{
          background: 'radial-gradient(ellipse at 0% 0%, rgba(191, 0, 255, 0.05) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96"
        style={{
          background: 'radial-gradient(ellipse at 100% 100%, rgba(255, 0, 128, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
