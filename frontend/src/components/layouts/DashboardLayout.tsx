import { Outlet } from 'react-router'
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'

function DashboardContent() {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex shrink-0 overflow-hidden bg-white transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[64px]' : 'w-[210px]'
        )}
      >
        <Sidebar />
      </aside>

      {/* ── Main content — floats inside a clean white outer frame ───────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white p-2">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-[#F7F8FA] shadow-sm">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

    </div>
  )
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  )
}
