import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-label',
  template: `
    <div class="mb-6 flex items-center gap-4">
      <span class="h-px flex-1 bg-border"></span>
      <span class="small-caps text-accent">{{ text() }}</span>
      <span class="h-px flex-1 bg-border"></span>
    </div>
  `,
})
export class SectionLabel {
  readonly text = input.required<string>();
}
