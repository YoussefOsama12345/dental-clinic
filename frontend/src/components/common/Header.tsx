import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  Menu, PanelLeft, Search, LogOut,
  Languages,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '@/hooks/use-sidebar'
import { LANGUAGE_STORAGE_KEY } from '@/i18n'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommandPalette } from '@/components/common/CommandPalette'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Sidebar } from '@/components/common/Sidebar'
import { useAuthStore } from '@/features/auth/store/auth.store'

// ─── Breadcrumb segment map ───────────────────────────────────────────────────

const segmentKeys: Record<string, string> = {
  'patients': 'nav.patients',
  'appointments': 'nav.appointments',
  'calendar': 'nav.calendar',
  'dentists': 'nav.dentists',
  'treatments': 'nav.treatments',
  'prescriptions': 'nav.prescriptions',
  'imaging': 'nav.imaging',
  'invoices': 'nav.invoices',
  'payments': 'nav.payments',
  'insurance': 'nav.insurance',
  'ai-insights': 'nav.analytics',
  'analytics': 'nav.analytics',
  'reports': 'nav.reports',
  'staff': 'nav.staff',
  'inventory': 'nav.inventory',
  'communications': 'nav.communications',
  'charting': 'nav.charting',
  'treatment-plans': 'nav.treatmentPlans',
  'settings': 'nav.settings',
  'profile': 'settings.profile',
  'clinic': 'settings.clinic',
  'security': 'settings.security',
  'notifications': 'settings.notifications',
  'billing': 'settings.billing',
  'general': 'settings.general',
  'plans': 'settings.plans',
  'users': 'settings.users',
  'working-hours': 'settings.workingHours',
}

export function Header() {
  const { t, i18n } = useTranslation()
  const { toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [cmdOpen, setCmdOpen] = React.useState(false)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const initials = (user?.name ?? 'DA')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isArabic = i18n.language === 'ar'

  const segments = pathname === '/' ? ['patients'] : pathname.split('/').filter(Boolean)
  const lastKey = segmentKeys[segments[segments.length - 1] ?? 'patients']
  const pageTitle = lastKey ? t(lastKey) : t('common.details')

  const toggleLanguage = () => {
    const nextLang = isArabic ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-transparent px-5">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden h-8 w-8 inline-flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer">
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar forceExpanded onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Breadcrumb (desktop) */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const href = '/' + segments.slice(0, index + 1).join('/')
            const labelKey = segmentKeys[segment]
            const label = labelKey ? t(labelKey) : t('common.details')
            return (
              <React.Fragment key={href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title (mobile only) */}
      <span className="md:hidden font-semibold text-[#0f172a] text-sm">{pageTitle}</span>

      {/* Search — opens command palette */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <button
          onClick={() => setCmdOpen(true)}
          className="flex w-full max-w-md items-center gap-2.5 h-9 rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0]/60 px-3 text-[13px] text-[#94a3b8] hover:ring-[#04CF9E]/40 hover:bg-white transition-all cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-start">{t('header.search')}</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-[#e2e8f0] bg-white px-1.5 font-mono text-[10px] text-[#94a3b8] select-none">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ms-auto">
        {/* Language switcher */}
        <button
          onClick={toggleLanguage}
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[#94a3b8] hover:text-[#04CF9E] hover:bg-[#04CF9E]/8 transition-colors cursor-pointer text-xs font-semibold"
          title={t(isArabic ? 'header.switchToEnglish' : 'header.switchToArabic')}
        >
          <Languages className="h-3.5 w-3.5" />
          <span>{isArabic ? 'EN' : 'ع'}</span>
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-xl overflow-hidden cursor-pointer outline-none focus:outline-none">
              <Avatar className="h-9 w-9 rounded-xl">
                <AvatarImage src={user?.avatar || ''} alt={user?.name || t('header.myAccount')} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{user?.name ?? t('header.myAccount')}</span>
              {user?.email && (
                <span className="text-[11px] font-normal text-muted-foreground">{user.email}</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-red-500 focus:text-red-500 focus:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5 me-2" />
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  )
}
