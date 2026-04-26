'use client';
import { useEffect } from 'react';

export function useBeforeUnload(shouldWarn: boolean) {
  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldWarn]);
}
