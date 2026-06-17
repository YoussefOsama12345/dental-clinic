import { Eye, Pencil, Power, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PersonCell } from '@/components/ui/person-cell'
import { Pill } from '@/components/ui/pill'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { Dentist } from '@/types/api'

const TH = 'px-5 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const TH_ACTIONS = 'w-[148px] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

export function DentistsTable({
  dentists, loading, onView, onEdit, onDelete, selectedIds = [], onToggleSelected, onToggleAll, allVisibleSelected = false,
}: {
  dentists: Dentist[]
  loading: boolean
  onView: (d: Dentist) => void
  onEdit: (d: Dentist) => void
  onDelete: (d: Dentist) => void
  selectedIds?: string[]
  onToggleSelected?: (id: string) => void
  onToggleAll?: () => void
  allVisibleSelected?: boolean
}) {
  const { t } = useTranslation()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="w-12 px-5 py-3"><input type="checkbox" checked={dentists.length > 0 && allVisibleSelected} onChange={onToggleAll} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectAll', 'Select all')} /></th>
          <th className={`${TH} w-[300px]`}>{t('dentists.column.name')}</th>
          <th className={`${TH} hidden md:table-cell`}>{t('dentists.column.phone')}</th>
          <th className={`${TH} hidden lg:table-cell`}>{t('dentists.column.license')}</th>
          <th className={TH}>{t('dentists.column.status')}</th>
          <th className={TH_ACTIONS}>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-5 py-4" />
              <td className="px-5 py-4"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-36" /></div></td>
              <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
              <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
              <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
              <td className="px-5 py-4" />
            </tr>
          ))
        ) : dentists.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-5 py-10">
              <EmptyState icon={Users} title={t('dentists.empty')} description={t('dentists.emptyDesc')} />
            </td>
          </tr>
        ) : (
          dentists.map((d) => (
            <tr
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => onView(d)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onView(d)
                }
              }}
              className="group cursor-pointer transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04CF9E]/40"
            >
              <td className="px-5 py-4">
                <input type="checkbox" checked={selectedIds.includes(d.id)} onChange={(event) => { event.stopPropagation(); onToggleSelected?.(d.id) }} onClick={(event) => event.stopPropagation()} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectRow', 'Select row')} />
              </td>
              <td className="px-5 py-4">
                <button type="button" onClick={(event) => { event.stopPropagation(); onView(d) }} className="text-start transition-opacity hover:opacity-80">
                  <PersonCell name={d.fullName} subtitle={d.specialty || undefined} color="#04CF9E" />
                </button>
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{d.phone || '—'}</td>
              <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">{d.licenseNumber || '—'}</td>
              <td className="px-5 py-4">
                <Pill tone={d.isActive ? 'teal' : 'muted'}>{d.isActive ? t('common.active') : t('common.inactive')}</Pill>
              </td>
                <td className="px-5 py-4 text-center align-middle">
                  <div className="flex w-full items-center justify-center gap-1">
                    <Button type="button" variant="ghost" size="icon" title={t('common.view')} aria-label={t('common.view')} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={(event) => { event.stopPropagation(); onView(d) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title={t('common.edit')} aria-label={t('common.edit')} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={(event) => { event.stopPropagation(); onEdit(d) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title={t('dentists.deactivate')} aria-label={t('dentists.deactivate')} className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(event) => { event.stopPropagation(); onDelete(d) }} disabled={!d.isActive}>
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  )
}
