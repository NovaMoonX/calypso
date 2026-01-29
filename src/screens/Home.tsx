import { Button } from '@moondreamsdev/dreamer-ui/components';
import { APP_TITLE, APP_DESCRIPTION } from '@lib/app';

function Home() {
	return (
		<div className='page flex flex-col items-center justify-center'>
			<div className='text-center space-y-6 max-w-2xl px-4'>
				<h1 className='text-5xl md:text-6xl font-bold'>{APP_TITLE}</h1>
				<p className='text-lg md:text-xl text-foreground/80'>{APP_DESCRIPTION}</p>
				<Button href='/about'>Learn More</Button>
			</div>
		</div>
	);
}

export default Home;
