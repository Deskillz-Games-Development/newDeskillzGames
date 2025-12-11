import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import AIAssistantModal from './AIAssistantModal';

interface AIAssistantButtonProps {
  className?: string;
}

const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show welcome tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('ai-tooltip-seen');
    if (!hasSeenTooltip) {
      setTimeout(() => setShowTooltip(true), 2000);
      setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('ai-tooltip-seen', 'true');
      }, 8000);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    setShowTooltip(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Welcome Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-3 w-64 p-3 bg-gray-800 rounded-lg shadow-lg border border-cyan-500/30"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">
                    Hi! I'm your AI assistant
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Need help with tournaments, wallets, or game integration? I'm here 24/7!
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-gray-800 border-r border-b border-cyan-500/30" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={isOpen ? handleClose : handleOpen}
          className={`
            relative w-14 h-14 rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300
            ${isOpen 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification Badge */}
          {hasNewMessage && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900"
            />
          )}

          {/* Glow Effect */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-lg opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <AIAssistantModal
            isOpen={isOpen}
            onClose={handleClose}
            onNewMessage={() => setHasNewMessage(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantButton;
