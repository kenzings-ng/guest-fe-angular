import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/articles`;

  getAll(limit = 20): Observable<Article[]> {
    return this.http.get<Article[]>(this.baseUrl, { params: { limit: String(limit) } }).pipe(
      catchError(() => of([] as Article[])),
    );
  }

  getBySlug(slug: string): Observable<Article | undefined> {
    return this.http.get<Article>(`${this.baseUrl}/${slug}`).pipe(
      catchError(() => of(undefined)),
    );
  }
}
