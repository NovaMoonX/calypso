import { Panel } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

interface KeyRotationProgressProps {
  totalItems: number;
  processedItems: number;
  percentComplete: number;
  className?: string;
}

export function KeyRotationProgress({
  totalItems,
  processedItems,
  percentComplete,
  className,
}: KeyRotationProgressProps) {
  return (
    <Panel className={join('space-y-4', className)}>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold font-mono'>RE-SECURING VAULT</h3>
          <span className='text-2xl font-bold font-mono'>{percentComplete}%</span>
        </div>
        <p className='text-sm text-foreground/70 font-mono'>
          Your passphrase was changed. We're re-encrypting your data for security.
        </p>
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='h-3 bg-background rounded-full overflow-hidden border border-border'>
          <div
            className='h-full bg-primary transition-all duration-300 ease-out'
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <div className='flex justify-between text-xs text-foreground/60 font-mono'>
          <span>
            {processedItems} / {totalItems} items
          </span>
          <span>
            {totalItems - processedItems} remaining
          </span>
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className='flex items-center justify-center py-4'>
        <div className='relative w-32 h-32'>
          <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
            {/* Background circle */}
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='8'
              className='text-background opacity-30'
            />
            {/* Progress circle */}
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='8'
              strokeLinecap='round'
              className='text-primary transition-all duration-300 ease-out'
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentComplete / 100)}`}
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-2xl font-bold font-mono'>{percentComplete}%</span>
          </div>
        </div>
      </div>

      <div className='border-info/20 bg-info/10 rounded-lg border p-4 text-sm font-mono'>
        <strong className='block mb-2'>ℹ️ Please wait:</strong>
        <ul className='list-inside list-disc space-y-1 opacity-80'>
          <li>This process ensures your vault remains secure</li>
          <li>You can safely close this window - progress will resume automatically</li>
          <li>Don't delete items or sign out until complete</li>
        </ul>
      </div>
    </Panel>
  );
}
