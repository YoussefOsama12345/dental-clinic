import { motion, AnimatePresence } from 'framer-motion'

interface TabTransitionProps {
  children: React.ReactNode
  tabKey: string | number
  className?: string
  active?: boolean
}

const tabVariants = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, scale: 0.992, filter: 'blur(2px)' },
}

export function TabTransition({ children, tabKey, className, active = true }: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {active ? (
        <motion.div
          key={tabKey}
          layout="position"
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
            filter: { duration: 0.2, ease: 'easeOut' },
            layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
          }}
          className={className}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
