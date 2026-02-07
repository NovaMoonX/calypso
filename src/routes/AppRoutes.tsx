import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import Login from '@screens/Login';
import AuthVerify from '@screens/AuthVerify';
import PassphraseSetup from '@screens/PassphraseSetup';
import RecoveryCodes from '@screens/RecoveryCodes';
import Recovery from '@screens/Recovery';
import ChangePassphrase from '@screens/ChangePassphrase';
import KeyRotationScreen from '@screens/KeyRotationScreen';
import Dashboard from '@screens/Dashboard';
import { ProtectedRoute } from '@components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'auth/verify',
        element: <AuthVerify />,
      },
      {
        path: 'auth/passphrase',
        element: (
          <ProtectedRoute>
            <PassphraseSetup />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth/recovery-codes',
        element: (
          <ProtectedRoute>
            <RecoveryCodes />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth/recovery',
        element: (
          <ProtectedRoute>
            <Recovery />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth/change-passphrase',
        element: (
          <ProtectedRoute requireMasterKey>
            <ChangePassphrase />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth/key-rotation',
        element: (
          <ProtectedRoute>
            <KeyRotationScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireMasterKey>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      // Why Use page (lazy loaded)
      {
        path: 'why-use',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: WhyUse } = await import('@screens/WhyUse');
          return { Component: WhyUse };
        },
      },
      // FAQ page (lazy loaded)
      {
        path: 'faq',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: FAQ } = await import('@screens/FAQ');
          return { Component: FAQ };
        },
      },
    ],
  },
]);
