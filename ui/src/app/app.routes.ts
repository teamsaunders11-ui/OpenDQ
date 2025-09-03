import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'onboard-db',
    loadChildren: () => import('./pages/onboard-db/onboard-db.routes').then((m) => m.default),
  },
  {
    path: 'assets',
    loadChildren: () => import('./assets/assets.routes').then((m) => m.assetsRoutes),
  },
];
