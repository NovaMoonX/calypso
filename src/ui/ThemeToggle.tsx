import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';
import { Toggle } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

function ThemeToggle() {
	const { toggleTheme, theme } = useTheme();

	return (
		<div className='fixed bottom-4 left-4 z-50 flex items-center gap-2'>
			<Toggle
				checked={theme === 'dark'}
				onCheckedChange={toggleTheme}
				aria-label='Toggle theme'
				className='opacity-30 hover:opacity-60 transition-opacity'
			/>
			<span className={join(
				'font-mono text-xs tracking-wider uppercase',
				'text-foreground/30 hover:text-foreground/60 transition-colors'
			)}>
				{theme === 'dark' ? 'Dark' : 'Light'}
			</span>
		</div>
	);
}

export default ThemeToggle;
