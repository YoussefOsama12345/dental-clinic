import { useRef, useState } from 'react'
import { Download, Trash2, Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'

interface BulkActionsBarProps {
  selectedCount: number
  totalCount: number
  busy?: boolean
  onClear: () => void
  onBulkDelete: () => void
  onExportSelected: () => void | Promise<void>
  onExportAll: () => void | Promise<void>
  onImport: (file: File) => void | Promise<void>
}

export function BulkActionsBar({
  selectedCount, busy, onClear, onBulkDelete, onExportSelected, onExportAll, onImport,
}: BulkActionsBarProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const submitImport = () => {
    if (!file) return
    onImport(file)
    setFile(null)
    setImportOpen(false)
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="outline" className="rounded-[10px] border-border bg-white shadow-sm hover:bg-muted/60" onClick={() => setImportOpen(true)} disabled={busy}>
          <Upload className="me-2 h-4 w-4" />
          {t('bulk.import', 'Import')}
        </Button>
        <Button type="button" variant="outline" className="rounded-[10px] border-[#04CF9E]/30 bg-[#04CF9E]/10 text-[#028967] shadow-sm hover:bg-[#04CF9E]/15 hover:text-[#02785b]" onClick={onExportAll} disabled={busy}>
          <Download className="me-2 h-4 w-4" />
          {t('bulk.export', 'Export')}
        </Button>
      </div>

      <div
        className={`fixed bottom-5 left-1/2 z-50 flex w-[min(580px,calc(100vw-24px))] -translate-x-1/2 items-center justify-between gap-3 rounded-[18px] border border-border/70 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 ease-out ${
          selectedCount > 0
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[calc(100%+32px)] opacity-0'
        }`}
      >
        <p className="text-sm font-bold text-foreground">{t('bulk.selected', '{{count}} selected', { count: selectedCount })}</p>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" className="rounded-[10px] bg-[#04CF9E] px-4 text-white shadow-sm hover:bg-[#03b589]" onClick={onExportSelected} disabled={busy}>
            <Download className="me-2 h-4 w-4" />
            {t('bulk.export', 'Export')}
          </Button>
          <Button type="button" size="icon" className="h-9 w-9 rounded-[10px] bg-red-500 text-white hover:bg-red-600" onClick={onBulkDelete} disabled={busy} aria-label={t('bulk.deleteSelected', 'Delete')}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onClear} disabled={busy} aria-label={t('bulk.clear', 'Clear selection')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('bulk.importTitle', 'Import CSV data')}</DialogTitle>
            <DialogDescription>{t('bulk.importDesc', 'Upload a CSV file exported from this page or matching the same columns.')}</DialogDescription>
          </DialogHeader>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:bg-muted/50">
            <Upload className="mx-auto mb-3 h-8 w-8 text-[#04CF9E]" />
            <span className="block text-sm font-semibold text-foreground">{file?.name ?? t('bulk.chooseFile', 'Choose CSV file')}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{t('bulk.csvOnly', 'CSV files only')}</span>
          </button>
          <DialogFooter className="border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(false)}
              className="h-11 min-w-28 rounded-[12px] border-border bg-white px-5 font-semibold text-foreground shadow-sm hover:bg-muted/60"
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" className="h-11 min-w-28 rounded-[12px] bg-[#04CF9E] px-5 font-semibold text-white shadow-sm hover:bg-[#03b589]" disabled={!file || busy} onClick={submitImport}>{t('bulk.import', 'Import')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
