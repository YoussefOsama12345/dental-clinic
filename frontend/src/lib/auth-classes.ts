/**
 * Shared class utility functions for auth forms.
 * Eliminates duplicate inputCls/submitBtnCls defined in every auth component.
 */
import { cn } from './utils'

/** Standard auth input field class */
export function authInputCls(hasError?: boolean): string {
  return cn(
    'h-14 rounded-[10px] !bg-[#f8faf9] !border-[#e2e8f0]',
    'focus-visible:ring-1 focus-visible:ring-[#04CF9E] focus-visible:border-[#04CF9E]',
    '!text-[#0f172a] text-base placeholder:!text-[#94a3b8]',
    'transition-all duration-200 px-4',
    hasError && '!border-red-500 focus-visible:ring-red-500'
  )
}

/** Standard auth submit button class */
export const AUTH_SUBMIT_BTN =
  'w-full h-14 rounded-[10px] !bg-[#04CF9E] hover:!bg-[#03b589] !text-white font-bold text-base transition-all duration-200 cursor-pointer disabled:opacity-50'

/** Standard auth OAuth outline button class */
export const AUTH_OAUTH_BTN =
  'h-12 rounded-[10px] !border-[#e5e7eb] !bg-white !text-[#334155] font-semibold hover:!bg-[#f8faf9] hover:!border-[#cbd5e1] transition-all cursor-pointer'
