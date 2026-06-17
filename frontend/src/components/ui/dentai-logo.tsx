/**
 * dentAI brand logo — tooth SVG icon with teal gradient + wordmark.
 * Follows the same structure as rattab-logo.tsx in the rattab geo tool.
 */

interface DentAIIconProps {
  width?: number
  height?: number
  className?: string
}

interface DentAIBrandProps {
  className?: string
  iconSize?: number
}

/** Stylised tooth icon with a teal gradient. */
export function DentAIIcon({ width = 32, height = 32, className }: DentAIIconProps) {
  // Static ID suffix keeps gradient references unique even when multiple
  // instances of the icon appear on the same page.
  const gradId = 'dentai-tooth-grad'

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#04CF9E" />
          <stop offset="100%" stopColor="#03b589" />
        </linearGradient>
      </defs>
      <path
        d="M8 4C8 4 4 6 4 12C4 16 5 18 6 20C7 22 7 24 8 26C9 28 10 29 12 28C13 27 13 24 14 22C14.5 20.5 15 20 16 20C17 20 17.5 20.5 18 22C19 24 19 27 20 28C22 29 23 28 24 26C25 24 25 22 26 20C27 18 28 16 28 12C28 6 24 4 24 4C22 3 20 4 18 4.5C17 4.8 16.5 5 16 5C15.5 5 15 4.8 14 4.5C12 4 10 3 8 4Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  )
}

/** Full brand mark: tooth icon + "dentAI" wordmark in a flex row. */
export function DentAIBrand({ className, iconSize = 28 }: DentAIBrandProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <DentAIIcon width={iconSize} height={iconSize} />
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-white">dent</span>
        <span style={{ color: '#04CF9E' }}>AI</span>
      </span>
    </div>
  )
}
