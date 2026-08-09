export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  isNew?: boolean;
  description: string;
  details: string[];
  images: string[];
  colors: ProductColor[];
  sizes: string[];
}
