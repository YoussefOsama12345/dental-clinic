interface PageHeaderProps {
  title: string
  subtitle: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2f2e2e]">{title}</h1>
        <p className="text-sm text-[#5c5b5b] mt-1.5 max-w-[600px] leading-relaxed">{subtitle}</p>
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  )
}
