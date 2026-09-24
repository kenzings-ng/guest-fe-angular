export interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  readTime: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
