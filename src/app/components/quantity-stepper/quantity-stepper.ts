import { Component, input, output } from '@angular/core';

export type QuantityStepperSize = 'sm' | 'md';

const SIZE_CLASS: Record<QuantityStepperSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
};

@Component({
  selector: 'app-quantity-stepper',
  host: { class: 'contents' },
  templateUrl: './quantity-stepper.html',
})
export class QuantityStepper {
  readonly quantity = input.required<number>();
  readonly size = input<QuantityStepperSize>('sm');

  readonly quantityChange = output<number>();

  protected buttonClass(): string {
    return `flex touch-manipulation items-center justify-center text-foreground hover:text-accent ${SIZE_CLASS[this.size()]}`;
  }
}
