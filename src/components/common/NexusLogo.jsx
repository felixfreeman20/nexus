// Original Nexus branding — no Discord assets
export default function NexusLogo({ size = 32, color = '#5865f2' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Nexus"
    >
      {/* Hexagon base */}
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        fill={color}
        opacity="0.15"
      />
      {/* N lettermark */}
      <path
        d="M15 34V14L24 28V14M24 28L33 14V34"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
