import { motion, AnimatePresence } from 'framer-motion'

interface ModalTransitionProps {
  isOpen: boolean
  children: React.ReactNode
  onClose?: () => void
}

export function ModalTransition({ isOpen, children, onClose }: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="pointer-events-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
