import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sankalp',
    short_name: 'Sankalp',
    description: 'Sankalp is management system',
    lang: 'en',
    start_url: '/task',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#eef2f7',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}