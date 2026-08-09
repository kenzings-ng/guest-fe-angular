import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly year = 2026;
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly subscribed = signal(false);

  protected onSubscribe(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    this.subscribed.set(true);
    this.email.reset();
  }
}
