export const parseJsonArray = (value: string | null | undefined): string[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export const stringifyJsonArray = (value: string[] | null | undefined): string => JSON.stringify(value ?? [])
