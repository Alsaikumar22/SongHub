"use client";

import React, { useState, cloneElement, Children } from "react";
import { useAuth } from "@/context/auth-context";
import AuthModal from "./AuthModal";

/**
 * ProtectedAction — wraps a single child element that requires authentication.
 * Shows the AuthModal when a non-authenticated user triggers the action.
 * On success, performs the original action.
 *
 * Uses React.cloneElement to attach the onClick handler directly to the child,
 * avoiding nested button elements.
 */
export default function ProtectedAction({
  children,
  action,
  disabled = false,
  ...props
}) {
  const { isAuthenticated, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    
    if (!isAuthenticated && !loading) {
      setShowAuth(true);
      return;
    }

    if (action) {
      action(e);
    }
  };

  const child = Children.only(children);

  return (
    <>
      {cloneElement(child, {
        onClick: handleClick,
        ...props,
      })}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            // Execute the pending action after modal closes
            if (action) {
              requestAnimationFrame(() => action());
            }
          }}
          returnAction
        />
      )}
    </>
  );
}
