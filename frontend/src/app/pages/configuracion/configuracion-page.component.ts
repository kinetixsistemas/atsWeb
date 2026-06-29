import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { SubscriptionPlan } from '../../core/interfaces/ats.interface';

type SettingsTab = 'perfil' | 'plan' | 'pago' | 'suscripcion';

@Component({
  selector: 'configuracion-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent],
  templateUrl: './configuracion-page.component.html',
  styleUrl: './configuracion-page.component.css',
})
export class ConfiguracionPageComponent {
  protected readonly activeTab = signal<SettingsTab>('perfil');

  protected readonly profileData = signal({
    fullName: 'Alex Rivera',
    email: 'alex.rivera@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Full-Stack Engineer',
    bio: 'Full-Stack Engineer with 8+ years of experience building scalable web applications.',
    linkedin: 'linkedin.com/in/alexrivera',
    portfolio: 'alexrivera.dev',
  });

  protected readonly currentPlan = signal('premium');
  protected readonly paymentMethod = signal<{
    type: string;
    last4: string;
    expiry: string;
    brand: string;
  } | null>({
    type: 'card',
    last4: '4242',
    expiry: '12/27',
    brand: 'Visa',
  });

  protected readonly subscriptionActive = signal(true);
  protected readonly subscriptionRenewal = signal('2026-07-28');
  protected readonly cancelConfirmed = signal(false);

  protected readonly plans = signal<SubscriptionPlan[]>([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        '3 análisis por mes',
        'Plantillas básicas',
        'Soporte por email',
      ],
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Análisis ilimitados',
        'Todas las plantillas ATS',
        'Extracción de datos avanzada',
        'Soporte prioritario 24/7',
        'Reportes detallados',
      ],
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Todo lo de Pro',
        'API access',
        'Equipos multi-usuario',
        'SSO',
        'Soporte dedicado',
        'Análisis personalizados',
      ],
      highlighted: false,
    },
  ]);

  protected readonly tabs = signal<{ id: SettingsTab; label: string; icon: string }[]>([
    { id: 'perfil', label: 'Perfil', icon: 'person' },
    { id: 'plan', label: 'Plan y Facturación', icon: 'credit_card' },
    { id: 'pago', label: 'Método de Pago', icon: 'account_balance_wallet' },
    { id: 'suscripcion', label: 'Suscripción', icon: 'manage_accounts' },
  ]);

  protected setActiveTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  protected onUpdateProfile(): void {
    alert('Perfil actualizado correctamente.');
  }

  protected onSelectPlan(planId: string): void {
    this.currentPlan.set(planId);
    alert(`Plan "${planId}" seleccionado. Redirigiendo al proceso de pago...`);
  }

  protected onRemovePaymentMethod(): void {
    this.paymentMethod.set(null);
  }

  protected onAddPaymentMethod(): void {
    alert('Redirigiendo al formulario de agregar método de pago...');
  }

  protected onCancelSubscription(): void {
    this.cancelConfirmed.set(true);
  }

  protected onConfirmCancellation(): void {
    this.subscriptionActive.set(false);
    this.cancelConfirmed.set(false);
    alert('Suscripción cancelada. Tendrás acceso hasta el final del período actual.');
  }

  protected onReactivateSubscription(): void {
    this.subscriptionActive.set(true);
    alert('Suscripción reactivada correctamente.');
  }

  protected onDownloadInvoice(index: number): void {
    alert(`Descargando factura #INV-2026-${String(index + 1).padStart(4, '0')}...`);
  }

  protected readonly invoices = signal([
    { id: 'INV-2026-0001', date: 'Jun 1, 2026', amount: 19.99, status: 'paid' },
    { id: 'INV-2026-0002', date: 'May 1, 2026', amount: 19.99, status: 'paid' },
    { id: 'INV-2026-0003', date: 'Apr 1, 2026', amount: 19.99, status: 'paid' },
  ]);
}
