import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],  template: `
    <div class="dashboard-container fade-in">
      <div class="dashboard-header">
        <h1 class="dashboard-title">{{ 'dashboard.title' | translate }}</h1>
        <div class="dashboard-subtitle" *ngIf="user">
          <mat-icon>waving_hand</mat-icon>
          {{ 'dashboard.welcome' | translate: {name: user.firstName} }}
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card modern-card">
          <div class="stat-content">
            <div class="stat-icon users-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ 'dashboard.stats.users' | translate }}</h3>
              <p class="stat-number">{{ userStats.total }}</p>
              <span class="stat-change positive">+12% this month</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card modern-card">
          <div class="stat-content">
            <div class="stat-icon active-icon">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ 'dashboard.stats.active' | translate }}</h3>
              <p class="stat-number">{{ userStats.active }}</p>
              <span class="stat-change positive">+8% this week</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card modern-card">
          <div class="stat-content">
            <div class="stat-icon roles-icon">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ 'dashboard.stats.roles' | translate }}</h3>
              <p class="stat-number">{{ userStats.roles }}</p>
              <span class="stat-change neutral">No change</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="quick-actions modern-card">
          <div class="card-header">
            <h2>
              <mat-icon>flash_on</mat-icon>
              Quick Actions
            </h2>
          </div>
          <div class="actions-grid">
            <button mat-raised-button class="action-btn" routerLink="/users" 
                    *ngIf="hasPermission('users', 'read')">
              <mat-icon>people</mat-icon>
              <span>{{ 'nav.users' | translate }}</span>
            </button>
            
            <button mat-raised-button class="action-btn admin-btn" routerLink="/admin"
                    *ngIf="hasRole('admin')">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>{{ 'nav.admin' | translate }}</span>
            </button>
            
            <button mat-raised-button class="action-btn" routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>{{ 'nav.profile' | translate }}</span>
            </button>
          </div>
        </div>
        
        <div class="recent-activity modern-card">
          <div class="card-header">
            <h2>
              <mat-icon>history</mat-icon>
              Recent Activity
            </h2>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">
                <mat-icon>login</mat-icon>
              </div>
              <div class="activity-content">
                <h4>User logged in</h4>
                <p>{{ user?.email }} signed in successfully</p>
                <span class="activity-time">Just now</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <mat-icon>security</mat-icon>
              </div>
              <div class="activity-content">
                <h4>Security check</h4>
                <p>All systems are running smoothly</p>
                <span class="activity-time">5 minutes ago</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <mat-icon>update</mat-icon>
              </div>
              <div class="activity-content">
                <h4>System updated</h4>
                <p>Application updated to latest version</p>
                <span class="activity-time">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,  styles: [`
    .dashboard-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 72px);
    }
    
    .dashboard-header {
      margin-bottom: 40px;
      text-align: center;
    }
    
    .dashboard-title {
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 16px 0;
    }
    
    .dashboard-subtitle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 18px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .dashboard-subtitle mat-icon {
      color: #ffc107;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-8px);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 8px;
    }
    
    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    
    .users-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    .active-icon {
      background: linear-gradient(135deg, #11998e, #38ef7d);
      color: white;
    }
    
    .roles-icon {
      background: linear-gradient(135deg, #fc466b, #3f5efb);
      color: white;
    }
    
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .stat-info {
      flex: 1;
    }
    
    .stat-info h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 0 0 4px 0;
      line-height: 1;
    }
    
    .stat-change {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      display: inline-block;
    }
    
    .stat-change.positive {
      background: rgba(17, 153, 142, 0.1);
      color: #11998e;
    }
    
    .stat-change.neutral {
      background: rgba(108, 117, 125, 0.1);
      color: #6c757d;
    }
    
    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    
    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .card-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .card-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #333;
    }
    
    .card-header mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }
    
    .action-btn {
      height: 80px !important;
      border-radius: 16px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      transition: all 0.3s ease !important;
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
    }
    
    .action-btn:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
    }
    
    .action-btn.admin-btn {
      background: linear-gradient(135deg, #fc466b, #3f5efb) !important;
      box-shadow: 0 4px 15px rgba(252, 70, 107, 0.3) !important;
    }
    
    .action-btn.admin-btn:hover {
      box-shadow: 0 8px 25px rgba(252, 70, 107, 0.4) !important;
    }
    
    .action-btn mat-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      margin: 0 !important;
    }
    
    .action-btn span {
      font-size: 12px !important;
      font-weight: 600 !important;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(102, 126, 234, 0.05);
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }
    
    .activity-item:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateX(4px);
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .activity-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .activity-content p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .activity-time {
      font-size: 12px;
      color: #999;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  user: User | null = null;
  userStats = {
    total: 0,
    active: 0,
    roles: 0
  };
  
  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.user = state.user;
    });
    
    // Mock stats for demo
    this.userStats = {
      total: 150,
      active: 142,
      roles: 5
    };
  }
  
  hasRole(roleName: string): boolean {
    return this.authService.hasRole(roleName);
  }
  
  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }
}
