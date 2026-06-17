import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './sheet'
import { Button } from './button'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onSubmit: (e: React.FormEvent) => void
  submitting?: boolean
  submitLabel?: string
  hasUnsavedChanges?: boolean
  children: React.ReactNode
}

/** Standard right-side create/edit drawer (header + scrollable body + footer). Reused by every form. */
export function FormSheet({ open, onOpenChange, title, description, onSubmit, submitting, submitLabel, hasUnsavedChanges, children }: FormSheetProps) {
  const { t } = useTranslation()
  const [confirmClose, setConfirmClose] = useState(false)

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges && !submitting) {
      setConfirmClose(true)
      return
    }
    onOpenChange(nextOpen)
  }

  const discardChanges = () => {
    setConfirmClose(false)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open || !hasUnsavedChanges) return undefined

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, open])

  return (
    <>
    <Sheet open={open} onOpenChange={requestOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col">
        <form onSubmit={onSubmit} className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-card px-6 py-5">
            <div className="min-w-0">
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription className="mt-0.5">{description}</SheetDescription>}
            </div>
            <button
              type="button"
              onClick={() => requestOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-card px-6 py-5">{children}</div>

          <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-card px-6 py-4">
            <Button type="button" variant="outline" onClick={() => requestOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#04CF9E] text-white hover:bg-[#03b589]">
              {submitting ? t('common.saving') : (submitLabel ?? t('common.save'))}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
    <UnsavedChangesDialog open={confirmClose} onStay={() => setConfirmClose(false)} onDiscard={discardChanges} />
    </>
  )
}
