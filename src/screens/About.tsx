import { Button } from '@moondreamsdev/dreamer-ui/components';

function About() {
	return (
		<div className='page flex flex-col items-center justify-center'>
			<div className='text-center space-y-6 max-w-2xl px-4'>
				<h1 className='text-5xl md:text-6xl font-bold'>About Us</h1>
				<p className='text-lg md:text-xl text-foreground/80'>
					This is your about page - lazy loaded for better performance!
				</p>
				<div className='pt-4'>
					<Button
						href='/'
						className='inline-block px-6 py-3 bg-accent hover:bg-accent/80 text-white font-medium rounded-lg transition-colors'
					>
						← Back to Home
					</Button>
				</div>
			</div>
		</div>
	);
}

export default About;

