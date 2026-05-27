import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Contracts } from './pages/Contracts';
import { Creditors } from './pages/Creditors';
import { Goals } from './pages/Goals';
import { Pivot } from './pages/Pivot';
import { Archive } from './pages/Archive';
import { VisionBoard } from './pages/VisionBoard';
import { Settings } from './pages/Settings';
import { Docs } from './pages/Docs';

const rootRoute = createRootRoute({
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});

const dashboardRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/',               component: Dashboard });
const transactionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/transaktionen',  component: Transactions });
const analyticsRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/jahresanalyse',  component: Analytics });
const contractsRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/vertraege',       component: Contracts });
const creditorsRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/kreditoren',      component: Creditors });
const goalsRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/sparziele',       component: Goals });
const pivotRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/pivot',           component: Pivot });
const archiveRoute      = createRoute({ getParentRoute: () => rootRoute, path: '/archiv',          component: Archive });
const visionBoardRoute  = createRoute({ getParentRoute: () => rootRoute, path: '/visionboard',     component: VisionBoard });
const settingsRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/einstellungen',   component: Settings });
const docsRoute         = createRoute({ getParentRoute: () => rootRoute, path: '/docs',            component: Docs });

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  transactionsRoute,
  analyticsRoute,
  contractsRoute,
  creditorsRoute,
  goalsRoute,
  pivotRoute,
  archiveRoute,
  visionBoardRoute,
  settingsRoute,
  docsRoute,
]);
