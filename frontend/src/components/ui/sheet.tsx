import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    asChild
    ref={ref}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm', className)}
    />
  </DialogPrimitive.Overlay>
))
SheetOverlay.displayName = 'SheetOverlay'

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right'
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, side = 'left', children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <AnimatePresence>
      <SheetOverlay />
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          initial={side === 'left' ? { x: '-100%' } : { x: '100%' }}
          animate={{ x: 0 }}
          exit={side === 'left' ? { x: '-100%' } : { x: '100%' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed z-50 h-full bg-sidebar shadow-xl',
            side === 'left' ? 'left-0 top-0' : 'right-0 top-0',
            className,
          )}
        >
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-bold text-foreground', className)} {...props} />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
SheetDescription.displayName = DialogPrimitive.Description.displayName

export { Sheet, SheetTrigger, SheetContent, SheetClose, SheetTitle, SheetDescription }
