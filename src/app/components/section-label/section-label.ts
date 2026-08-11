import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-label',
  template: `
    <h2 class="mb-8 font-display text-3xl text-foreground md:text-4xl">{{ text() }}</h2>
  `,
})
export class SectionLabel {
  readonly text = input.required<string>();
}
