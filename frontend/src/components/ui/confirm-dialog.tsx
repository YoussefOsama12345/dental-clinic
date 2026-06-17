import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  loading?: boolean
  destructive?: boolean
}

/** Reusable confirm dialog for destructive actions (delete, deactivate). */
export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, onConfirm, loading, destructive = true,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[24px] p-0 shadow-2xl">
        <div className="border-b border-border/60 px-6 py-7 text-center">
          <AlertTriangle className={cn('mx-auto mb-4 h-12 w-12', destructive ? 'text-red-500' : 'text-[#04CF9E]')} />
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-center text-xl font-bold tracking-tight">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-muted-foreground">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
        </div>

        <DialogFooter className="bg-card px-6 pb-4 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-11 min-w-28 rounded-[12px] border-border bg-white px-5 font-semibold text-foreground shadow-sm hover:bg-muted/60"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              'h-11 min-w-28 rounded-[12px] px-5 font-semibold text-white shadow-sm',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#04CF9E] hover:bg-[#03b589]',
            )}
          >
            {loading ? t('common.loading', 'Loading...') : confirmLabel ?? t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
