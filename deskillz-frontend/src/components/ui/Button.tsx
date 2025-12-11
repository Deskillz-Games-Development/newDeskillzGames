import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-display font-semibold uppercase tracking-wider
      rounded-lg overflow-hidden
      transition-all duration-300 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gaming-dark
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-neon-cyan to-primary-500
        text-gaming-darker
        hover:shadow-neon-cyan
        focus:ring-neon-cyan
      `,
      secondary: `
        bg-transparent border-2 border-neon-cyan
        text-neon-cyan
        hover:bg-neon-cyan/10 hover:shadow-neon-cyan
        focus:ring-neon-cyan
      `,
      ghost: `
        bg-transparent
        text-white/70 hover:text-neon-cyan hover:bg-white/5
        focus:ring-white/20
      `,
      danger: `
        bg-gradient-to-r from-neon-red to-neon-pink
        text-white
        hover:shadow-neon-pink
        focus:ring-neon-pink
      `,
      success: `
        bg-gradient-to-r from-neon-green to-emerald-500
        text-gaming-darker
        hover:shadow-neon-green
        focus:ring-neon-green
      `,
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        {...props}
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 overflow-hidden">
          <span
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent
            group-hover:animate-shimmer"
          />
        </span>

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            leftIcon
          )}
          {children}
          {rightIcon && !isLoading && rightIcon}
        </span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
