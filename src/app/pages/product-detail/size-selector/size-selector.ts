import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-size-selector',
  templateUrl: './size-selector.html',
})
export class SizeSelector {
  readonly sizes = input.required<string[]>();
  readonly selected = model<string | null>(null);
  readonly guideClicked = output<void>();
}
