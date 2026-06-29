import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registre-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registre-page.component.html',
  styleUrl: './registre-page.component.css',
})
export class RegistrePageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected error = '';
  protected loading = false;

  protected readonly passwordScore = signal<number>(0);

  protected readonly strengthColor = computed<string>(() => {
    const score = this.passwordScore();
    if (score === 0) return 'bg-outline-variant';
    const colors = ['bg-error', 'bg-tertiary', 'bg-primary', 'bg-secondary'];
    return colors[score - 1] || 'bg-outline-variant';
  });

  protected onPasswordChange(password: string): void {
    if (!password || password.length === 0) {
      this.passwordScore.set(0);
      return;
    }

    let score = 0;
    if (password.length > 3) score++;
    if (password.length > 6) score++;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;

    this.passwordScore.set(score);
  }

  protected async onRegisterSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    const { error } = await this.auth.signUp(this.email, this.password, this.name);
    if (error) {
      this.error = error;
    } else {
      this.router.navigate(['/login']);
    }
    this.loading = false;
  }

  protected async onGoogleLogin(): Promise<void> {
    await this.auth.signInWithGoogle();
  }
}
