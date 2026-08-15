import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    
    // Nếu là đường dẫn đầy đủ, trả về nguyên bản
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Nếu là đường dẫn tương đối (path), gắn thêm base URL
    const baseUrl = environment.assetsBaseUrl || '';
    const separator = value.startsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${value}`;
  }
}
