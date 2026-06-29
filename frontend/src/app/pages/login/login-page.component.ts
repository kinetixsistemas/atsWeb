import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);

  protected email = '';
  protected password = '';
  protected error = '';
  protected loading = false;

  async onLoginSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    const { error } = await this.auth.signIn(this.email, this.password);
    if (error) {
      this.error = error;
    }
    this.loading = false;
  }

  protected async onGoogleLogin(): Promise<void> {
    await this.auth.signInWithGoogle();
  }
}
