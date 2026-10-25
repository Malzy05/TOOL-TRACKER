export default function manifest() {
  return {
    name: 'Tool Tracker Mycopter',
    short_name: 'Tool Tracker',
    description: 'Manage tool and calibration also for loan & return',
    start_url: '/',
    display: 'standalone',
    background_color: 'transparent',
    theme_color: 'transparent',
    icons: [
      {
        src: '/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
