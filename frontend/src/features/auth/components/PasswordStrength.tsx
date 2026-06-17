import { motion, AnimatePresence } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation()

  const rules = [
    { key: 'auth.passwordRules.minLength', test: (p: string) => p.length >= 8 },
    { key: 'auth.passwordRules.uppercase', test: (p: string) => /[A-Z]/.test(p) },
    { key: 'auth.passwordRules.number', test: (p: string) => /[0-9]/.test(p) },
    { key: 'auth.passwordRules.special', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]

  if (!password) return null

  const passedCount = rules.filter((r) => r.test(password)).length

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2.5 pt-2"
    >
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= passedCount
                ? passedCount <= 1 ? 'bg-red-500'
                  : passedCount <= 2 ? 'bg-orange-500'
                  : passedCount <= 3 ? 'bg-yellow-500'
                  : 'bg-emerald-500'
                : 'bg-[#e2e8f0]'
            }`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {rules.map((rule, idx) => {
          const passed = rule.test(password)
          return (
            <div key={idx} className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {passed ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                    <Check size={14} className="text-emerald-500" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Circle size={14} className="text-[#94a3b8]" strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className={`text-[13px] font-medium transition-colors ${passed ? 'text-emerald-500' : 'text-[#94a3b8]'}`}>
                {t(rule.key)}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
