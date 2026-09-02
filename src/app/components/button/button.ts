import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const BASE_CLASS =
  'touch-manipulation inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6 text-sm font-semibold tracking-[0.01em] transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border border-accent bg-accent text-accent-foreground hover:border-foreground hover:bg-foreground',
  secondary:
    'border border-foreground bg-transparent text-foreground hover:border-accent hover:text-accent',
  ghost:
    'border-b border-foreground/30 px-0 text-foreground hover:border-accent hover:text-accent',
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
