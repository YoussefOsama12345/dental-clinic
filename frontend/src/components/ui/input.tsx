import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl bg-[#f8fafc] ring-1 ring-[#e2e8f0] px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-[#04CF9E]/30 focus:bg-white focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
