import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Search, Users, Calendar, UserCog, Stethoscope, ArrowRight, LucideIcon, X, Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { usePatients } from '@/features/patients/hooks/patients.hook'
import { useAppointments } from '@/features/appointments/hooks/appointments.hook'
import { useDentists } from '@/features/dentists/hooks/dentists.hook'
import { useRoster } from '@/features/staff/hooks/staff.hook'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  subtitle?: string
  href: string
  icon: LucideIcon
  group: 'quickActions' | 'navigation' | 'patients' | 'appointments' | 'dentists' | 'staff'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: patientsPage } = usePatients({ pageSize: 1000, status: 'all' })
  const { data: appointments = [] } = useAppointments({})
  const { data: dentists = [] } = useDentists({})
  const { data: roster = [] } = useRoster({})
  const patients = patientsPage?.data ?? []

  const formatDateTime = useCallback((value: string) => {
    try {
      return format(new Date(value), 'dd MMM yyyy HH:mm', { locale: i18n.language === 'ar' ? ar : undefined })
    } catch {
      return value
    }
  }, [i18n.language])

  const patientName = useCallback((id: string) => {
    const patient = patients.find((item) => item.id === id)
    return patient ? `${patient.firstName} ${patient.lastName}` : t('common.details')
  }, [patients, t])

  const dentistName = useCallback((id: string) => dentists.find((item) => item.id === id)?.fullName ?? t('common.details'), [dentists, t])

  const allItems = useMemo<CommandItem[]>(() => [
    { id: 'new-patient', label: t('command.quick.newPatient'), href: '/patients/new', icon: Plus, group: 'quickActions' },
    { id: 'new-appointment', label: t('command.quick.newAppointment'), href: '/appointments/new', icon: Plus, group: 'quickActions' },
    { id: 'new-dentist', label: t('command.quick.newDentist'), href: '/dentists/new', icon: Plus, group: 'quickActions' },
    { id: 'new-staff', label: t('command.quick.newStaff'), href: '/staff/new', icon: Plus, group: 'quickActions' },
    { id: 'patients', label: t('nav.patients'), href: '/patients', icon: Users, group: 'navigation' },
    { id: 'appointments', label: t('nav.appointments'), href: '/appointments', icon: Calendar, group: 'navigation' },
    { id: 'dentists', label: t('nav.dentists'), href: '/dentists', icon: Stethoscope, group: 'navigation' },
    { id: 'staff', label: t('nav.staff'), href: '/staff', icon: UserCog, group: 'navigation' },
    ...patients.map((patient) => ({
      id: `patient-${patient.id}`,
      label: `${patient.firstName} ${patient.lastName}`,
      subtitle: [patient.phone, patient.email].filter(Boolean).join(' · '),
      href: `/patients/${patient.id}`,
      icon: Users,
      group: 'patients' as const,
    })),
    ...appointments.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      label: `${patientName(appointment.patientId)} · ${formatDateTime(appointment.startsAt)}`,
      subtitle: [dentistName(appointment.dentistId), appointment.reason, t(`status.appointment.${appointment.status}`)].filter(Boolean).join(' · '),
      href: `/appointments/${appointment.id}/edit`,
      icon: Calendar,
      group: 'appointments' as const,
    })),
    ...dentists.map((dentist) => ({
      id: `dentist-${dentist.id}`,
      label: dentist.fullName,
      subtitle: [dentist.specialty, dentist.phone, dentist.email].filter(Boolean).join(' · '),
      href: `/dentists/${dentist.id}`,
      icon: Stethoscope,
      group: 'dentists' as const,
    })),
    ...roster.filter((member) => member.kind === 'staff').map((member) => ({
      id: `staff-${member.id}`,
      label: member.fullName,
      subtitle: [t(`staff.roleName.${member.role}`, String(member.role)), member.email, member.phone].filter(Boolean).join(' · '),
      href: `/staff/${member.id}`,
      icon: UserCog,
      group: 'staff' as const,
    })),
  ], [t, patients, appointments, dentists, roster, patientName, dentistName, formatDateTime])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const source = term ? allItems : allItems.filter((item) => item.group === 'quickActions' || item.group === 'navigation')
    return source.filter((item) => `${item.label} ${item.subtitle ?? ''}`.toLowerCase().includes(term)).slice(0, 60)
  }, [allItems, query])

  const select = useCallback((item: CommandItem) => {
    navigate(item.href)
    onOpenChange(false)
  }, [navigate, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query])
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[activeIndex]) select(filtered[activeIndex])
        break
    }
  }

  const groups: CommandItem['group'][] = ['quickActions', 'navigation', 'patients', 'appointments', 'dentists', 'staff']

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="command-palette-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          aria-label={t('command.ariaLabel')}
          className={cn(
            'command-palette-content fixed inset-x-0 top-[12%] z-50 mx-auto w-full max-w-2xl',
            'overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl',
          )}
        >
          <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('command.placeholder')}
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground select-none sm:inline-flex">Esc</kbd>}
          </div>

          <div ref={listRef} className="max-h-[460px] overflow-y-auto px-2 py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#04CF9E transparent' }}>
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t('command.noResults')}</p>
            ) : groups.map((group) => {
              const items = filtered.filter((item) => item.group === group)
              if (items.length === 0) return null
              return (
                <CommandGroup key={group} label={t(`command.groups.${group}`)}>
                  {items.map((item) => {
                    const idx = filtered.indexOf(item)
                    return <CommandRow key={item.id} item={item} isActive={activeIndex === idx} index={idx} onSelect={() => select(item)} onHover={() => setActiveIndex(idx)} />
                  })}
                </CommandGroup>
              )
            })}
          </div>

          <div className="flex items-center gap-4 border-t border-border/60 px-5 py-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] select-none">↑↓</kbd>{t('command.navigate')}</span>
            <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] select-none">↵</kbd>{t('command.select')}</span>
            <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] select-none">Esc</kbd>{t('command.close')}</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CommandGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="select-none px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</p>
      {children}
    </div>
  )
}

function CommandRow({ item, isActive, index, onSelect, onHover }: { item: CommandItem; isActive: boolean; index: number; onSelect: () => void; onHover: () => void }) {
  const Icon = item.icon
  return (
    <button
      data-index={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-start text-sm transition-colors duration-100',
        isActive ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)]' : 'text-[#475569] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-current" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        {item.subtitle ? <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span> : null}
      </span>
      {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
    </button>
  )
}
