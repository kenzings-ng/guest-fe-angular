import { Component, input, model } from '@angular/core';

let uid = 0;

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.html',
})
export class AccordionItem {
  readonly title = input.required<string>();
  readonly open = model(false);

  protected readonly contentId = `accordion-content-${uid++}`;

  protected toggle(): void {
    this.open.set(!this.open());
  }
}
