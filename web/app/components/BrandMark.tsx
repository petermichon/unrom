/**
 * Compact brand mark: a wildcard in a record. The brackets echo the API/schema
 * framing, the asterisk means "any device, any ROM".
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 13 H13 V51 H22" />
        <path d="M42 13 H51 V51 H42" />
      </g>
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <line x1="32" y1="25" x2="32" y2="39" />
        <line x1="26" y1="28.5" x2="38" y2="35.5" />
        <line x1="26" y1="35.5" x2="38" y2="28.5" />
      </g>
    </svg>
  );
}
