import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableCard } from '@/components/ui/table-card'
import { BulkActionsBar } from '@/components/ui/bulk-actions-bar'
import { downloadCsv, parseCsv } from '@/lib/csv'
import { appointmentService } from '../services/appointments.service'
import { useAppointments, useDeleteAppointment } from '../hooks/appointments.hook'
import { usePatients } from '@/features/patients/hooks/patients.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import { AppointmentsTable } from '../components/AppointmentsTable'
import type { Appointment } from '@/types/api'

const PAGE_SIZE = 20
const STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: appointments = [] } = useAppointments({})
  const { data: patientsPage } = usePatients({ pageSize: 1000, status: 'all' })
  const { data: dentists = [] } = useDentists({})
  const del = useDeleteAppointment()
  const patients = patientsPage?.data ?? []
  const activeDentists = useMemo(() => dentists.filter((d) => d.isActive), [dentists])

  const [search, setSearch] = useState('')
  const [dentistFilter, setDentistFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Appointment | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  const patientName = (patientId: string) => {
    const patient = patients.find((item) => item.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : t('common.details')
  }
  const dentistName = (dentistId: string) => dentists.find((item) => item.id === dentistId)?.fullName ?? t('common.details')

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments.filter((appointment) => {
      if (dentistFilter !== 'all' && appointment.dentistId !== dentistFilter) return false
      if (statusFilter !== 'all' && appointment.status !== statusFilter) return false
      if (!term) return true
      const haystack = [
        patientName(appointment.patientId),
        dentistName(appointment.dentistId),
        appointment.reason,
        appointment.status,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [appointments, dentistFilter, statusFilter, search, patients, dentists])

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
    if (page > pages) setPage(pages)
  }, [filteredAppointments.length, page])

  const openCreate = () => { navigate('/appointments/new') }
  const openView = (appt: Appointment) => { navigate(`/appointments/${appt.id}`) }
  const openEdit = (appt: Appointment) => { navigate(`/appointments/${appt.id}/edit`) }
  const openDelete = (appt: Appointment) => { setDeleting(appt) }
  const toggleSelected = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const toggleAllVisible = () => setSelectedIds((ids) => visibleAppointments.every((a) => ids.includes(a.id)) ? ids.filter((id) => !visibleAppointments.some((a) => a.id === id)) : [...new Set([...ids, ...visibleAppointments.map((a) => a.id)])])
  const selectedAppointments = filteredAppointments.filter((a) => selectedIds.includes(a.id))
  const toCsv = (rows: Appointment[]) => rows.map((a) => ({ patientId: a.patientId, patientName: patientName(a.patientId), dentistId: a.dentistId, dentistName: dentistName(a.dentistId), startsAt: a.startsAt, endsAt: a.endsAt, status: a.status, type: a.type ?? '', room: a.room ?? '', reason: a.reason ?? '', notes: a.notes ?? '', cancellationReason: a.cancellationReason ?? '', outcome: a.outcome ?? '', fee: a.fee ?? '' }))
  const exportSelected = () => downloadCsv('appointments-selected.csv', toCsv(selectedAppointments))
  const exportAll = async () => {
    setBulkBusy(true)
    try {
      const rows = await appointmentService.list({})
      downloadCsv('appointments.csv', toCsv(rows))
    } catch {
      toast.error(t('bulk.exportFailed', 'Export failed. Please try again.'))
    } finally { setBulkBusy(false) }
  }
  const importCsv = async (file: File) => {
    setBulkBusy(true)
    try {
      const rows = parseCsv(await file.text())
      await Promise.all(rows.map((r) => appointmentService.create({ patientId: r.patientId, dentistId: r.dentistId, startsAt: r.startsAt, endsAt: r.endsAt, status: (r.status || 'scheduled') as Appointment['status'], type: (r.type || null) as Appointment['type'], room: r.room || null, reason: r.reason || null, notes: r.notes || null, cancellationReason: r.cancellationReason || null, outcome: (r.outcome || null) as Appointment['outcome'], fee: r.fee || null })))
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success(t('bulk.imported', 'Import completed successfully.'))
    } catch { toast.error(t('bulk.importFailed', 'Import failed. Check your CSV file.')) }
    finally { setBulkBusy(false) }
  }
  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    try {
      await Promise.all(selectedIds.map((id) => appointmentService.remove(id)))
      setSelectedIds([])
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success(t('bulk.deleted', 'Selected records deleted successfully.'))
    } finally { setBulkBusy(false); setBulkDeleteOpen(false) }
  }
  const confirmDelete = async () => {
    if (!deleting) return
    await del.mutateAsync(deleting.id)
    setDeleting(null)
  }
  const visibleAppointments = filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pages.appointments.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.appointments.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <BulkActionsBar selectedCount={selectedIds.length} totalCount={filteredAppointments.length} busy={bulkBusy} onClear={() => setSelectedIds([])} onBulkDelete={() => setBulkDeleteOpen(true)} onExportSelected={exportSelected} onExportAll={exportAll} onImport={importCsv} />
          <Button onClick={openCreate} className="shrink-0 rounded-[10px] bg-[#04CF9E] text-white shadow-sm hover:bg-[#03b589]">
            <Plus className="me-2 h-4 w-4" />
            {t('appointments.add')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={dentistFilter} onValueChange={(value) => { setDentistFilter(value); setPage(1) }}>
          <SelectTrigger className="h-10 w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('appointments.allDentists')}</SelectItem>
            {activeDentists.map((d) => <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as typeof statusFilter); setPage(1) }}>
          <SelectTrigger className="h-10 w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? t('appointments.allStatuses') : t(`status.appointment.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TableCard
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder={t('appointments.search')}
        count={t('appointments.count', { count: filteredAppointments.length })}
        footer={<Pagination page={page} pageSize={PAGE_SIZE} total={filteredAppointments.length} onPageChange={setPage} />}
      >
        <AppointmentsTable
          appointments={visibleAppointments}
          patients={patients}
          dentists={dentists}
          onView={openView}
          onEdit={openEdit}
          onDelete={openDelete}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
          onToggleAll={toggleAllVisible}
          allVisibleSelected={visibleAppointments.length > 0 && visibleAppointments.every((a) => selectedIds.includes(a.id))}
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
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('appointments.deleteTitle')}
        description={t('appointments.deleteDesc', {
          patient: deleting ? patientName(deleting.patientId) : '',
          dentist: deleting ? dentistName(deleting.dentistId) : '',
        })}
        confirmLabel={t('appointments.delete')}
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
