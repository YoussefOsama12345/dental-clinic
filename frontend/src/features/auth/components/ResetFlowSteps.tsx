import { Check, Mail, ShieldCheck, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const stepDefs = [
  { key: 'email', tKey: 'auth.emailStep', icon: Mail },
  { key: 'verify', tKey: 'auth.verifyStep', icon: ShieldCheck },
  { key: 'newPassword', tKey: 'auth.passwordStep', icon: KeyRound },
] as const

interface ResetFlowStepsProps {
  currentStep: 1 | 2 | 3
}

export function ResetFlowSteps({ currentStep }: ResetFlowStepsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-10">
      {stepDefs.map((step, index) => {
        const Icon = step.icon
        const stepNum = index + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted ? 'bg-[#04CF9E] shadow-md shadow-[#04CF9E]/20'
                  : isActive ? 'bg-[#04CF9E]/10 border-2 border-[#04CF9E]'
                  : 'bg-[#f1f5f9] border-2 border-[#e2e8f0]'
              }`}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#04CF9E]' : 'text-[#94a3b8]'}`} strokeWidth={2} />
                )}
              </div>
              <span className={`text-xs font-semibold transition-colors ${isActive || isCompleted ? 'text-[#04CF9E]' : 'text-[#94a3b8]'}`}>
                {t(step.tKey)}
              </span>
            </div>
            {index < stepDefs.length - 1 && (
              <div className="flex-1 mx-3 mb-6">
                <div
                  className={`h-0.5 w-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-[#04CF9E]' : 'bg-[#e2e8f0]'}`}
                  style={!isCompleted ? {
                    backgroundImage: `repeating-linear-gradient(90deg, ${isActive ? '#04CF9E' : '#e2e8f0'} 0px, ${isActive ? '#04CF9E' : '#e2e8f0'} 4px, transparent 4px, transparent 8px)`,
                    backgroundColor: 'transparent',
                  } : undefined}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
