import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private toastIdCounter = 0;

  show(message: string, type: ToastType = 'info', title?: string): void {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = { id, type, message, title };
    
    this._toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(message: string, title?: string): void {
    this.show(message, 'success', title);
  }

  error(message: string, title?: string): void {
    this.show(message, 'error', title);
  }

  info(message: string, title?: string): void {
    this.show(message, 'info', title);
  }

  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
