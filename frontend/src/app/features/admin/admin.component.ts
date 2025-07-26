import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  template: `
    <div class="admin-container">
      <h1>{{ 'admin.title' | translate }}</h1>
      
      <div class="admin-grid">
        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>{{ 'admin.roles' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Manage user roles and permissions</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              <mat-icon>settings</mat-icon>
              Manage
            </button>
          </mat-card-actions>
        </mat-card>
        
        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>{{ 'admin.permissions' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Configure system permissions</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              <mat-icon>security</mat-icon>
              Configure
            </button>
          </mat-card-actions>
        </mat-card>
        
        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>{{ 'admin.settings' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>System configuration and settings</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              <mat-icon>tune</mat-icon>
              Settings
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 30px;
      color: #333;
    }
    
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .admin-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .admin-card:hover {
      transform: translateY(-4px);
    }
    
    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AdminComponent {
}
