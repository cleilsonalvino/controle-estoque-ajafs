// src/hooks/usePageFocus.tsx
import { useEffect, useCallback } from "react";

export function usePageFocus(refetch: () => void) {
  const handleFocus = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [handleFocus]);
}