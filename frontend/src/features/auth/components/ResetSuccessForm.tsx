import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const REDIRECT_SECONDS = 3

export function ResetSuccessForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (seconds <= 0) {
      navigate('/login')
      return
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds, navigate])

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
      >
        <div className="w-20 h-20 rounded-full bg-[#04CF9E]/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-[#04CF9E]" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3 max-w-sm"
      >
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">{t('auth.passwordUpdated')}</h1>
        <p className="text-[#64748b] text-base">
          {t('auth.passwordUpdatedSubtitle')}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-sm text-[#94a3b8]"
      >
        {t('auth.redirectingIn', { seconds })}
      </motion.p>
    </div>
  )
}
