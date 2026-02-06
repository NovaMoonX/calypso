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
      {/* Shield outline - adjusted to be more balanced */}
      <path
        d="M100 30 L160 50 L160 95 C160 130, 130 155, 100 170 C70 155, 40 130, 40 95 L40 50 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* Lock body */}
      <rect
        x="80"
        y="100"
        width="40"
        height="40"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Lock shackle */}
      <path
        d="M85 100 V85 C85 76.716, 91.716 70, 100 70 C108.284 70, 115 76.716, 115 85 V100"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle
        cx="100"
        cy="115"
        r="5"
        fill="currentColor"
      />
      <rect
        x="97"
        y="120"
        width="6"
        height="12"
        fill="currentColor"
      />
      
      {/* Encryption dots pattern */}
      <circle cx="70" cy="65" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="60" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="120" cy="60" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="130" cy="65" r="2" fill="currentColor" opacity="0.4" />
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
      
      {/* User shoulders - properly within circle */}
      <path
        d="M78 95 Q78 86, 100 86 Q122 86, 122 95"
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
      
      {/* Control indicators - checkmarks - better positioned */}
      <g opacity="0.5">
        <path
          d="M50 120 L55 125 L65 115"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M135 120 L140 125 L150 115"
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
        d="M80 100 V70 C80 53.4315, 90.4315 43, 100 43 C109.569 43, 120 53.4315, 120 70 V85"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Lock body - properly sized and centered */}
      <rect
        x="70"
        y="100"
        width="60"
        height="60"
        rx="6"
        stroke="currentColor"
        strokeWidth="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Open keyhole with rays */}
      <circle
        cx="100"
        cy="120"
        r="8"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="96"
        y="128"
        width="8"
        height="16"
        fill="currentColor"
        opacity="0.3"
      />
      
      {/* Freedom rays */}
      <path d="M100 112 L100 92" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <path d="M110 115 L120 102" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <path d="M90 115 L80 102" stroke="currentColor" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      
      {/* Export/download arrows - better positioned */}
      <g transform="translate(50, 125)">
        <path
          d="M0 0 L0 12 M-4 8 L0 12 L4 8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </g>
      
      <g transform="translate(150, 125)">
        <path
          d="M0 0 L0 12 M-4 8 L0 12 L4 8"
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

/**
 * Personal Documents illustration
 * Depicts important documents like ID cards and certificates
 */
export function PersonalDocumentsIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document card background */}
      <rect
        x="50"
        y="60"
        width="100"
        height="80"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      
      {/* ID photo placeholder */}
      <rect
        x="60"
        y="75"
        width="25"
        height="30"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Person silhouette in photo */}
      <circle
        cx="72.5"
        cy="85"
        r="5"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M65 97 Q65 92, 72.5 92 Q80 92, 80 97"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Text lines (info fields) */}
      <rect x="95" y="77" width="45" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="95" y="87" width="35" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <rect x="95" y="97" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      
      {/* Shield with lock (security indicator) */}
      <g transform="translate(60, 115)">
        <path
          d="M10 0 L16 2 L16 8 C16 12, 13 15, 10 17 C7 15, 4 12, 4 8 L4 2 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <rect x="8.5" y="8" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
        <path
          d="M8.5 8 V6.5 C8.5 5.7, 9.2 5, 10 5 C10.8 5, 11.5 5.7, 11.5 6.5 V8"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </g>
      
      {/* Document corner fold */}
      <path
        d="M145 60 L145 70 L155 60 Z"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
}

/**
 * Creative Work illustration
 * Depicts artistic/creative tools and content
 */
export function CreativeWorkIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Canvas/artboard */}
      <rect
        x="55"
        y="55"
        width="90"
        height="90"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      
      {/* Brush stroke - abstract creative mark */}
      <path
        d="M70 80 Q85 95, 100 85 T130 95"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
        fill="none"
      />
      
      {/* Photo/image frame */}
      <rect
        x="70"
        y="105"
        width="30"
        height="25"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      
      {/* Mountain/landscape in frame */}
      <path
        d="M72 126 L80 115 L88 122 L98 112"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <circle cx="76" cy="112" r="2" fill="currentColor" opacity="0.4" />
      
      {/* Text/writing lines */}
      <rect x="110" y="108" width="25" height="2" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="110" y="115" width="20" height="2" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="110" y="122" width="22" height="2" rx="1" fill="currentColor" opacity="0.35" />
      
      {/* Creative spark/star */}
      <path
        d="M135 70 L137 75 L142 77 L137 79 L135 84 L133 79 L128 77 L133 75 Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Family Memories illustration
 * Depicts photos and precious family moments
 */
export function FamilyMemoriesIllustration({ className = 'w-48 h-48' }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Photo frame */}
      <rect
        x="50"
        y="60"
        width="100"
        height="80"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      
      {/* Inner photo area */}
      <rect
        x="58"
        y="68"
        width="84"
        height="64"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      
      {/* Family members (simple silhouettes) */}
      {/* Person 1 - larger (adult) */}
      <g transform="translate(75, 85)">
        <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.3" />
        <path
          d="M-10 18 Q-10 8, 0 8 Q10 8, 10 18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </g>
      
      {/* Person 2 - larger (adult) */}
      <g transform="translate(100, 85)">
        <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.3" />
        <path
          d="M-10 18 Q-10 8, 0 8 Q10 8, 10 18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </g>
      
      {/* Person 3 - smaller (child) */}
      <g transform="translate(125, 92)">
        <circle cx="0" cy="0" r="6" fill="currentColor" opacity="0.3" />
        <path
          d="M-8 14 Q-8 6, 0 6 Q8 6, 8 14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </g>
      
      {/* Heart symbol (love/memories) */}
      <path
        d="M100 110 C100 110, 95 105, 90 105 C85 105, 82 108, 82 112 C82 118, 100 125, 100 125 C100 125, 118 118, 118 112 C118 108, 115 105, 110 105 C105 105, 100 110, 100 110 Z"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}
