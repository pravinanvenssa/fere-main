import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    TranslatePipe
  ],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>block</mat-icon>
          </div>
          <h1>403</h1>
          <h2>{{ 'error.unauthorized' | translate }}</h2>
          <p>{{ 'error.forbidden' | translate }}</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>home</mat-icon>
            Go to Dashboard
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .error-card {
      max-width: 400px;
      text-align: center;
    }
    
    .error-icon {
      font-size: 4rem;
      color: #f44336;
      margin-bottom: 20px;
    }
    
    .error-icon mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
    
    h1 {
      font-size: 3rem;
      color: #f44336;
      margin: 0;
    }
    
    h2 {
      color: #333;
      margin: 16px 0;
    }
    
    p {
      color: #666;
      margin-bottom: 24px;
    }
    
    button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }
  `]
})
export class UnauthorizedComponent {
}
