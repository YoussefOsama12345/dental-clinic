import { NavLink, useLocation } from 'react-router'
import {
  User, Building2, Stethoscope, Clock, CreditCard,
  LayoutDashboard,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { DentAIBrand } from '@/components/ui/dentai-logo'

const navSteps = [
  { path: '/onboarding/identity', key: 'identity', icon: User, step: 1 },
  { path: '/onboarding/setup', key: 'clinicSetup', icon: Building2, step: 2 },
  { path: '/onboarding/specialty', key: 'specialty', icon: Stethoscope, step: 3 },
  { path: '/onboarding/working-hours', key: 'workingHours', icon: Clock, step: 4 },
  { path: '/onboarding/plans', key: 'plans', icon: CreditCard, step: 5 },
  { path: '/onboarding/welcome', key: 'dashboard', icon: LayoutDashboard, step: 6 },
]

function useCurrentStep(pathname: string) {
  const idx = navSteps.findIndex((s) => s.path === pathname)
  return idx >= 0 ? idx + 1 : 1
}

export function OnboardingSidebar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const currentStep = useCurrentStep(pathname)

  return (
    <aside className="flex h-full w-full flex-col px-3 py-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 pb-8 pt-4">
        <DentAIBrand />
      </div>

      {/* Nav steps */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navSteps.map((step) => {
          const isActive = pathname === step.path
          const isCompleted = step.step < currentStep
          const Icon = step.icon

          return (
            <NavLink
              key={step.path}
              to={step.path}
              className={cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] font-semibold'
                  : isCompleted
                    ? 'text-[#64748b] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]'
                    : 'text-[#94a3b8] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]'
              )}
            >
              {/* Step indicator / icon */}
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#04CF9E]/15">
                    <span className="block h-2 w-2 rounded-full bg-[#04CF9E]" />
                  </span>
                ) : isActive ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#04CF9E]/20">
                    <span className="block h-2 w-2 rounded-full bg-[#04CF9E]" />
                  </span>
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
              </span>

              {t(`onboarding.sidebar.${step.key}`)}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
