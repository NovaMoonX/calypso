import { Link } from 'react-router-dom';
import { join } from '@moondreamsdev/dreamer-ui/utils';

interface PageNavigationProps {
  currentPage: 'why-use' | 'faq' | 'login';
}

export function PageNavigation({ currentPage }: PageNavigationProps) {
  return (
    <div className='fixed top-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-40 flex gap-3 sm:gap-4'>
      <Link
        to='/why-use'
        className={join(
          'font-mono text-xs tracking-wider uppercase',
          currentPage === 'why-use'
            ? 'text-foreground underline decoration-foreground/60'
            : 'text-foreground/60 hover:text-foreground transition-colors underline decoration-foreground/20 hover:decoration-foreground/60'
        )}
      >
        Why Use?
      </Link>
      <Link
        to='/faq'
        className={join(
          'font-mono text-xs tracking-wider uppercase',
          currentPage === 'faq'
            ? 'text-foreground underline decoration-foreground/60'
            : 'text-foreground/60 hover:text-foreground transition-colors underline decoration-foreground/20 hover:decoration-foreground/60'
        )}
      >
        FAQ
      </Link>
    </div>
  );
}
