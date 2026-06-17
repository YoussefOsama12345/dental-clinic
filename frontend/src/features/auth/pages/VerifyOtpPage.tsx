import { Suspense } from 'react'
import { AuthTransition } from '@/transitions'
import { VerifyOtpForm } from '../components/VerifyOtpForm'

export function VerifyOtpPage() {
  return (
    <AuthTransition>
      <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="h-5 w-5 rounded-full border-2 border-[#04CF9E]/20 border-t-[#04CF9E] animate-spin" /></div>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthTransition>
  )
}
