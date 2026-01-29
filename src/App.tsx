import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { RouterProvider } from 'react-router-dom';
import { router } from '@routes/AppRoutes';

function App() {
  return (
    <DreamerUIProvider>
      <RouterProvider router={router} />
    </DreamerUIProvider>
  );
}

export default App;
