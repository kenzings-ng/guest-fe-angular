import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductColor } from '../models/product.model';

interface ApiCategory {
  _id: string;
  title: string;
  slug: string;
}

interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  categoryId?: ApiCategory | string | null;
  images: string[];
  price: number;
  compareAtPrice?: number;
  newArrival: boolean;
  stock: number;
  description?: string;
  details: string[];
  colors: ProductColor[];
  sizes: string[];
}

function mapProduct(api: ApiProduct): Product {
  return {
    id: api._id,
    slug: api.slug,
    name: api.name,
    category:
      typeof api.categoryId === 'object' && api.categoryId ? api.categoryId.title : 'Uncategorized',
    price: api.price,
    compareAtPrice: api.compareAtPrice,
    isNew: api.newArrival,
    description: api.description ?? '',
    details: api.details ?? [],
    images: api.images ?? [],
    colors: api.colors ?? [],
    sizes: api.sizes ?? [],
  };
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<any>(this.baseUrl, { params: { limit: '100' } }).pipe(
      map((res) => (Array.isArray(res) ? res : res.items ?? []).map(mapProduct)),
      catchError(() => of([])),
    );
  }

  getBySlug(slug: string): Observable<Product | undefined> {
    return this.http.get<ApiProduct>(`${this.baseUrl}/${slug}`).pipe(
      map(mapProduct),
      catchError(() => of(undefined)),
    );
  }

  search(query: ProductQuery): Observable<PaginatedProducts> {
    const params: Record<string, string> = {};
    if (query.search) params['search'] = query.search;
    if (query.sort) params['sort'] = query.sort;
    if (query.page) params['page'] = String(query.page);
    if (query.limit) params['limit'] = String(query.limit);
    if (query.minPrice !== undefined) params['minPrice'] = String(query.minPrice);
    if (query.maxPrice !== undefined) params['maxPrice'] = String(query.maxPrice);
    
    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((res) => ({
        items: (res.items ?? []).map(mapProduct),
        total: res.total ?? 0,
        page: res.page ?? 1,
        limit: res.limit ?? 12,
        totalPages: res.totalPages ?? 1,
      })),
    );
  }
}

export function getRelatedProducts(products: Product[], product: Product, limit = 4): Product[] {
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .concat(products.filter((candidate) => candidate.id !== product.id))
    .filter((candidate, index, list) => list.findIndex((item) => item.id === candidate.id) === index)
    .slice(0, limit);
}
