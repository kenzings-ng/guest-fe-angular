import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { Gender } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, RouterLink, Button],
  templateUrl: './account.html',
})
export class Account {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  protected readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Could not save your changes.');
        },
      });
  }
}
