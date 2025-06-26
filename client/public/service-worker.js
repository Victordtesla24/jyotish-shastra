// Minimal service worker to prevent 404 errors
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle all fetch events
  return;
});
