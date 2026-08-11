import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionItem } from '../../components/accordion-item/accordion-item';

@Component({
  selector: 'app-faq',
  imports: [AccordionItem, RouterLink],
  templateUrl: './faq.html',
})
export class Faq {}
