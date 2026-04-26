// Geheimer Admin-Pfad — kommt aus Vercel-Env, nie hartcodiert.
// Lokal: apps/frontend/.env.local → VITE_ADMIN_SLUG=dein-geheimer-pfad
// Vercel: Project Settings → Environment Variables → VITE_ADMIN_SLUG
export const ADMIN = import.meta.env.VITE_ADMIN_SLUG ?? 'admin'
