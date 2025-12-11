import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Trophy, 
  Gamepad2, 
  Bell, 
  AlertCircle,
  Zap,
  CheckCircle
} from 'lucide-react'
import { useNotifications } from '@/hooks/useRealtime'
import { NotificationData } from '@/lib/socket'
import { cn } from '@/lib/utils'
import { create } from 'zustand'

// =============================================================================
// TOAST STORE
// =============================================================================

interface ToastState {
  toasts: Array<NotificationData & { visible: boolean }>
  addToast: (notification: NotificationData) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (notification) => {
    set((state) => ({
      toasts: [{ ...notification, visible: true }, ...state.toasts].slice(0, 5),
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === notification.id ? { ...t, visible: false } : t
        ),
      }))
    }, 5000)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  
  clearAll: () => {
    set({ toasts: [] })
  },
}))

// =============================================================================
// NOTIFICATION ICON
// =============================================================================

function getNotificationIcon(type: NotificationData['type']) {
  switch (type) {
    case 'tournament_start':
      return { icon: Gamepad2, color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' }
    case 'tournament_end':
      return { icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/20' }
    case 'prize_won':
      return { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/20' }
    case 'match_found':
      return { icon: Zap, color: 'text-neon-purple', bg: 'bg-neon-purple/20' }
    case 'system':
      return { icon: AlertCircle, color: 'text-white', bg: 'bg-white/20' }
    default:
      return { icon: Bell, color: 'text-neon-cyan', bg: 'bg-neon-cyan/20' }
  }
}

// =============================================================================
// TOAST ITEM
// =============================================================================

interface ToastItemProps {
  notification: NotificationData & { visible: boolean }
  onClose: () => void
}

function ToastItem({ notification, onClose }: ToastItemProps) {
  const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-full max-w-sm bg-gaming-dark border border-gaming-border rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', bg)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-white/60 text-sm line-clamp-2">
              {notification.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gaming-light text-white/40 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className={cn('h-1', bg.replace('/20', ''))}
      />
    </motion.div>
  )
}

// =============================================================================
// NOTIFICATION TOAST CONTAINER
// =============================================================================

export function NotificationToasts() {
  const { toasts, addToast, removeToast } = useToastStore()
  
  // Listen for new notifications
  useNotifications({
    onNotification: (notification) => {
      addToast(notification)
    },
  })
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts
          .filter((t) => t.visible)
          .map((toast) => (
            <ToastItem
              key={toast.id}
              notification={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// MANUAL TOAST TRIGGER (for testing)
// =============================================================================

export function showNotificationToast(notification: Omit<NotificationData, 'id' | 'createdAt'>) {
  const { addToast } = useToastStore.getState()
  addToast({
    ...notification,
    id: Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  })
}

// =============================================================================
// NOTIFICATION BELL (Header)
// =============================================================================

interface NotificationBellProps {
  onClick?: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gaming-light text-white/70 hover:text-white transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-red text-white text-xs font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}