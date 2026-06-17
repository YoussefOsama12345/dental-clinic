import { useEffect } from 'react'
import { useBlocker } from 'react-router'

export function useUnsavedChangesGuard(when: boolean) {
  const blocker = useBlocker(when)

  useEffect(() => {
    if (!when) return undefined

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [when])

  return {
    open: blocker.state === 'blocked',
    stay: () => blocker.reset?.(),
    discard: () => blocker.proceed?.(),
  }
}
