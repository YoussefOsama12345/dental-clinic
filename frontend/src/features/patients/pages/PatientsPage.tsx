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
import { patientService } from '../services/patients.service'
import { usePatients, useDeletePatient } from '../hooks/patients.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import { PatientsTable } from '../components/PatientsTable'
import type { Patient } from '@/types/api'

const PAGE_SIZE = 20
const STATUS_FILTERS = ['all', 'active', 'inactive', 'archived'] as const

export function PatientsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = usePatients({
    search,
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { data: dentists = [] } = useDentists({})
  const del = useDeletePatient()

  const [deleting, setDeleting] = useState<Patient | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  const patients = data?.data ?? []
  const total = data?.total ?? 0

  // Clamp the page when the result set shrinks (e.g. last row of the last
  // page was archived) so the user is never stranded on an empty page.
  useEffect(() => {
    if (!data) return
    const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    if (page > pages) setPage(pages)
  }, [data, page])

  const openCreate = () => { navigate('/patients/new') }
  const openEdit = (p: Patient) => { navigate(`/patients/${p.id}/edit`) }
  const toggleSelected = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const toggleAllVisible = () => setSelectedIds((ids) => patients.every((p) => ids.includes(p.id)) ? ids.filter((id) => !patients.some((p) => p.id === id)) : [...new Set([...ids, ...patients.map((p) => p.id)])])
  const selectedPatients = patients.filter((p) => selectedIds.includes(p.id))
  const toCsv = (rows: Patient[]) => rows.map((p) => ({ firstName: p.firstName, lastName: p.lastName, gender: p.gender, dateOfBirth: p.dateOfBirth ?? '', phone: p.phone ?? '', email: p.email ?? '', address: p.address ?? '', bloodType: p.bloodType ?? '', allergies: p.allergies.join('|'), chronicConditions: p.chronicConditions.join('|'), medications: p.medications.join('|'), smoker: String(p.smoker), medicalNotes: p.medicalNotes ?? '', emergencyContactName: p.emergencyContactName ?? '', emergencyContactPhone: p.emergencyContactPhone ?? '', primaryDentistId: p.primaryDentistId ?? '', status: p.status }))
  const exportSelected = () => downloadCsv('patients-selected.csv', toCsv(selectedPatients))
  const exportAll = async () => {
    setBulkBusy(true)
    try {
      const pageSize = 1000
      const firstPage = await patientService.list({ page: 1, pageSize })
      const rows = [...firstPage.data]
      const pages = Math.ceil(firstPage.total / pageSize)
      for (let nextPage = 2; nextPage <= pages; nextPage += 1) {
        const result = await patientService.list({ page: nextPage, pageSize })
        rows.push(...result.data)
      }
      downloadCsv('patients.csv', toCsv(rows))
    } catch {
      toast.error(t('bulk.exportFailed', 'Export failed. Please try again.'))
    } finally { setBulkBusy(false) }
  }
  const importCsv = async (file: File) => {
    setBulkBusy(true)
    try {
      const rows = parseCsv(await file.text())
      await Promise.all(rows.map((r) => patientService.create({ firstName: r.firstName, lastName: r.lastName, gender: (r.gender || 'unspecified') as Patient['gender'], dateOfBirth: r.dateOfBirth || null, phone: r.phone || null, email: r.email || null, address: r.address || null, bloodType: (r.bloodType || null) as Patient['bloodType'], allergies: splitList(r.allergies), chronicConditions: splitList(r.chronicConditions), medications: splitList(r.medications), smoker: r.smoker === 'true', medicalNotes: r.medicalNotes || null, emergencyContactName: r.emergencyContactName || null, emergencyContactPhone: r.emergencyContactPhone || null, primaryDentistId: r.primaryDentistId || null, status: (r.status || 'active') as Patient['status'] })))
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success(t('bulk.imported', 'Import completed successfully.'))
    } catch {
      toast.error(t('bulk.importFailed', 'Import failed. Check your CSV file.'))
    } finally { setBulkBusy(false) }
  }
  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(selectedIds.map((id) => patientService.remove(id)))
      setSelectedIds([])
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success(t('bulk.deleted', 'Selected records deleted successfully.'))
    } finally { setBulkBusy(false); setBulkDeleteOpen(false) }
  }
  const confirmDelete = async () => {
    if (!deleting) return
    await del.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pages.patients.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.patients.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <BulkActionsBar selectedCount={selectedIds.length} totalCount={total} busy={bulkBusy} onClear={() => setSelectedIds([])} onBulkDelete={() => setBulkDeleteOpen(true)} onExportSelected={exportSelected} onExportAll={exportAll} onImport={importCsv} />
          <Button onClick={openCreate} className="shrink-0 rounded-[10px] bg-[#04CF9E] text-white shadow-sm hover:bg-[#03b589]">
            <Plus className="me-2 h-4 w-4" />
            {t('patients.add')}
          </Button>
        </div>
      </div>

      <TableCard
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('patients.search')}
        count={t('patients.count', { count: total })}
        footer={<Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
      >
        <PatientsTable
          patients={patients}
          dentists={dentists}
          loading={isLoading}
          onView={(p) => navigate(`/patients/${p.id}`)}
          onEdit={openEdit}
          onDelete={setDeleting}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAllVisible}
          allVisibleSelected={patients.length > 0 && patients.every((p) => selectedIds.includes(p.id))}
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
        title={t('patients.deleteTitle')}
        description={t('patients.deleteDesc', { name: deleting ? `${deleting.firstName} ${deleting.lastName}` : '' })}
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
