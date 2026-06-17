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
import { downloadCsv, parseCsv } from '@/lib/csv'
import { staffService } from '../services/staff.service'
import { useRoster, useDeleteStaff } from '../hooks/staff.hook'
import { useDeleteDentist } from '@/features/dentists/hooks/dentists.hook'
import { StaffRosterTable } from '../components/StaffRosterTable'
import type { RosterMember } from '@/types/api'

const ROLE_FILTERS = ['all', 'Doctor', 'Reception', 'Nurse'] as const
const PAGE_SIZE = 20

export function StaffPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [role] = useState<(typeof ROLE_FILTERS)[number]>('all')
  const [page, setPage] = useState(1)
  const { data: roster = [], isLoading } = useRoster({ search, role: role === 'all' ? undefined : role })
  const deleteStaff = useDeleteStaff()
  const deleteDentist = useDeleteDentist()

  const [deleting, setDeleting] = useState<RosterMember | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  const openCreate = () => { navigate('/staff/new') }
  const openEdit = (m: RosterMember) => {
    if (m.kind === 'dentist') {
      navigate(`/dentists/${m.id}/edit`)
      return
    }
    navigate(`/staff/${m.id}/edit`)
  }
  const confirmDelete = async () => {
    if (!deleting) return
    if (deleting.kind === 'dentist') await deleteDentist.mutateAsync(deleting.id)
    else await deleteStaff.mutateAsync(deleting.id)
    setDeleting(null)
  }
  const keyOf = (m: RosterMember) => `${m.kind}-${m.id}`
  const toggleSelected = (key: string) => setSelectedKeys((keys) => keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key])
  const toggleAllVisible = () => setSelectedKeys((keys) => visibleRoster.every((m) => keys.includes(keyOf(m))) ? keys.filter((key) => !visibleRoster.some((m) => keyOf(m) === key)) : [...new Set([...keys, ...visibleRoster.map(keyOf)])])
  const selectedMembers = roster.filter((m) => selectedKeys.includes(keyOf(m)))
  const toCsv = (rows: RosterMember[]) => rows.map((m) => ({ kind: m.kind, fullName: m.fullName, role: String(m.role), phone: m.phone ?? '', email: m.email ?? '', status: String(m.status), workingDays: 'workingDays' in m ? (m.workingDays ?? []).join('|') : '', workStart: 'workStart' in m ? (m.workStart ?? '') : '', workEnd: 'workEnd' in m ? (m.workEnd ?? '') : '' }))
  const exportSelected = () => downloadCsv('staff-selected.csv', toCsv(selectedMembers))
  const exportAll = async () => {
    setBulkBusy(true)
    try {
      const rows = await staffService.roster({})
      downloadCsv('staff-roster.csv', toCsv(rows))
    } catch {
      toast.error(t('bulk.exportFailed', 'Export failed. Please try again.'))
    } finally { setBulkBusy(false) }
  }
  const importCsv = async (file: File) => {
    setBulkBusy(true)
    try {
      const rows = parseCsv(await file.text())
      await Promise.all(rows.filter((r) => r.kind !== 'dentist').map((r) => staffService.create({ fullName: r.fullName, role: (r.role || 'other') as any, phone: r.phone || null, email: r.email || null, status: (r.status || 'active') as any, workingDays: r.workingDays ? r.workingDays.split('|').map((item) => item.trim()).filter(Boolean) : [], workStart: r.workStart || null, workEnd: r.workEnd || null })))
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
      toast.success(t('bulk.imported', 'Import completed successfully.'))
    } catch { toast.error(t('bulk.importFailed', 'Import failed. Check your CSV file.')) }
    finally { setBulkBusy(false) }
  }
  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(selectedMembers.map((m) => m.kind === 'dentist' ? deleteDentist.mutateAsync(m.id) : staffService.remove(m.id)))
      setSelectedKeys([])
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
      await queryClient.invalidateQueries({ queryKey: ['dentists'] })
      toast.success(t('bulk.deleted', 'Selected records deleted successfully.'))
    } finally { setBulkBusy(false); setBulkDeleteOpen(false) }
  }

  const deleteLoading = deleting?.kind === 'dentist' ? deleteDentist.isPending : deleteStaff.isPending
  const deleteTitle = deleting?.kind === 'dentist' ? t('dentists.deleteTitle') : t('staff.deleteTitle')
  const deleteDescription = deleting?.kind === 'dentist'
    ? t('dentists.deleteDesc', { name: deleting?.fullName ?? '' })
    : t('staff.deleteDesc', { name: deleting?.fullName ?? '' })
  const confirmLabel = deleting?.kind === 'dentist' ? t('dentists.deactivate') : t('common.delete')

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(roster.length / PAGE_SIZE))
    if (page > pages) setPage(pages)
  }, [page, roster.length])

  const visibleRoster = roster.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pages.staff.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.staff.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <BulkActionsBar selectedCount={selectedKeys.length} totalCount={roster.length} busy={bulkBusy} onClear={() => setSelectedKeys([])} onBulkDelete={() => setBulkDeleteOpen(true)} onExportSelected={exportSelected} onExportAll={exportAll} onImport={importCsv} />
          <Button onClick={openCreate} className="shrink-0 rounded-[10px] bg-[#04CF9E] text-white shadow-sm hover:bg-[#03b589]">
            <Plus className="me-2 h-4 w-4" />
            {t('staff.add')}
          </Button>
        </div>
      </div>

      <TableCard
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder={t('staff.search')}
        count={t('staff.count', { count: roster.length })}
        footer={<Pagination page={page} pageSize={PAGE_SIZE} total={roster.length} onPageChange={setPage} />}
      >
        <StaffRosterTable
          members={visibleRoster}
          loading={isLoading}
          onEditMember={openEdit}
          onDeleteMember={setDeleting}
          selectedKeys={selectedKeys}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAllVisible}
          allVisibleSelected={visibleRoster.length > 0 && visibleRoster.every((m) => selectedKeys.includes(keyOf(m)))}
        />
      </TableCard>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t('bulk.deleteTitle', 'Delete selected records?')}
        description={t('bulk.deleteDesc', 'This action will apply to {{count}} selected records.', { count: selectedKeys.length })}
        confirmLabel={t('bulk.deleteSelected', 'Delete selected')}
        loading={bulkBusy}
        onConfirm={confirmBulkDelete}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel={confirmLabel}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
