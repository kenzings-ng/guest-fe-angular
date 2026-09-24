import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { Gender } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, RouterLink, Button],
  templateUrl: './account.html',
})
export class Account {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly avatarUrl = signal<string | null>(null);
  protected readonly uploadingAvatar = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: [''],
    gender: [''],
    dateOfBirth: [''],
    line1: [''],
    ward: [''],
    district: [''],
    city: [''],
    country: [''],
  });

  constructor() {
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.avatarUrl.set(profile.profile.avatarUrl ?? null);
        this.form.patchValue({
          name: profile.name,
          phone: profile.profile.phone ?? '',
          gender: profile.profile.gender ?? '',
          dateOfBirth: profile.profile.dateOfBirth?.slice(0, 10) ?? '',
          line1: profile.profile.address?.line1 ?? '',
          ward: profile.profile.address?.ward ?? '',
          district: profile.profile.address?.district ?? '',
          city: profile.profile.address?.city ?? '',
          country: profile.profile.address?.country ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your profile.');
        this.loading.set(false);
      },
    });
  }

  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    this.uploadingAvatar.set(true);
    this.userService.uploadAvatar(file).subscribe({
      next: (res) => {
        const url = res.url;
        // Update user profile with new avatar URL
        this.userService.updateMyProfile({ avatarUrl: url }).subscribe({
          next: () => {
            this.avatarUrl.set(url);
            this.uploadingAvatar.set(false);
            this.toast.success('Avatar updated successfully.');
            // Re-sync current user if needed
            this.auth.syncCurrentUser().subscribe();
          },
          error: () => {
            this.uploadingAvatar.set(false);
            this.toast.error('Failed to update profile with new avatar.');
          }
        });
      },
      error: () => {
        this.uploadingAvatar.set(false);
        this.toast.error('Failed to upload avatar image.');
      }
    });
  }

  protected getInitials(name?: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.saved.set(false);
    this.errorMessage.set(null);

    this.userService
      .updateMyProfile({
        name: value.name,
        phone: value.phone || undefined,
        gender: (value.gender || undefined) as Gender | undefined,
        dateOfBirth: value.dateOfBirth || undefined,
        address: {
          line1: value.line1 || undefined,
          ward: value.ward || undefined,
          district: value.district || undefined,
          city: value.city || undefined,
          country: value.country || undefined,
        },
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.toast.success('Profile saved successfully.');
          this.auth.syncCurrentUser().subscribe();
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Could not save your changes.');
          this.toast.error('Could not save your changes.');
        },
      });
  }
}
