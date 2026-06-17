import { Outlet } from 'react-router'
import { OnboardingSidebar } from './OnboardingSidebar'

export function OnboardingLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="flex w-[240px] shrink-0">
        <OnboardingSidebar />
      </aside>

      {/* ── Main content card ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden p-2 ps-0">
        <div className="flex flex-col flex-1 overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
          <Outlet />
        </div>
      </div>

    </div>
  )
}
