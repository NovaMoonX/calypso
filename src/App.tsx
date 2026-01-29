import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { RouterProvider } from 'react-router-dom';
import { router } from '@routes/AppRoutes';
import { AuthProvider } from '@contexts/AuthProvider';
import { VaultProvider } from '@contexts/VaultProvider';

function App() {
  return (
    <DreamerUIProvider>
      <AuthProvider>
        <VaultProvider>
          <RouterProvider router={router} />
        </VaultProvider>
      </AuthProvider>
    </DreamerUIProvider>
  );
}

export default App;
