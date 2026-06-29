import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oxzghdxdcbxxbdiojekt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qyJQfwwDAnojyttwBkiIoA_vvbYHSAH';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private supabase: SupabaseClient | null = null;

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  private accessToken = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
        },
      });
      this.restoreSession();
    }
  }

  private async restoreSession(): Promise<void> {
    const { data } = await this.supabase!.auth.getSession();
    if (data.session) {
      this.currentUser.set(data.session.user);
      this.accessToken.set(data.session.access_token);
    }

    this.supabase!.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      this.accessToken.set(session?.access_token ?? null);
    });
  }

  async signUp(email: string, password: string, fullName?: string): Promise<{ error?: string }> {
    const { error } = await this.supabase!.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) return { error: error.message };
    return {};
  }

  async signIn(email: string, password: string): Promise<{ error?: string }> {
    const { error } = await this.supabase!.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    this.router.navigate(['/dashboard']);
    return {};
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : SUPABASE_URL,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
    }
  }

  async signOut(): Promise<void> {
    await this.supabase!.auth.signOut();
    this.currentUser.set(null);
    this.accessToken.set(null);
    this.router.navigate(['/']);
  }

  getSessionToken(): string | null {
    return this.accessToken();
  }
}
