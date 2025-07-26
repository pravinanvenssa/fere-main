import { Component, inject, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    TranslatePipe
  ],template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="login-header">
          <h1 class="login-title">{{ 'auth.login.title' | translate }}</h1>
          <p class="login-subtitle">{{ 'auth.login.subtitle' | translate }}</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">          <div class="form-field">
            <mat-form-field class="full-width">
              <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                {{ 'auth.validation.email.required' | translate }}
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                {{ 'auth.validation.email.invalid' | translate }}
              </mat-error>
            </mat-form-field>
          </div>
          
          <div class="form-field">
            <mat-form-field class="full-width">
              <mat-label>{{ 'auth.login.password' | translate }}</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                {{ 'auth.validation.password.required' | translate }}
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                {{ 'auth.validation.password.minLength' | translate }}
              </mat-error>
            </mat-form-field>
          </div>
          
          <div class="error-message" *ngIf="authState.error">
            <mat-icon>error</mat-icon>
            {{ authState.error }}
          </div>
            <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="login-button full-width"
            [disabled]="loginForm.invalid || authState.isLoading">
            <div *ngIf="authState.isLoading" style="display: flex; align-items: center; gap: 8px;">
              <mat-spinner diameter="20" color="accent"></mat-spinner>
              <span>{{ 'auth.login.loading' | translate }}</span>
            </div>
            <div *ngIf="!authState.isLoading" style="display: flex; align-items: center; gap: 8px;">
              <mat-icon>login</mat-icon>
              <span>{{ 'auth.login.submit' | translate }}</span>
            </div>
          </button>
        </form>
        
        <div class="register-link">
          <p>{{ 'auth.login.noAccount' | translate }} 
            <a routerLink="/register">{{ 'auth.login.signUp' | translate }}</a>
          </p>
        </div>
          <div class="language-selector">
          <mat-form-field class="language-field">
            <mat-label>{{ 'nav.language' | translate }}</mat-label>
            <mat-select 
              [value]="currentLocale" 
              (selectionChange)="changeLanguage($event.value)">
              <mat-option *ngFor="let lang of languageOptions" [value]="lang.code">
                {{ lang.flag }} {{ lang.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>
    </div>
  `,  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #ffffff;
      padding: 20px;
    }
    
    .login-card {
      max-width: 420px;
      width: 100%;
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .login-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }
    
    .login-subtitle {
      color: #666;
      font-size: 16px;
      font-weight: 400;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-field {
      position: relative;
    }
    
    .full-width {
      width: 100%;
    }
      .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      height: 48px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      margin-top: 8px !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      white-space: nowrap !important;
    }
    
    .login-button:hover:not([disabled]) {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
    }
    
    .login-button:disabled {
      opacity: 0.6 !important;
      transform: none !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2) !important;
    }
    
    .login-button mat-icon {
      margin-right: 8px !important;
    }
    
    .error-message {
      color: #e53e3e;
      font-size: 14px;
      margin-top: 8px;
      text-align: center;
      padding: 12px;
      background: rgba(229, 62, 62, 0.1);
      border-radius: 8px;
      border-left: 4px solid #e53e3e;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .register-link {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .register-link a:hover {
      color: #764ba2;
      text-decoration: underline;
    }
    
    .language-selector {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }    .language-field {
      width: 150px;
    }

    // Angular Material v20 - Fill appearance form field styling
    ::ng-deep .mat-mdc-form-field {
      width: 100% !important;
      font-family: inherit !important;
      margin-bottom: 4px !important;
    }

    // Style the form field container for fill appearance
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f5f5f5 !important;
      border-radius: 8px 8px 0 0 !important;
      padding: 0 !important;
      border: none !important;
      border-bottom: 1px solid #ddd !important;
      transition: all 0.2s ease !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      background-color: #f0f0f0 !important;
      border-bottom: 2px solid #667eea !important;
    }

    ::ng-deep .mat-mdc-form-field:hover:not(.mat-focused) .mat-mdc-text-field-wrapper {
      background-color: #f0f0f0 !important;
      border-bottom: 2px solid #999 !important;
    }    // Form field flex container
    ::ng-deep .mat-mdc-form-field-flex {
      padding: 20px 16px 8px 16px !important;
      align-items: center !important;
      position: relative !important;
      min-height: 56px !important;
    }

    // Add padding to the top of form fields to make room for floating labels
    ::ng-deep .mat-mdc-form-field {
      padding-top: 8px !important;
      margin-top: 8px !important;
    }// Input container
    ::ng-deep .mat-mdc-form-field-infix {
      padding: 8px 0 !important;
      border: none !important;
      min-height: 20px !important;
      position: relative !important;
      padding-right: 48px !important; // Make space for suffix icons
    }

    // Ensure proper spacing when no suffix icon
    ::ng-deep .mat-mdc-form-field:not(.mat-form-field-has-icon-suffix) .mat-mdc-form-field-infix {
      padding-right: 0 !important;
    }    // Input element
    ::ng-deep .mat-mdc-input-element {
      color: #333 !important;
      font-size: 16px !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      height: 20px !important;
      line-height: 20px !important;
      z-index: 2 !important;
      position: relative !important;
    }

    // Ensure input text is always visible
    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-input-element,
    ::ng-deep .mat-mdc-form-field.mat-form-field-should-float .mat-mdc-input-element {
      color: #333 !important;
      z-index: 3 !important;
    }

    // Ensure select value text is always visible
    ::ng-deep .mat-mdc-select-value,
    ::ng-deep .mat-mdc-select-value-text {
      color: #333 !important;
      z-index: 3 !important;
      position: relative !important;
    }

    // Completely hide all placeholders and internal text
    ::ng-deep .mat-mdc-input-element::placeholder {
      opacity: 0 !important;
      color: transparent !important;
    }

    // Hide any internal Angular Material placeholder elements
    ::ng-deep .mat-mdc-form-field-placeholder {
      display: none !important;
    }

    ::ng-deep .mat-placeholder {
      display: none !important;
    }    // Force hide placeholder in all states
    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element::placeholder {
      opacity: 0 !important;
      color: transparent !important;
      visibility: hidden !important;
    }

    // Hide any text that might appear in the input area when label is floating
    ::ng-deep .mat-mdc-form-field.mdc-text-field--floated .mat-mdc-input-element::placeholder {
      display: none !important;
    }

    // Ensure no duplicate text appears
    ::ng-deep .mat-mdc-form-field-infix .mat-mdc-input-element {
      background: transparent !important;
    }

    // Hide any potential duplicate labels or text
    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-infix::before,
    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-infix::after {
      display: none !important;
    }    // Floating label for fill appearance
    ::ng-deep .mat-mdc-floating-label,
    ::ng-deep .mdc-floating-label--float-above {
      color: #666 !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      line-height: 20px !important;
      pointer-events: none !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: absolute !important;
      left: 0 !important;
      top: 20px !important;
      transform-origin: left top !important;
      transform: translateY(0) scale(1) !important;
      z-index: 1 !important;
      background: transparent !important;
      padding: 0 !important;
    }    // Floating state - simplified approach
    ::ng-deep .mdc-floating-label--float-above,
    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-floating-label,
    ::ng-deep .mat-mdc-form-field.mat-form-field-should-float .mat-mdc-floating-label {
      transform: translateY(-24px) scale(0.75) !important;
      color: #667eea !important;
      background: transparent !important;
      z-index: 1 !important;
    }    // Additional selectors to catch all scenarios
    ::ng-deep .mat-mdc-form-field:not(.mat-form-field-should-float) .mat-mdc-floating-label {
      color: #666 !important;
    }

    // Force proper behavior for select fields
    ::ng-deep .mat-mdc-form-field.mat-mdc-form-field-type-mat-select .mat-mdc-floating-label {
      z-index: 1 !important;
    }

    // Error styling
    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      padding: 0 16px !important;
      margin-top: 4px !important;
      position: static !important;
    }

    ::ng-deep .mat-mdc-form-field-error {
      color: #e53e3e !important;
      font-size: 12px !important;
      line-height: 16px !important;
    }    // Icon styling
    ::ng-deep .mat-mdc-form-field-icon-suffix {
      color: #666 !important;
      display: flex !important;
      align-items: center !important;
      margin-left: 8px !important;
    }

    ::ng-deep .mat-mdc-form-field-icon-suffix .mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      line-height: 20px !important;
    }

    ::ng-deep .mat-mdc-icon-button {
      width: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 8px !important;
    }

    ::ng-deep .mat-mdc-icon-button .mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      line-height: 20px !important;
    }    // Select field overrides
    ::ng-deep .mat-mdc-select-value {
      color: #333 !important;
      font-size: 16px !important;
    }

    ::ng-deep .mat-mdc-select-arrow {
      color: #666 !important;
    }

    // Hide select placeholder when value is selected
    ::ng-deep .mat-mdc-select-placeholder {
      opacity: 0 !important;
      display: none !important;
    }

    // Hide any select internal text that might overlap
    ::ng-deep .mat-mdc-select-min-line {
      opacity: 1 !important;
    }

    // Ensure select value text is properly positioned
    ::ng-deep .mat-mdc-select-value-text {
      color: #333 !important;
      font-size: 16px !important;
    }    // Select field floating labels - simplified
    ::ng-deep .mat-mdc-form-field.mat-mdc-form-field-type-mat-select.mat-form-field-should-float .mat-mdc-floating-label,
    ::ng-deep .mat-mdc-form-field.mat-mdc-form-field-type-mat-select.mat-focused .mat-mdc-floating-label {
      transform: translateY(-22px) scale(0.75) !important;
      color: #667eea !important;
      background: transparent !important;
      z-index: 1 !important;
    }// Ensure Material Icons display properly
    ::ng-deep .mat-icon {
      font-family: 'Material Icons' !important;
      font-weight: normal !important;
      font-style: normal !important;
      font-size: 20px !important;
      line-height: 1 !important;
      letter-spacing: normal !important;
      text-transform: none !important;
      display: inline-block !important;
      white-space: nowrap !important;
      word-wrap: normal !important;
      direction: ltr !important;
      font-feature-settings: 'liga' !important;
      -webkit-font-smoothing: antialiased !important;
    }

    // Fix icon alignment in form fields
    ::ng-deep .mat-mdc-form-field .mat-icon {
      vertical-align: middle !important;
    }

    // Additional overrides to ensure clean appearance
    ::ng-deep .mat-mdc-form-field-bottom-align::before {
      display: none !important;
    }

    // Force all form fields to have proper spacing
    ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0 !important;
    }

    // Ensure consistent field height
    ::ng-deep .mat-mdc-form-field {
      min-height: 60px !important;
      line-height: normal !important;
    }

    // Clean up any extra spacing or overlapping elements
    ::ng-deep .mat-mdc-form-field-outline-thick {
      display: none !important;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChildren(MatFormField) formFields!: QueryList<MatFormField>;
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);
  private router = inject(Router);
  
  loginForm: FormGroup;
  hidePassword = true;
  authState = { isLoading: false, error: null as string | null };
  currentLocale: string;
  languageOptions = this.i18nService.getLanguageOptions();
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.currentLocale = this.i18nService.getCurrentLocale();
  }
  
  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.authState$.subscribe(state => {
      this.authState = { isLoading: state.isLoading, error: state.error };
      
      // Redirect if already authenticated
      if (state.isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });

    // Subscribe to form value changes to trigger floating labels
    this.loginForm.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.updateFloatingLabels();
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    // Force floating label update after view init
    setTimeout(() => {
      this.updateFloatingLabels();
    }, 100);
  }

  private updateFloatingLabels(): void {
    this.formFields?.forEach(field => {
      field._shouldAlwaysFloat = () => {
        const control = field._control;
        return !!(control && control.value && control.value.toString().trim());
      };
      field._animateAndLockLabel();
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginRequest = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
    }
  }
  
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }  
  changeLanguage(locale: string): void {
    this.i18nService.setLocale(locale);
    // Force floating label update after language change
    setTimeout(() => {
      this.updateFloatingLabels();
    }, 100);
  }
}
