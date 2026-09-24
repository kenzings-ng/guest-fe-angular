import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  templateUrl: './toast-host.html',
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
}
