import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home-page.component').then(
        (h) => h.HomePageComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/registre/registre-page.component').then(
        (r) => r.RegistrePageComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(
        (l) => l.LoginPageComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(
        (d) => d.DashboardPageComponent
      ),
    //canActivate: [authGuard]
  },
  {
    path: 'analyses',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
  },
  {
    path: 'ats',
    loadComponent: () =>
      import('./pages/ats/ats-page.component').then(
        (m) => m.AtsPageComponent
      ),
  },
  {
    path: 'plantillas',
    loadComponent: () =>
      import('./pages/plantillas/plantillas-page.component').then(
        (m) => m.PlantillasPageComponent
      ),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion-page.component').then(
        (m) => m.ConfiguracionPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

