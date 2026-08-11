import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SizeChart } from '../../components/size-chart/size-chart';

@Component({
  selector: 'app-size-guide',
  imports: [SizeChart, RouterLink],
  templateUrl: './size-guide.html',
})
export class SizeGuidePage {}
