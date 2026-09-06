import { useState, useEffect, useCallback, useRef } from 'react';
import { ServerVersionInfo } from '../types';

export function useAutoUpdate() {
  const [serverInfo, setServerInfo] = useState<ServerVersionInfo | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const initialBuildIdRef = useRef<string | null>(null);

  const checkVersion = useCallback(async (manual = false) => {
    try {
      if (manual) setIsChecking(true);
      // Ensure no browser or proxy caching for the version check
      const res = await fetch(`/api/version?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!res.ok) return;
      const data: ServerVersionInfo = await res.json();
      setServerInfo(data);

      if (!initialBuildIdRef.current) {
        // Store the build ID active when the client session first initialized
        initialBuildIdRef.current = data.buildId;
      } else if (initialBuildIdRef.current !== data.buildId) {
        // A new build or server update was deployed!
        setHasUpdate(true);
        setDismissed(false);
      }
    } catch (err) {
      console.warn('[AutoUpdate] Failed to query /api/version:', err);
    } finally {
      if (manual) {
        setTimeout(() => setIsChecking(false), 500);
      }
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkVersion();

    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      checkVersion();
    }, 60000);

    // Also check when tab becomes visible (user returns to window or unlocks device)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    const handleFocus = () => {
      checkVersion();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkVersion]);

  const applyUpdate = useCallback(() => {
    // Cache-busting reload
    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    serverInfo,
    hasUpdate: hasUpdate && !dismissed,
    isChecking,
    checkForUpdates: () => checkVersion(true),
    applyUpdate,
    dismissUpdate,
  };
}
