# Maison Guest

Maison Guest là storefront dành cho khách hàng của hệ thống thương mại điện tử Maison. Ứng dụng cung cấp toàn bộ hành trình mua sắm, từ khám phá sản phẩm đến đặt hàng và thanh toán online.

## Tính năng chính

- Duyệt danh mục, tìm kiếm và xem chi tiết sản phẩm.
- Xem thư viện ảnh, chọn kích thước và tham khảo size guide.
- Quản lý wishlist và giỏ hàng.
- Đăng ký, đăng nhập, xác minh email và quản lý tài khoản.
- Nhập thông tin giao hàng, checkout và thanh toán online.
- Theo dõi danh sách đơn hàng, chi tiết đơn hàng và trạng thái thanh toán.
- Các trang nội dung: giới thiệu, FAQ, liên hệ, vận chuyển và đổi trả.

## Công nghệ

- [Angular 22](https://angular.dev/) với standalone components và lazy-loaded routes.
- [TypeScript 6](https://www.typescriptlang.org/).
- [RxJS 7](https://rxjs.dev/) và Angular Signals.
- [Tailwind CSS 4](https://tailwindcss.com/).
- [Vitest](https://vitest.dev/) cho unit test.
- Nginx cho môi trường production.

## Yêu cầu môi trường

- Node.js `^22.22.3`, `^24.15.0` hoặc `>=26.0.0`.
- npm; dự án hiện sử dụng npm `11.12.1`.
- Backend API đang hoạt động và cho phép origin của frontend qua CORS.

## Cài đặt và chạy local

### 1. Cài dependencies

```bash
npm ci
```

### 2. Cấu hình API

Tạo file `.env` tại thư mục gốc của dự án:

```dotenv
API_URL=http://localhost:3000
```

Sinh file runtime config từ biến môi trường trên:

```bash
npm run config:runtime
```

Lệnh này tạo `public/env.js`. Cả `.env` và `public/env.js` đều không được commit vào Git.

### 3. Khởi động development server

```bash
npm start
```

Mở [http://localhost:4200](http://localhost:4200). Ứng dụng tự động reload khi source code thay đổi.

> Ứng dụng sẽ dừng khởi tạo nếu `env.js` không cung cấp `API_URL` hợp lệ.

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm start` | Chạy development server. |
| `npm run build` | Tạo production build trong `dist/guest-fe/browser`. |
| `npm run watch` | Build ở chế độ development và theo dõi thay đổi. |
| `npm test` | Chạy unit test bằng Vitest. |
| `npm run config:runtime` | Sinh `public/env.js` từ `.env` hoặc biến môi trường. |
| `npm run ng -- <command>` | Chạy Angular CLI trực tiếp. |

## Kiểm thử

```bash
npm test
```

Dự án hiện chưa cấu hình test end-to-end.

## Build production

Sinh runtime config trước khi build để Angular sao chép file vào output:

```bash
API_URL=https://api.example.com npm run config:runtime
npm run build
```

Build hoàn tất được đặt tại:

```text
dist/guest-fe/browser
```

### Thay đổi API mà không build lại

`env.js` được nạp trước Angular bundle nên API URL không bị đóng cứng vào source code. Có thể cập nhật runtime config của một build đã tồn tại bằng lệnh:

```bash
API_URL=https://api.example.com \
  npm run config:runtime -- --output dist/guest-fe/browser/env.js
```

File `/env.js` không nên được cache để cấu hình mới có hiệu lực ngay ở lần tải trang tiếp theo.

## Triển khai với Nginx

Repository cung cấp cấu hình mẫu tại `deploy/nginx/guest-fe.conf`. Trước khi sử dụng, cập nhật ít nhất hai giá trị:

- `server_name`: domain của storefront.
- `root`: đường dẫn tuyệt đối tới `dist/guest-fe/browser` trên máy chủ.

Sau đó cài và kích hoạt cấu hình:

```bash
sudo cp deploy/nginx/guest-fe.conf /etc/nginx/sites-available/guest-fe.conf
sudo ln -s /etc/nginx/sites-available/guest-fe.conf /etc/nginx/sites-enabled/guest-fe.conf
sudo nginx -t
sudo systemctl reload nginx
```

Cấu hình mẫu đã bao gồm:

- Fallback về `index.html` cho Angular client-side routing.
- Không cache `env.js`.
- Cache 30 ngày cho các static asset khớp với danh sách extension trong file cấu hình.
- Gzip cho CSS, JavaScript, JSON và SVG.

## Cấu trúc dự án

```text
guest-fe-angular/
├── deploy/nginx/          # Cấu hình Nginx mẫu
├── public/                # Static assets và runtime env.js
├── scripts/               # Script sinh runtime config
└── src/
    ├── app/
    │   ├── components/    # UI components dùng chung
    │   ├── guards/        # Bảo vệ các route yêu cầu đăng nhập
    │   ├── interceptors/  # Gắn thông tin xác thực vào HTTP request
    │   ├── models/        # Kiểu dữ liệu của domain
    │   ├── pages/         # Các trang được lazy load theo route
    │   └── services/      # API clients và signal stores
    └── environments/      # Đọc runtime API configuration
```

## Lưu ý khi kết nối backend

- `API_URL` phải là URL đầy đủ của backend, không có giá trị mặc định.
- Backend phải cấu hình CORS cho origin của frontend và cho phép các header ứng dụng gửi, đặc biệt là `Authorization` và `ngrok-skip-browser-warning`.
- Nếu thay đổi domain frontend hoặc backend, hãy kiểm tra lại CORS, redirect thanh toán và cơ chế xác thực.
- Không commit `.env` hoặc `public/env.js`.
- `/env.js` được phục vụ công khai; chỉ đặt cấu hình public như API base URL trong file này, tuyệt đối không đặt credential, token hoặc secret.
