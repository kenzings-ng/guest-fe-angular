import { Component, input } from '@angular/core';

interface SizeRow {
  size: string;
  chest: number;
  waist: number;
}

const APPAREL_SIZE_ROWS: SizeRow[] = [
  { size: 'XS', chest: 84, waist: 66 },
  { size: 'S', chest: 88, waist: 70 },
  { size: 'M', chest: 96, waist: 78 },
  { size: 'L', chest: 104, waist: 86 },
  { size: 'XL', chest: 112, waist: 94 },
];

@Component({
  selector: 'app-size-chart',
  templateUrl: './size-chart.html',
})
export class SizeChart {
  readonly isApparel = input(true);

  protected readonly rows = APPAREL_SIZE_ROWS;
}
