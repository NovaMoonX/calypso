import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import Login from '@screens/Login';
import AuthVerify from '@screens/AuthVerify';
import PassphraseSetup from '@screens/PassphraseSetup';
import RecoveryCodes from '@screens/RecoveryCodes';
import Dashboard from '@screens/Dashboard';
import Passwords from '@screens/Passwords';
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
        path: 'dashboard',
        element: (
          <ProtectedRoute requireMasterKey>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'passwords',
        element: (
          <ProtectedRoute requireMasterKey>
            <Passwords />
          </ProtectedRoute>
        ),
      },
      // About page (lazy loaded)
      {
        path: 'about',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: About } = await import('@screens/About');
          return { Component: About };
        },
      },
    ],
  },
]);
