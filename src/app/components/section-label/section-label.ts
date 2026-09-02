import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-label',
  template: `
    <div class="mb-8 flex items-end justify-between border-b border-foreground pb-3">
      <h2 class="font-display text-3xl text-foreground md:text-4xl">{{ text() }}</h2>
      <span class="small-caps hidden text-muted-foreground sm:block">Selected / MAISON</span>
    </div>
  `,
})
export class SectionLabel {
  readonly text = input.required<string>();
}
