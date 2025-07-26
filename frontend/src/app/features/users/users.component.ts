import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../shared/translate.pipe';
import { User } from '../../models/user.model';
import { UserService } from '../../core/user.service';
import { UserFormDialogComponent, UserDialogData } from './user-form-dialog.component';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  template: `
    <div class="users-container">
      <div class="header">
        <h1>{{ 'users.title' | translate }}</h1>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="addUser()"
          *ngIf="canCreateUsers">
          <mat-icon>add</mat-icon>
          {{ 'users.add' | translate }}
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>
          
          <table mat-table [dataSource]="users" class="users-table" *ngIf="!isLoading">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.table.name' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                {{ user.firstName }} {{ user.lastName }}
              </td>
            </ng-container>
            
            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.table.email' | translate }}</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>
            
            <!-- Roles Column -->
            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.table.roles' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let role of user.roles">{{ role.name }}</mat-chip>
                </mat-chip-listbox>
              </td>
            </ng-container>
            
            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.table.status' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [style.background-color]="user.isActive ? '#4caf50' : '#f44336'"
                          [style.color]="'white'">
                  {{ user.isActive ? ('users.status.active' | translate) : ('users.status.inactive' | translate) }}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'users.table.actions' | translate }}</th>
              <td mat-cell *matCellDef="let user">
                <button 
                  mat-icon-button 
                  color="primary" 
                  (click)="editUser(user)"
                  *ngIf="canUpdateUsers"
                  [title]="'users.actions.edit' | translate">
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  color="warn" 
                  (click)="deleteUser(user)"
                  *ngIf="canDeleteUsers && user.id !== currentUserId"
                  [title]="'users.actions.delete' | translate">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <div *ngIf="!isLoading && users.length === 0" class="no-data">
            <p>{{ 'users.noData' | translate }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      margin: 0;
      color: #333;
    }
    
    .header button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .users-table {
      width: 100%;
    }
    
    .mat-mdc-cell, .mat-mdc-header-cell {
      padding: 12px;
    }
    
    mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  displayedColumns: string[] = ['name', 'email', 'roles', 'status', 'actions'];
  users: User[] = [];
  isLoading = false;
  
  // Permission checks
  canCreateUsers = false;
  canUpdateUsers = false;
  canDeleteUsers = false;
  currentUserId: string | null = null;
  
  ngOnInit(): void {
    this.checkPermissions();
    this.loadUsers();
  }
  
  private checkPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    
    this.canCreateUsers = this.authService.hasPermission('users', 'create');
    this.canUpdateUsers = this.authService.hasPermission('users', 'update');
    this.canDeleteUsers = this.authService.hasPermission('users', 'delete');
  }
  
  private loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.showError('Failed to load users');
        this.isLoading = false;
      }
    });
  }
  
  addUser(): void {
    const dialogData: UserDialogData = {
      isEdit: false
    };
    
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: dialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.users = [result, ...this.users];
        this.showSuccess('User created successfully');
      }
    });
  }
  
  editUser(user: User): void {
    const dialogData: UserDialogData = {
      user,
      isEdit: true
    };
    
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: dialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.users.findIndex(u => u.id === result.id);
        if (index !== -1) {
          this.users[index] = result;
        }
        this.showSuccess('User updated successfully');
      }
    });
  }
  
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.showSuccess('User deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.showError('Failed to delete user');
        }
      });
    }
  }
  
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
