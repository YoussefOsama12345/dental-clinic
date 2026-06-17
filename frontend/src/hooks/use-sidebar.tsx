import * as React from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem('dentai-sidebar-collapsed')
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'boolean') setIsCollapsed(parsed)
      } catch {
        // ignore
      }
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('dentai-sidebar-collapsed', JSON.stringify(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}
