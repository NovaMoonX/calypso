/**
 * SVG illustrations for Why Use page
 * Theme-aware illustrations that work in both light and dark modes
 */

interface IllustrationProps {
  className?: string;
}

/**
 * Security & Privacy illustration
 * Depicts a shield with a lock representing zero-knowledge encryption
 */
export function SecurityIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M100 20 L160 40 L160 90 C160 130, 130 160, 100 180 C70 160, 40 130, 40 90 L40 40 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* Lock body */}
      <rect
        x="80"
        y="95"
        width="40"
        height="45"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Lock shackle */}
      <path
        d="M85 95 V80 C85 71.716, 91.716 65, 100 65 C108.284 65, 115 71.716, 115 80 V95"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle
        cx="100"
        cy="112"
        r="5"
        fill="currentColor"
      />
      <rect
        x="97"
        y="117"
        width="6"
        height="12"
        fill="currentColor"
      />
      
      {/* Encryption dots pattern */}
      <circle cx="70" cy="60" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="55" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="120" cy="55" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="130" cy="60" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/**
 * Simplicity illustration
 * Depicts a simple, clean interface with minimal elements
 */
export function SimplicityIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Browser/window frame */}
      <rect
        x="30"
        y="40"
        width="140"
        height="120"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.05"
      />
      
      {/* Window top bar */}
      <rect
        x="30"
        y="40"
        width="140"
        height="20"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Window dots */}
      <circle cx="45" cy="50" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="55" cy="50" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="65" cy="50" r="3" fill="currentColor" opacity="0.6" />
      
      {/* Simple content - text lines */}
      <rect x="45" y="80" width="110" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="45" y="95" width="80" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="45" y="110" width="100" height="4" rx="2" fill="currentColor" opacity="0.3" />
      
      {/* Simple button */}
      <rect
        x="65"
        y="130"
        width="70"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      
      {/* Sparkle effect - simplicity star */}
      <path
        d="M160 120 L163 127 L170 130 L163 133 L160 140 L157 133 L150 130 L157 127 Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Control illustration
 * Depicts user having full control over their data with keys
 */
export function ControlIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* User circle */}
      <circle
        cx="100"
        cy="80"
        r="30"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* User head */}
      <circle
        cx="100"
        cy="75"
        r="12"
        fill="currentColor"
        opacity="0.4"
      />
      
      {/* User shoulders */}
      <path
        d="M75 100 Q75 85, 100 85 Q125 85, 125 100"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Key */}
      <g transform="translate(100, 140)">
        {/* Key bow (handle) */}
        <circle
          cx="0"
          cy="0"
          r="12"
          stroke="currentColor"
          strokeWidth="3"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <circle
          cx="0"
          cy="0"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Key shaft */}
        <rect
          x="10"
          y="-2"
          width="35"
          height="4"
          fill="currentColor"
        />
        
        {/* Key teeth */}
        <rect x="40" y="-6" width="3" height="4" fill="currentColor" />
        <rect x="35" y="-6" width="3" height="6" fill="currentColor" />
        <rect x="45" y="-6" width="3" height="3" fill="currentColor" />
      </g>
      
      {/* Connection line from user to key */}
      <path
        d="M100 110 L100 128"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      
      {/* Control indicators - checkmarks */}
      <g opacity="0.5">
        <path
          d="M50 135 L55 140 L65 130"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M135 135 L140 140 L150 130"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * No Vendor Lock-in illustration
 * Depicts freedom with an open lock
 */
export function NoLockInIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Open lock shackle */}
      <path
        d="M75 90 V60 C75 43.4315, 88.4315 30, 105 30 C121.569 30, 135 43.4315, 135 60 V70"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Lock body */}
      <rect
        x="70"
        y="90"
        width="60"
        height="70"
        rx="6"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Open keyhole with rays */}
      <circle
        cx="100"
        cy="115"
        r="8"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="96"
        y="123"
        width="8"
        height="20"
        fill="currentColor"
        opacity="0.3"
      />
      
      {/* Freedom rays */}
      <path d="M100 105 L100 85" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <path d="M110 108 L120 95" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <path d="M90 108 L80 95" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      
      {/* Export/download arrows */}
      <g transform="translate(35, 125)">
        <path
          d="M10 0 L10 15 M5 10 L10 15 L15 10"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </g>
      
      <g transform="translate(155, 125)">
        <path
          d="M10 0 L10 15 M5 10 L10 15 L15 10"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
