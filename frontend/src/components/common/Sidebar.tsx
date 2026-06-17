import * as React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import {
  Users, Calendar, UserCog, Stethoscope,
  LogOut, LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { DentAIBrand, DentAIIcon } from '@/components/ui/dentai-logo'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemDef {
  key: string
  href: string
  icon: LucideIcon
}

// ─── Style constants ──────────────────────────────────────────────────────────

const ACTIVE   = 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] font-semibold'
const INACTIVE = 'text-[#94a3b8] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]'
const BASE     = 'group flex h-10 items-center rounded-[10px] text-sm font-medium transition-all duration-200 overflow-hidden cursor-pointer w-full'

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems: NavItemDef[] = [
  { key: 'patients',     icon: Users,       href: '/patients' },
  { key: 'appointments', icon: Calendar,    href: '/appointments' },
  { key: 'dentists',     icon: Stethoscope, href: '/dentists' },
  { key: 'staff',        icon: UserCog,     href: '/staff' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarTooltip({
  label,
  children,
  show,
}: {
  label: string
  children: React.ReactNode
  show: boolean
}) {
  if (!show) return <>{children}</>
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function NavLabel({
  collapsed,
  children,
}: {
  collapsed: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out inline-block',
        collapsed
          ? 'max-w-0 opacity-0 ms-0'
          : 'max-w-[160px] opacity-100 ms-3',
      )}
    >
      {children}
    </span>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  className,
  forceExpanded = false,
  onNavigate,
}: {
  className?: string
  forceExpanded?: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isCollapsed: ctxCollapsed } = useSidebar()

  const isCollapsed = forceExpanded ? false : ctxCollapsed

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const iconClass = (active: boolean) =>
    cn('h-5 w-5 shrink-0 transition-colors duration-200',
      active ? 'text-[#04CF9E]' : 'text-[#94a3b8] group-hover:text-[#475569]')

  return (
    <div
      className={cn(
        'flex h-screen max-h-screen w-full flex-col overflow-hidden bg-white transition-all duration-300 ease-in-out sticky top-0',
        className,
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex h-16 items-center shrink-0 px-4">
        {isCollapsed ? <DentAIIcon width={24} height={24} /> : <DentAIBrand iconSize={24} />}
      </div>

      {/* ── Nav items ────────────────────────────────────────────────────── */}
      <div className="flex-1 py-3 px-3 overflow-y-auto scrollbar-hide min-h-0">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            const label = t(`nav.${item.key}`)
            return (
              <SidebarTooltip key={item.key} label={label} show={isCollapsed}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onNavigate}
                  className={cn(BASE, active ? ACTIVE : INACTIVE)}
                >
                  <span className="flex w-10 shrink-0 items-center justify-center">
                    <Icon className={iconClass(active)} />
                  </span>
                  <NavLabel collapsed={isCollapsed}>{label}</NavLabel>
                </NavLink>
              </SidebarTooltip>
            )
          })}
        </nav>
      </div>

      {/* ── Bottom: Logout ─────────────────────────────────────────────── */}
      <div className="px-3 pb-3">
        <SidebarTooltip label={t('nav.logout')} show={isCollapsed}>
          <button
            onClick={() => {
              onNavigate?.()
              navigate('/login')
            }}
            className={cn(BASE, 'text-red-500 hover:bg-red-500/10 hover:text-red-600')}
          >
            <span className="flex w-10 shrink-0 items-center justify-center">
              <LogOut className="h-5 w-5" />
            </span>
            <NavLabel collapsed={isCollapsed}>{t('nav.logout')}</NavLabel>
          </button>
        </SidebarTooltip>
      </div>
    </div>
  )
}
