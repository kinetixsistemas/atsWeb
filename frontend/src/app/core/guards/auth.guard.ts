import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true; // Acceso permitido
    }

    // Si no está logueado, lo mandamos al login o registro
    router.navigate(['/register']);
    return false;
};