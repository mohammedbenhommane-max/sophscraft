export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Gem silhouette */}
      <polygon
        points="14,1 26,13 14,37 2,13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Girdle */}
      <line x1="2" y1="13" x2="26" y2="13" stroke="currentColor" strokeWidth="0.8" />
      {/* Pavilion facets */}
      <line x1="7" y1="13" x2="14" y2="37" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
      <line x1="21" y1="13" x2="14" y2="37" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
      {/* Crown facets */}
      <line x1="2" y1="13" x2="14" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
      <line x1="26" y1="13" x2="14" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
    </svg>
  )
}
