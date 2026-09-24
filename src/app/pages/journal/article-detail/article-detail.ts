import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-article-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  templateUrl: './article-detail.html',
})
export class ArticleDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  protected readonly article = signal<Article | undefined>(undefined);
  protected readonly loading = signal(true);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.articleService.getBySlug(slug).subscribe((art) => {
        this.article.set(art);
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }
}
