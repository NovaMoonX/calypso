import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { ErrorBoundary } from '@moondreamsdev/dreamer-ui/components';
import { RouterProvider } from 'react-router-dom';
import { router } from '@routes/AppRoutes';
import { AuthProvider } from '@contexts/AuthProvider';
import { VaultProvider } from '@contexts/VaultProvider';

function App() {
  return (
    <ErrorBoundary>
      <DreamerUIProvider>
        <AuthProvider>
          <VaultProvider>
            <RouterProvider router={router} />
          </VaultProvider>
        </AuthProvider>
      </DreamerUIProvider>
    </ErrorBoundary>
  );
}

export default App;
