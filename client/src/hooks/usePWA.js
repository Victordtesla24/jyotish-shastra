import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Comprehensive PWA Hook for Jyotish Shastra
 * Manages service worker, install prompts, updates, and offline functionality
 */
export const usePWA = () => {
  // State management
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for event handlers
  const deferredPromptRef = useRef(null);
  const updateAvailableRef = useRef(false);

  // Network status monitoring
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[PWA] Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[PWA] Gone offline');
    };

    // Enhanced network information
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        setNetworkInfo({
          effectiveType: connection?.effectiveType,
          downlink: connection?.downlink,
          rtt: connection?.rtt,
          saveData: connection?.saveData
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  const registerServiceWorker = useCallback(async () => {
    try {
      console.log('[PWA] Registering service worker...');

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setSwRegistration(registration);
      console.log('[PWA] Service worker registered successfully');

      // Handle updates
      registration.addEventListener('updatefound', () => {
        console.log('[PWA] Update found');
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Update available');
              setHasUpdate(true);
              updateAvailableRef.current = true;
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Check for existing update
      if (registration.waiting) {
        setHasUpdate(true);
        updateAvailableRef.current = true;
      }

      // Check if app is already installed
      checkInstallStatus();

    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [checkInstallStatus, handleServiceWorkerMessage]);

  // Service Worker registration and management
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      setIsLoading(false);
      console.warn('[PWA] Service Workers not supported');
    }
  }, [registerServiceWorker]);

  // Handle messages from service worker
  const handleServiceWorkerMessage = useCallback((event) => {
    const { type, data } = event.data;

    switch (type) {
      case 'SYNC_SUCCESS':
        console.log('[PWA] Background sync completed:', data);
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('syncSuccess', { detail: data }));
        break;

      case 'CACHE_UPDATED':
        console.log('[PWA] Cache updated');
        break;

      case 'OFFLINE_FALLBACK':
        console.log('[PWA] Serving offline fallback');
        break;

      default:
        console.log('[PWA] Unknown message from SW:', type, data);
    }
  }, []);

  // Install prompt handling
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setCanInstall(false);
      setIsInstallable(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check if app is installed
  const checkInstallStatus = useCallback(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Also check for install prompt availability
    if (!isStandalone && !deferredPromptRef.current) {
      // Prompt might be available later
      setIsInstallable(false);
    }
  }, []);

  // Install app function
  const installApp = useCallback(async () => {
    if (!deferredPromptRef.current) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      console.log('[PWA] Showing install prompt');
      const prompt = deferredPromptRef.current;
      deferredPromptRef.current = null;

      const result = await prompt.prompt();
      console.log('[PWA] Install prompt result:', result.outcome);

      if (result.outcome === 'accepted') {
        setCanInstall(false);
        setIsInstallable(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      setError(error.message);
      return false;
    }
  }, []);

  // Update app function
  const updateApp = useCallback(async () => {
    if (!swRegistration || !swRegistration.waiting) {
      console.warn('[PWA] No update available');
      return false;
    }

    try {
      setIsUpdating(true);
      console.log('[PWA] Applying update...');

      // Tell the waiting service worker to skip waiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Wait for the new service worker to take control
      await new Promise((resolve) => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      });

      setHasUpdate(false);
      updateAvailableRef.current = false;

      // Reload the page to use the new service worker
      window.location.reload();

      return true;
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      setError(error.message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [swRegistration]);

  const storePendingData = useCallback(async (storeName, data) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('jyotish-shastra-sync', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([`pending-${storeName}`], 'readwrite');
        const store = transaction.objectStore(`pending-${storeName}`);

        const addRequest = store.add({
          payload: data,
          timestamp: Date.now()
        });

        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(`pending-${storeName}`)) {
          db.createObjectStore(`pending-${storeName}`, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };
    });
  }, []);

  const syncBirthData = useCallback(async (data) => {
    if (!swRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('[PWA] Background sync not supported');
      return false;
    }

    try {
      // Store data for background sync
      await storePendingData('birth-data', data);

      // Register background sync
      await swRegistration.sync.register('birth-data-sync');
      console.log('[PWA] Birth data queued for background sync');

      return true;
    } catch (error) {
      console.error('[PWA] Failed to queue birth data for sync:', error);
      return false;
    }
  }, [swRegistration, storePendingData]);

  const syncAnalysisRequest = useCallback(async (data) => {
    if (!swRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('[PWA] Background sync not supported');
      return false;
    }

    try {
      await storePendingData('analysis-request', data);
      await swRegistration.sync.register('analysis-request-sync');
      console.log('[PWA] Analysis request queued for background sync');

      return true;
    } catch (error) {
      console.error('[PWA] Failed to queue analysis request for sync:', error);
      return false;
    }
  }, [swRegistration, storePendingData]);

  // Push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (!swRegistration || !('PushManager' in window)) {
      console.warn('[PWA] Push notifications not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.warn('[PWA] Notification permission denied');
        return null;
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      console.log('[PWA] Push subscription created');
      return subscription;
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push notifications:', error);
      setError(error.message);
      return null;
    }
  }, [swRegistration]);

  // Cache management
  const clearCache = useCallback(async () => {
    if (!swRegistration) {
      console.warn('[PWA] Service worker not available');
      return false;
    }

    try {
      swRegistration.active.postMessage({ type: 'CLEANUP_CACHES' });
      console.log('[PWA] Cache cleanup requested');
      return true;
    } catch (error) {
      console.error('[PWA] Cache cleanup failed:', error);
      return false;
    }
  }, [swRegistration]);

  const preloadUrls = useCallback(async (urls) => {
    if (!swRegistration) {
      console.warn('[PWA] Service worker not available');
      return false;
    }

    try {
      swRegistration.active.postMessage({
        type: 'CACHE_URLS',
        urls: urls
      });
      console.log('[PWA] URLs queued for caching:', urls);
      return true;
    } catch (error) {
      console.error('[PWA] Failed to preload URLs:', error);
      return false;
    }
  }, [swRegistration]);

  // Utility functions
  const getConnectionQuality = useCallback(() => {
    if (!networkInfo) return 'unknown';

    const { effectiveType, downlink, rtt } = networkInfo;

    if (effectiveType === '4g' && downlink > 1.5 && rtt < 150) return 'excellent';
    if (effectiveType === '4g' || (downlink > 0.7 && rtt < 300)) return 'good';
    if (effectiveType === '3g' || (downlink > 0.3 && rtt < 500)) return 'fair';
    return 'poor';
  }, [networkInfo]);

  const isSlowConnection = useCallback(() => {
    return getConnectionQuality() === 'poor' || networkInfo?.saveData;
  }, [getConnectionQuality, networkInfo]);


  // Return hook interface
  return {
    // Status
    isOnline,
    isInstallable,
    isInstalled,
    hasUpdate,
    isUpdating,
    canInstall,
    isLoading,
    error,
    networkInfo,

    // Functions
    installApp,
    updateApp,
    syncBirthData,
    syncAnalysisRequest,
    subscribeToPushNotifications,
    clearCache,
    preloadUrls,

    // Utilities
    getConnectionQuality,
    isSlowConnection,

    // Advanced
    swRegistration,

    // Clear error
    clearError: () => setError(null)
  };
};

export default usePWA;
