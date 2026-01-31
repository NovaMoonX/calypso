/**
 * Calypso Logo - Secure, minimalist "C" design
 */

import { join } from '@moondreamsdev/dreamer-ui/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function CalypsoLogo({ className = '', size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle representing security/vault */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* C shape - vault door */}
      <path
        d="M 34 24 A 10 10 0 0 1 24 34 A 10 10 0 0 1 14 24 A 10 10 0 0 1 24 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Lock mechanism dots */}
      <circle cx="24" cy="24" r="1.5" fill="currentColor" />
      <circle cx="20" cy="24" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="28" cy="24" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function CalypsoLogoWithText({ className = '', size = 32 }: LogoProps) {
  return (
    <div className={join('flex items-center gap-3', className)}>
      <CalypsoLogo size={size} />
      <span className="text-xl font-mono tracking-wider">CALYPSO</span>
    </div>
  );
}
