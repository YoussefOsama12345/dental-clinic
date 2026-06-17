import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TableCard } from '@/components/ui/table-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Pagination } from '@/components/ui/pagination'
import { BulkActionsBar } from '@/components/ui/bulk-actions-bar'
import { downloadCsv, parseCsv, splitList } from '@/lib/csv'
import { dentistService } from '../services/dentists.service'
import { useDentists, useDeleteDentist } from '../hooks/dentists.hook'
import { DentistsTable } from '../components/DentistsTable'
import type { Dentist } from '@/types/api'

const PAGE_SIZE = 20

export function DentistsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: dentists = [], isLoading } = useDentists({ search })
  const del = useDeleteDentist()

  const [deleting, setDeleting] = useState<Dentist | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(dentists.length / PAGE_SIZE))
    if (page > pages) setPage(pages)
  }, [dentists.length, page])

  const openCreate = () => { navigate('/dentists/new') }
  const openEdit = (d: Dentist) => { navigate(`/dentists/${d.id}/edit`) }
  const toggleSelected = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const toggleAllVisible = () => setSelectedIds((ids) => visibleDentists.every((d) => ids.includes(d.id)) ? ids.filter((id) => !visibleDentists.some((d) => d.id === id)) : [...new Set([...ids, ...visibleDentists.map((d) => d.id)])])
  const selectedDentists = dentists.filter((d) => selectedIds.includes(d.id))
  const toCsv = (rows: Dentist[]) => rows.map((d) => ({ fullName: d.fullName, specialty: d.specialty ?? '', licenseNumber: d.licenseNumber ?? '', phone: d.phone ?? '', email: d.email ?? '', color: d.color ?? '', yearsExperience: d.yearsExperience ?? '', qualifications: d.qualifications.join('|'), bio: d.bio ?? '', workingDays: d.workingDays.join('|'), workStart: d.workStart ?? '', workEnd: d.workEnd ?? '', isActive: String(d.isActive) }))
  const exportSelected = () => downloadCsv('dentists-selected.csv', toCsv(selectedDentists))
  const exportAll = async () => {
    setBulkBusy(true)
    try {
      const rows = await dentistService.list({})
      downloadCsv('dentists.csv', toCsv(rows))
    } catch {
      toast.error(t('bulk.exportFailed', 'Export failed. Please try again.'))
    } finally { setBulkBusy(false) }
  }
  const importCsv = async (file: File) => {
    setBulkBusy(true)
    try {
      const rows = parseCsv(await file.text())
      await Promise.all(rows.map((r) => dentistService.create({ fullName: r.fullName, specialty: r.specialty || null, licenseNumber: r.licenseNumber || null, phone: r.phone || null, email: r.email || null, color: r.color || null, yearsExperience: r.yearsExperience ? Number(r.yearsExperience) : null, qualifications: splitList(r.qualifications), bio: r.bio || null, workingDays: splitList(r.workingDays), workStart: r.workStart || null, workEnd: r.workEnd || null, isActive: r.isActive !== 'false' })))
      await queryClient.invalidateQueries({ queryKey: ['dentists'] })
      toast.success(t('bulk.imported', 'Import completed successfully.'))
    } catch { toast.error(t('bulk.importFailed', 'Import failed. Check your CSV file.')) }
    finally { setBulkBusy(false) }
  }
  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(selectedIds.map((id) => dentistService.remove(id)))
      setSelectedIds([])
      await queryClient.invalidateQueries({ queryKey: ['dentists'] })
      toast.success(t('bulk.deleted', 'Selected records deleted successfully.'))
    } finally { setBulkBusy(false); setBulkDeleteOpen(false) }
  }
  const confirmDelete = async () => {
    if (!deleting) return
    await del.mutateAsync(deleting.id)
    setDeleting(null)
  }
  const visibleDentists = dentists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pages.dentists.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.dentists.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <BulkActionsBar selectedCount={selectedIds.length} totalCount={dentists.length} busy={bulkBusy} onClear={() => setSelectedIds([])} onBulkDelete={() => setBulkDeleteOpen(true)} onExportSelected={exportSelected} onExportAll={exportAll} onImport={importCsv} />
          <Button onClick={openCreate} className="shrink-0 rounded-[10px] bg-[#04CF9E] text-white shadow-sm hover:bg-[#03b589]">
            <Plus className="me-2 h-4 w-4" />
            {t('dentists.add')}
          </Button>
        </div>
      </div>

      <TableCard
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder={t('dentists.search')}
        count={t('dentists.count', { count: dentists.length })}
        footer={<Pagination page={page} pageSize={PAGE_SIZE} total={dentists.length} onPageChange={setPage} />}
      >
        <DentistsTable
          dentists={visibleDentists}
          loading={isLoading}
          onView={(d) => navigate(`/dentists/${d.id}`)}
          onEdit={openEdit}
          onDelete={setDeleting}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAllVisible}
          allVisibleSelected={visibleDentists.length > 0 && visibleDentists.every((d) => selectedIds.includes(d.id))}
        />
      </TableCard>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t('bulk.deleteTitle', 'Delete selected records?')}
        description={t('bulk.deleteDesc', 'This action will apply to {{count}} selected records.', { count: selectedIds.length })}
        confirmLabel={t('bulk.deleteSelected', 'Delete selected')}
        loading={bulkBusy}
        onConfirm={confirmBulkDelete}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('dentists.deleteTitle')}
        description={t('dentists.deleteDesc', { name: deleting?.fullName ?? '' })}
        confirmLabel={t('dentists.deactivate')}
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
