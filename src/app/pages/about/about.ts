import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-about',
  imports: [NgOptimizedImage, Button],
  templateUrl: './about.html',
})
export class About {
  protected readonly founderImage =
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&h=1125&q=80';
}
