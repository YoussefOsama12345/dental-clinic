import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
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
      className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className)}
    />
  </DialogPrimitive.Overlay>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <AnimatePresence>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12, x: '-50%' }}
          animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.96, y: 12, x: '-50%' }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-y-1/2 gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-lg',
            className,
          )}
        >
          {children}
          <DialogPrimitive.Close className="absolute end-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 text-start', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-row items-center justify-between gap-3', className)} {...props} />
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
