import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';
import { Moon, Sun } from '@moondreamsdev/dreamer-ui/symbols';

function ThemeToggle() {
	const { toggleTheme, theme } = useTheme();
	const Icon = theme === 'dark' ? Sun : Moon;

	return (
		<button
			onClick={toggleTheme}
			className='fixed top-4 left-4 z-50 p-3 rounded-lg backdrop-blur-sm focus:outline-none focus:ring focus:ring-foreground/80 hover:bg-foreground/10 transition-all duration-200 shadow-lg'
			aria-label='Toggle theme'
		>
			<Icon className='size-5 text-foreground' />
		</button>
	);
}

export default ThemeToggle;
