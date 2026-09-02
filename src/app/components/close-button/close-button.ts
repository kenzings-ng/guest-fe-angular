import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-close-button',
  host: { class: 'contents' },
  templateUrl: './close-button.html',
})
export class CloseButton {
  readonly ariaLabel = input.required<string>();

  readonly closed = output<void>();
}
