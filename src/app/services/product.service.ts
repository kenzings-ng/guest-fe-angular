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

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<ApiProduct[]>(this.baseUrl).pipe(map((list) => list.map(mapProduct)));
  }

  getBySlug(slug: string): Observable<Product | undefined> {
    return this.http.get<ApiProduct>(`${this.baseUrl}/${slug}`).pipe(
      map(mapProduct),
      catchError(() => of(undefined)),
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
