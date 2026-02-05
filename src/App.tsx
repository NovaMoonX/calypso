import { AuthProvider } from '@contexts/AuthProvider';
import { VaultProvider } from '@contexts/VaultProvider';
import { ErrorBoundary } from '@moondreamsdev/dreamer-ui/components';
import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { router } from '@routes/AppRoutes';
import { RouterProvider } from 'react-router-dom';
import { TabProvider } from './contexts/TabProvider';

function App() {
  return (
    <ErrorBoundary>
      <DreamerUIProvider theme={{ defaultTheme: 'dark' }}>
        <TabProvider>
          <AuthProvider>
            <VaultProvider>
              <RouterProvider router={router} />
            </VaultProvider>
          </AuthProvider>
        </TabProvider>
      </DreamerUIProvider>
    </ErrorBoundary>
  );
}

export default App;
