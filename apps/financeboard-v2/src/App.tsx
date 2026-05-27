import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree';
import { useTheme } from './hooks/useTheme';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppInner() {
  useTheme();
  return <RouterProvider router={router} />;
}

export function App() {
  return <AppInner />;
}
