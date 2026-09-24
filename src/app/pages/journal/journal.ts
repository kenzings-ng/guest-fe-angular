import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-journal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  templateUrl: './journal.html',
})
export class Journal {
  private readonly articleService = inject(ArticleService);
  protected readonly articles = toSignal(this.articleService.getAll(30), { initialValue: [] });
}
