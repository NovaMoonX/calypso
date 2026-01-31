import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { ErrorBoundary } from '@moondreamsdev/dreamer-ui/components';
import { RouterProvider } from 'react-router-dom';
import { router } from '@routes/AppRoutes';
import { AuthProvider } from '@contexts/AuthProvider';
import { VaultProvider } from '@contexts/VaultProvider';
import { PasswordsProvider } from '@contexts/PasswordsProvider';

function App() {
  return (
    <ErrorBoundary>
      <DreamerUIProvider theme={{ defaultTheme: 'dark'}}>
        <AuthProvider>
          <VaultProvider>
            <PasswordsProvider>
              <RouterProvider router={router} />
            </PasswordsProvider>
          </VaultProvider>
        </AuthProvider>
      </DreamerUIProvider>
    </ErrorBoundary>
  );
}

export default App;
