import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  glow?: boolean
}

export default function Badge({
  variant = 'default',
  size = 'md',
  pulse = false,
  glow = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-1.5
    font-display font-semibold uppercase tracking-wider
    rounded-full
  `

  const variants = {
    default: 'bg-gaming-lighter text-white/80',
    success: 'bg-neon-green/20 text-neon-green border border-neon-green/30',
    warning: 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30',
    danger: 'bg-neon-red/20 text-neon-red border border-neon-red/30',
    info: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30',
    premium: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }

  const glowStyles = glow
    ? {
        success: 'shadow-neon-green',
        warning: 'shadow-[0_0_20px_rgba(255,255,0,0.3)]',
        danger: 'shadow-neon-pink',
        info: 'shadow-neon-cyan',
        premium: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]',
        default: '',
      }[variant]
    : ''

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], glowStyles, className)}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              {
                'bg-neon-green': variant === 'success',
                'bg-neon-yellow': variant === 'warning',
                'bg-neon-red': variant === 'danger',
                'bg-neon-cyan': variant === 'info',
                'bg-yellow-400': variant === 'premium',
                'bg-white': variant === 'default',
              }
            )}
          />
          <span
            className={cn('relative inline-flex rounded-full h-2 w-2', {
              'bg-neon-green': variant === 'success',
              'bg-neon-yellow': variant === 'warning',
              'bg-neon-red': variant === 'danger',
              'bg-neon-cyan': variant === 'info',
              'bg-yellow-400': variant === 'premium',
              'bg-white': variant === 'default',
            })}
          />
        </span>
      )}
      {children}
    </span>
  )
}
