import { Link, useNavigate } from 'react-router'
import { Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PersonCell } from '@/components/ui/person-cell'
import { Pill } from '@/components/ui/pill'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { RosterMember } from '@/types/api'

const TH = 'px-5 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const TH_ACTIONS = 'w-[148px] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

export function StaffRosterTable({
  members, loading, onEditMember, onDeleteMember, selectedKeys = [], onToggleSelected, onToggleAll, allVisibleSelected = false,
}: {
  members: RosterMember[]
  loading: boolean
  onEditMember: (m: RosterMember) => void
  onDeleteMember: (m: RosterMember) => void
  selectedKeys?: string[]
  onToggleSelected?: (key: string) => void
  onToggleAll?: () => void
  allVisibleSelected?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="w-12 px-5 py-3"><input type="checkbox" checked={members.length > 0 && allVisibleSelected} onChange={onToggleAll} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectAll', 'Select all')} /></th>
          <th className={`${TH} w-[300px]`}>{t('staff.column.member')}</th>
          <th className={TH}>{t('staff.column.role')}</th>
          <th className={`${TH} hidden md:table-cell`}>{t('staff.column.phone')}</th>
          <th className={TH}>{t('staff.column.status')}</th>
          <th className={TH_ACTIONS}>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-5 py-4" />
              <td className="px-5 py-4"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
              <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
              <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
              <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
              <td className="px-5 py-4" />
            </tr>
          ))
        ) : members.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-5 py-10">
              <EmptyState icon={Users} title={t('staff.empty')} description={t('staff.emptyDesc')} />
            </td>
          </tr>
        ) : (
          members.map((m) => {
            const isDoctor = m.kind === 'dentist'
            return (
              <tr
                key={`${m.kind}-${m.id}`}
                role="button"
                tabIndex={0}
                onClick={() => navigate(isDoctor ? `/dentists/${m.id}` : `/staff/${m.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(isDoctor ? `/dentists/${m.id}` : `/staff/${m.id}`)
                  }
                }}
                className="group cursor-pointer transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04CF9E]/40"
              >
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selectedKeys.includes(`${m.kind}-${m.id}`)} onChange={(event) => { event.stopPropagation(); onToggleSelected?.(`${m.kind}-${m.id}`) }} onClick={(event) => event.stopPropagation()} className="h-4 w-4 rounded border-border accent-[#04CF9E]" aria-label={t('bulk.selectRow', 'Select row')} />
                </td>
                <td className="px-5 py-4">
                  <Link
                    to={isDoctor ? `/dentists/${m.id}` : `/staff/${m.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-block transition-opacity hover:opacity-80"
                  >
                    <PersonCell name={m.fullName} subtitle={m.email || undefined} />
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <Pill tone={isDoctor ? 'teal' : 'muted'} dot={false}>{t(`staff.roleName.${m.role}`, String(m.role))}</Pill>
                </td>
                <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{m.phone || '—'}</td>
                <td className="px-5 py-4">
                  <Pill tone={m.status === 'active' ? 'teal' : 'muted'}>{t(`staff.empStatus.${m.status}`, String(m.status))}</Pill>
                </td>
                <td className="px-5 py-4 text-center align-middle">
                  <div className="flex w-full items-center justify-center gap-1">
                    <Button asChild variant="ghost" size="icon" title={t('common.view')} aria-label={t('common.view')} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                      <Link to={isDoctor ? `/dentists/${m.id}` : `/staff/${m.id}`} onClick={(event) => event.stopPropagation()}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title={t('common.edit')} aria-label={t('common.edit')} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={(event) => { event.stopPropagation(); onEditMember(m) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title={isDoctor ? t('dentists.deactivate') : t('common.delete')} aria-label={isDoctor ? t('dentists.deactivate') : t('common.delete')} className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(event) => { event.stopPropagation(); onDeleteMember(m) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
