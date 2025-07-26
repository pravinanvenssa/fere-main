import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService, CreateUserRequest, UpdateUserRequest, Role } from '../../core/user.service';
import { User } from '../../models/user.model';
import { TranslatePipe } from '../../shared/translate.pipe';

export interface UserDialogData {
  user?: User;
  isEdit: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.isEdit ? ('users.dialog.edit' | translate) : ('users.dialog.add' | translate) }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field class="full-width">
          <mat-label>{{ 'users.form.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            {{ 'users.form.email.required' | translate }}
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            {{ 'users.form.email.invalid' | translate }}
          </mat-error>
        </mat-form-field>
        
        <mat-form-field class="full-width">
          <mat-label>{{ 'users.form.firstName' | translate }}</mat-label>
          <input matInput formControlName="firstName" required>
          <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
            {{ 'users.form.firstName.required' | translate }}
          </mat-error>
        </mat-form-field>
        
        <mat-form-field class="full-width">
          <mat-label>{{ 'users.form.lastName' | translate }}</mat-label>
          <input matInput formControlName="lastName" required>
          <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
            {{ 'users.form.lastName.required' | translate }}
          </mat-error>
        </mat-form-field>
        
        <mat-form-field class="full-width" *ngIf="!data.isEdit">
          <mat-label>{{ 'users.form.password' | translate }}</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            {{ 'users.form.password.required' | translate }}
          </mat-error>
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
            {{ 'users.form.password.minlength' | translate }}
          </mat-error>
        </mat-form-field>
        
        <mat-form-field class="full-width">
          <mat-label>{{ 'users.form.roles' | translate }}</mat-label>
          <mat-select formControlName="roleIds" multiple>
            <mat-option *ngFor="let role of roles" [value]="role.id">
              {{ role.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-checkbox formControlName="isActive" *ngIf="data.isEdit">
          {{ 'users.form.active' | translate }}
        </mat-checkbox>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="isLoading">
        {{ 'common.cancel' | translate }}
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()" 
        [disabled]="isLoading"
        type="button">
        <mat-spinner *ngIf="isLoading" diameter="20" style="margin-right: 8px;"></mat-spinner>
        <span *ngIf="!isLoading">{{ data.isEdit ? ('common.update' | translate) : ('common.create' | translate) }}</span>
        <span *ngIf="isLoading">{{ 'common.saving' | translate }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-dialog-content {
      padding: 20px 24px;
    }
    
    mat-dialog-actions {
      padding: 8px 24px 20px;
    }
  `]
})
export class UserFormDialogComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private snackBar = inject(MatSnackBar);
  
  userForm: FormGroup;
  roles: Role[] = [];
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    this.userForm = this.createForm();
    this.loadRoles();
    
    if (data.isEdit && data.user) {
      this.populateForm(data.user);
    }
  }

  private createForm(): FormGroup {
    if (this.data.isEdit) {
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        roleIds: [[]],
        isActive: [true]
      });
    } else {
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        roleIds: [[]],
        isActive: [true]
      });
    }
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleIds: user.roles.map(role => role.id),
      isActive: user.isActive
    });
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.value;
      
      console.log('Form is valid, saving...', { formValue, isEdit: this.data.isEdit });

      if (this.data.isEdit && this.data.user) {
        // Update user
        const updateData: UpdateUserRequest = {
          email: formValue.email,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          roleIds: formValue.roleIds,
          isActive: formValue.isActive
        };

        console.log('Updating user:', updateData);

        this.userService.updateUser(this.data.user.id, updateData).subscribe({
          next: (response) => {
            console.log('User updated successfully:', response);
            this.showSuccess('User updated successfully');
            this.dialogRef.close(response.user);
          },
          error: (error) => {
            console.error('Failed to update user:', error);
            this.showError(error.error?.error || 'Failed to update user');
            this.isLoading = false;
          }
        });
      } else {
        // Create user
        const createData: CreateUserRequest = {
          email: formValue.email,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          password: formValue.password,
          roleIds: formValue.roleIds
        };

        console.log('Creating user:', { ...createData, password: '***' });

        this.userService.createUser(createData).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.showSuccess('User created successfully');
            this.dialogRef.close(response.user);
          },
          error: (error) => {
            console.error('Failed to create user:', error);
            this.showError(error.error?.error || 'Failed to create user');
            this.isLoading = false;
          }
        });
      }
    } else {
      console.log('Form is invalid:', this.userForm.errors);
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
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
