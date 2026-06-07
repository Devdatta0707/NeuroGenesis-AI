/**
 * Safe Clerk wrappers — work with OR without a ClerkProvider.
 * When no ClerkProvider is present (e.g. VITE_CLERK_PUBLISHABLE_KEY not set),
 * all auth components render their "signed out" / guest fallback.
 */
import React, { createContext, useContext, type ReactNode } from 'react';
import {
  useUser as useClerkUser,
  SignInButton as ClerkSignInButton,
  SignOutButton as ClerkSignOutButton,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
} from '@clerk/clerk-react';

// Context that tells children whether a ClerkProvider is present
const ClerkAvailableCtx = createContext(false);
export const ClerkAvailableProvider = ({ children }: { children: ReactNode }) => (
  <ClerkAvailableCtx.Provider value={true}>{children}</ClerkAvailableCtx.Provider>
);
const useClerkAvailable = () => useContext(ClerkAvailableCtx);

// ── Safe useUser ──────────────────────────────────────────────────────────────
export function useUser() {
  const available = useClerkAvailable();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (available) return useClerkUser();
  return { isLoaded: true, isSignedIn: false, user: null };
}

// ── SignedIn — renders children only when authenticated ───────────────────────
export const SignedIn = ({ children }: { children: ReactNode }) => {
  const available = useClerkAvailable();
  if (!available) return null;
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
};

// ── SignedOut — renders children when NOT authenticated ───────────────────────
export const SignedOut = ({ children }: { children: ReactNode }) => {
  const available = useClerkAvailable();
  if (!available) return <>{children}</>;
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
};

// ── SignInButton ──────────────────────────────────────────────────────────────
export const SignInButton = ({
  children,
  mode,
}: {
  children: ReactNode;
  mode?: 'modal' | 'redirect';
}) => {
  const available = useClerkAvailable();
  if (!available) return <>{children}</>;
  return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
};

// ── SignOutButton ─────────────────────────────────────────────────────────────
export const SignOutButton = ({ children }: { children: ReactNode }) => {
  const available = useClerkAvailable();
  if (!available) return <>{children}</>;
  return <ClerkSignOutButton>{children}</ClerkSignOutButton>;
};
