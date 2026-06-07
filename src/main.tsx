import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ClerkAvailableProvider } from './lib/clerk-safe';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ClerkAvailableProvider>
          <App />
        </ClerkAvailableProvider>
      </ClerkProvider>
    ) : (
      // No Clerk key — render app without auth (guest mode)
      <App />
    )}
  </StrictMode>
);
