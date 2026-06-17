import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Users, Calendar, Sparkles, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DentAIIcon } from '@/components/ui/dentai-logo'
import { useOnboardingStore } from '../store/onboarding.store'

// Floating particle positions (deterministic, not random)
const particles = [
  { x: '12%', y: '18%', size: 6, delay: 0, color: '#04CF9E' },
  { x: '85%', y: '14%', size: 4, delay: 0.3, color: '#03b589' },
  { x: '8%', y: '72%', size: 5, delay: 0.6, color: '#02a37a' },
  { x: '90%', y: '68%', size: 7, delay: 0.2, color: '#04CF9E' },
  { x: '55%', y: '8%', size: 4, delay: 0.8, color: '#03b589' },
  { x: '22%', y: '88%', size: 5, delay: 0.4, color: '#02a37a' },
  { x: '78%', y: '85%', size: 6, delay: 0.7, color: '#04CF9E' },
  { x: '45%', y: '92%', size: 3, delay: 0.1, color: '#03b589' },
  { x: '3%', y: '42%', size: 4, delay: 0.9, color: '#02a37a' },
  { x: '96%', y: '38%', size: 5, delay: 0.5, color: '#04CF9E' },
  { x: '68%', y: '5%', size: 3, delay: 1.1, color: '#03b589' },
  { x: '32%', y: '6%', size: 6, delay: 0.15, color: '#02a37a' },
]

const featureCards = [
  { icon: Users, key: 'patientRecords', color: 'from-teal-500/20 to-emerald-500/10' },
  { icon: Calendar, key: 'appointments', color: 'from-emerald-500/20 to-teal-500/10' },
  { icon: Sparkles, key: 'aiInsights', color: 'from-teal-500/20 to-emerald-500/10' },
  { icon: Receipt, key: 'billing', color: 'from-emerald-500/20 to-teal-500/10' },
]

export function WelcomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data } = useOnboardingStore()
  const [countdown, setCountdown] = useState(4)
  const firstName = data.fullName?.split(' ')[0] || ''

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050707]">

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(4,207,158,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Logo pulse */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="mb-8 relative"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#04CF9E] to-[#03b589] shadow-[0_0_60px_rgba(4,207,158,0.5)]">
            <DentAIIcon width={48} height={48} />
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-[28px] border-2 border-[#04CF9E]/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-[52px] font-extrabold tracking-[-1.5px] text-white leading-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #04CF9E, #03b589)' }}
            >
              {t('onboarding.welcome.heading', { name: firstName })}
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-4 max-w-[520px] text-[18px] leading-relaxed text-[#9ca3af]"
        >
          {t('onboarding.welcome.subtitle')}
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex items-center gap-3 flex-wrap justify-center"
        >
          {featureCards.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.65 + i * 0.08 }}
                className={`flex items-center gap-2 rounded-full bg-gradient-to-br ${f.color} border border-[rgba(4,207,158,0.2)] px-4 py-2`}
              >
                <Icon className="h-4 w-4 text-[#04CF9E]" />
                <span className="text-[13px] font-semibold text-[#e2e8f0]">
                  {t(`onboarding.welcome.features.${f.key}`)}
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 rounded-[12px] px-10 py-4 text-[18px] font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(4,207,158,0.4)] cursor-pointer"
            style={{ background: 'linear-gradient(to right, #04CF9E, #03b589)' }}
          >
            {t('onboarding.welcome.goToDashboard')}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {/* Auto-redirect countdown */}
          <AnimatePresence mode="wait">
            <motion.p
              key={countdown}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[13px] text-[#6b7280]"
            >
              {t('onboarding.welcome.redirectingIn', { count: countdown })}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom bar progress */}
      <motion.div
        className="absolute bottom-0 left-0 h-1"
        style={{ background: 'linear-gradient(to right, #04CF9E, #03b589)' }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
      />
    </div>
  )
}
