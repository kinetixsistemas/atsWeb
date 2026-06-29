import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';


interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})


export class SideNavComponent {
  private readonly router = inject(Router);
  protected readonly navItems = signal<NavItem[]>([
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'analytics', label: 'ATS', route: '/ats' },
    { icon: 'description', label: 'Plantillas', route: '/plantillas' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
  ]);

  protected readonly userName = signal('Alex Rivera');
  protected readonly userPlan = signal('Premium Account');
  protected readonly userAvatar = signal(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5FOMbGydn57WAc6-tZgRcJsbgwV5jkMM8jbkaVZPk9RTFziuB51r4yy83cEdI_aEryBI_Fx8dqaW4Fblk6oPx6JC-qhPHz7hBBUVwOUuWma0V-_Jc6tiBOcXx3l-zYWYMON0QPi_oT_snmT4wRMilgvfxXSoTNiZ9fPqdiYCDgq90GwSilY1AOKZWBXVJX40YiaFH6fTN17JcwIbhd86BgZ6a26-R5OZLuUW-sH3wlcAil8h0ujf5LudB-5RXJpRCfw48OscOnA8'
  );

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }
}

