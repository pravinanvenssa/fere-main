import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from './core/auth.service';
import { I18nService } from './core/i18n.service';
import { TranslatePipe } from './shared/translate.pipe';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);
  private router = inject(Router);
    authState = { isAuthenticated: false, user: null as User | null };
  user: User | null = null;
  currentLocale: string;
  languageOptions = this.i18nService.getLanguageOptions();
  
  constructor() {
    this.currentLocale = this.i18nService.getCurrentLocale();
  }
  
  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.authState = {
        isAuthenticated: state.isAuthenticated,
        user: state.user
      };
      this.user = state.user;
    });
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  changeLanguage(locale: string): void {
    this.i18nService.setLocale(locale);
  }
  
  hasRole(roleName: string): boolean {
    return this.authService.hasRole(roleName);
  }
  
  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }
}
