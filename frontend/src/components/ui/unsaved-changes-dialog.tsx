import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'

interface UnsavedChangesDialogProps {
  open: boolean
  onStay: () => void
  onDiscard: () => void
}

export function UnsavedChangesDialog({ open, onStay, onDiscard }: UnsavedChangesDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onStay() }}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[24px] p-0 shadow-2xl">
        <div className="border-b border-border/60 px-6 py-7 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-center text-xl font-bold tracking-tight">
              {t('common.unsavedChangesTitle', 'Discard changes?')}
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-muted-foreground">
              {t('common.unsavedChangesDesc', 'You have unsaved changes. If you leave now, your changes will be lost.')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="bg-card px-6 pb-4 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onStay}
            className="h-11 min-w-28 rounded-[12px] border-border bg-white px-5 font-semibold text-foreground shadow-sm hover:bg-muted/60"
          >
            {t('common.stay', 'Stay')}
          </Button>
          <Button
            type="button"
            onClick={onDiscard}
            className="h-11 min-w-28 rounded-[12px] bg-amber-500 px-5 font-semibold text-white shadow-sm hover:bg-amber-600"
          >
            {t('common.discard', 'Discard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
