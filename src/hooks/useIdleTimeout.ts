import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimeoutOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  enabled?: boolean;
}

export function useIdleTimeout({ timeout, onIdle, enabled = true }: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Keep onIdle callback reference updated
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];

    // Start the timer
    resetTimer();

    // Reset timer on user activity
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, enabled]);

  return { resetTimer };
}
