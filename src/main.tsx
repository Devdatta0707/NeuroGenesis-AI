import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
