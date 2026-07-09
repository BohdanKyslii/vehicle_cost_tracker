import { useState } from 'react';

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  return {
    isOpen,
    isSignup,
    openLogin: () => {
      setIsSignup(false);
      setIsOpen(true);
    },
    openSignup: () => {
      setIsSignup(true);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    switchTo: (signup: boolean) => setIsSignup(signup),
  };
}
