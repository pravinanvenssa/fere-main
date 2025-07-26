import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe
  ],
  template: `
    <div class="profile-container" *ngIf="user">
      <h1>{{ 'nav.profile' | translate }}</h1>
      
      <div class="profile-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Personal Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="profile-info">
              <div class="info-row">
                <strong>Name:</strong>
                <span>{{ user.firstName }} {{ user.lastName }}</span>
              </div>
              <div class="info-row">
                <strong>Email:</strong>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-row">
                <strong>Status:</strong>
                <mat-chip [style.background-color]="user.isActive ? '#4caf50' : '#f44336'"
                          [style.color]="'white'">
                  {{ user.isActive ? ('users.status.active' | translate) : ('users.status.inactive' | translate) }}
                </mat-chip>
              </div>
              <div class="info-row">
                <strong>Member Since:</strong>
                <span>{{ user.createdAt | date }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              <mat-icon>edit</mat-icon>
              {{ 'common.edit' | translate }}
            </button>
          </mat-card-actions>
        </mat-card>
        
        <mat-card>
          <mat-card-header>
            <mat-card-title>Roles & Permissions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="roles-section">
              <h3>Assigned Roles:</h3>
              <mat-chip-listbox>
                <mat-chip *ngFor="let role of user.roles">{{ role.name }}</mat-chip>
              </mat-chip-listbox>
            </div>
            
            <div class="permissions-section" *ngIf="allPermissions.length > 0">
              <h3>Permissions:</h3>
              <mat-chip-listbox>
                <mat-chip *ngFor="let permission of allPermissions">
                  {{ permission.resource }}:{{ permission.action }}
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 30px;
      color: #333;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .roles-section, .permissions-section {
      margin-bottom: 20px;
    }
    
    .roles-section h3, .permissions-section h3 {
      margin-bottom: 12px;
      color: #666;
    }
    
    mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  
  user: User | null = null;
  allPermissions: any[] = [];
  
  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.user = state.user;
      if (this.user) {
        this.allPermissions = this.user.roles.flatMap(role => role.permissions);
      }
    });
  }
}
