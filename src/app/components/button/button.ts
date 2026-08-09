import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const BASE_CLASS =
  'touch-manipulation inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 text-sm font-medium tracking-[0.02em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground shadow-xs hover:-translate-y-0.5 hover:bg-accent-secondary hover:shadow-accent active:translate-y-0',
  secondary:
    'border border-foreground bg-transparent text-foreground hover:border-accent hover:bg-muted hover:text-accent',
  ghost:
    'text-muted-foreground underline decoration-transparent decoration-1 underline-offset-4 hover:text-foreground hover:decoration-accent',
};

@Component({
  selector: 'app-button',
  imports: [RouterLink, NgTemplateOutlet],
  host: { class: 'contents' },
  template: `
    <ng-template #label><ng-content /></ng-template>

    @if (routerLink()) {
      <a class="{{ classes() }}" [routerLink]="routerLink()" [queryParams]="queryParams()">
        <ng-container [ngTemplateOutlet]="label" />
      </a>
    } @else {
      <button [type]="type()" [disabled]="disabled()" class="{{ classes() }}" (click)="clicked.emit($event)">
        <ng-container [ngTemplateOutlet]="label" />
      </button>
    }
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly routerLink = input<string | unknown[] | null>(null);
  readonly queryParams = input<Record<string, string> | null>(null);

  readonly clicked = output<MouseEvent>();

  protected classes(): string {
    return `${BASE_CLASS} ${VARIANT_CLASS[this.variant()]} ${this.fullWidth() ? 'w-full' : ''}`;
  }
}
