import { forwardRef, type HTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glow' | 'glass' | 'bordered'
  hover?: boolean
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = true, className, children, ...props }, ref) => {
    const baseStyles = `
      relative rounded-xl overflow-hidden
      transition-all duration-300 ease-out
    `

    const variants = {
      default: `
        bg-gaming-light/50 backdrop-blur-sm
        border border-gaming-border/50
      `,
      glow: `
        bg-gaming-light/50 backdrop-blur-sm
        border border-neon-cyan/30
        shadow-card
      `,
      glass: `
        bg-white/5 backdrop-blur-xl
        border border-white/10
      `,
      bordered: `
        bg-gaming-light/30
        border-2 border-gaming-border
      `,
    }

    const hoverStyles = hover
      ? `
        hover:border-neon-cyan/50 hover:-translate-y-1
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,240,255,0.1)]
      `
      : ''

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        {...props}
      >
        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none
          bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5
          group-hover:opacity-100"
        />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-b border-gaming-border/50', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-t border-gaming-border/50', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
export default Card
