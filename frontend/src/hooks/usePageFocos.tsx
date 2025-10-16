// src/hooks/usePageFocus.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageFocus(callback) {
  const location = useLocation();

  useEffect(() => {
    callback();
  }, [location.pathname]);
}
