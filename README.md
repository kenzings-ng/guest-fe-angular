# MAISON Storefront

Storefront dành cho khách hàng của hệ thống thương mại điện tử MAISON, xây dựng
bằng Angular 22. Ứng dụng hỗ trợ khám phá sản phẩm, wishlist, giỏ hàng, checkout,
thanh toán, tài khoản và theo dõi đơn hàng.

## Vai trò trong hệ thống

| Thành phần | URL local | Repository |
| --- | --- | --- |
| Backend API | `http://localhost:3000` | [be-nestjs](https://github.com/kenzings-ng/be-nestjs) |
| Guest frontend | `http://localhost:4200` | Repository này |
| Admin frontend | `http://localhost:4201` | [admin-fe-angular](https://github.com/kenzings-ng/admin-fe-angular) |

## Yêu cầu môi trường

- Node.js `^22.22.3`, `^24.15.0` hoặc `>=26.0.0`.
- npm; lockfile hiện được tạo bằng npm `11.12.1`.
- Backend API đã chạy tại `http://localhost:3000`.

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

## Quick Start

### 1. Clone và cài dependency

```bash
git clone https://github.com/kenzings-ng/guest-fe-angular.git
cd guest-fe-angular
npm ci
```

Dùng `npm ci` khi clone mới để cài đúng phiên bản trong `package-lock.json`.

### 2. Tạo cấu hình local

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Giá trị local tối thiểu:

```dotenv
API_URL=http://localhost:3000
```

Sinh runtime config:

```bash
npm run config:runtime
```

Lệnh trên tạo `public/env.js`. Cả `.env` và `public/env.js` đều không được
commit vào Git.

### 3. Chạy development server

```bash
npm start
```

Mở [http://localhost:4200](http://localhost:4200).

> Ứng dụng sẽ dừng khởi tạo nếu `public/env.js` không cung cấp `API_URL` hợp
> lệ.

### 4. Tạo tài khoản người dùng

1. Mở trang đăng ký trên storefront.
2. Tạo tài khoản bằng email chưa tồn tại.
3. Nếu backend để `MAIL_HOST` trống, mở terminal backend và truy cập link xác
   minh được in ra console.
4. Đăng nhập lại sau khi xác minh email.

## Chạy cả hệ thống

Mở ba terminal:

```bash
# Terminal 1 — backend
cd be-nestjs
npm run start:dev
```

```bash
# Terminal 2 — storefront
cd guest-fe-angular
npm start
```

```bash
# Terminal 3 — admin
cd admin-fe-angular
npm start -- --port 4201
```

Thứ tự khuyến nghị: chạy MongoDB → backend → hai frontend.

Muốn có sẵn danh mục, sản phẩm và dữ liệu demo, chạy trong repository backend:

```bash
npm run seed:demo
```

Script seed đọc `MONGODB_URI` từ `be-nestjs/.env`.

## Runtime configuration

`API_URL` được đọc từ `/env.js` trước khi Angular khởi động, không được đóng
cứng vào bundle. Có thể thay URL backend của build đã tồn tại:

```bash
API_URL=https://api.example.com \
  npm run config:runtime -- --output dist/guest-fe/browser/env.js
```

`env.js` được phục vụ công khai. Chỉ đặt thông tin public như API base URL;
không đặt credential, token hoặc secret.

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm start` | Chạy development server tại `http://localhost:4200`. |
| `npm run config:runtime` | Sinh `public/env.js` từ `.env` hoặc process environment. |
| `npm run build` | Tạo production build trong `dist/guest-fe/browser`. |
| `npm run watch` | Build development và theo dõi thay đổi. |
| `npm test -- --watch=false` | Chạy unit test một lần bằng Vitest. |
| `npm test` | Chạy unit test ở chế độ mặc định của Angular test builder. |

## Build production

```bash
API_URL=https://api.example.com npm run config:runtime
npm run build
```

Output:

```text
dist/guest-fe/browser
```

Backend phải cho phép origin của storefront qua CORS. Nếu dùng thanh toán online,
`FRONTEND_URL` ở backend phải trỏ tới URL public của storefront để tạo return
URL chính xác.

## Triển khai với Nginx

Repository có cấu hình mẫu tại `deploy/nginx/guest-fe.conf`. Trước khi sử dụng,
cập nhật:

- `server_name`: domain của storefront.
- `root`: đường dẫn tuyệt đối tới `dist/guest-fe/browser`.

```bash
sudo cp deploy/nginx/guest-fe.conf /etc/nginx/sites-available/guest-fe.conf
sudo ln -s /etc/nginx/sites-available/guest-fe.conf /etc/nginx/sites-enabled/guest-fe.conf
sudo nginx -t
sudo systemctl reload nginx
```

Cấu hình mẫu đã có Angular route fallback, tắt cache cho `env.js`, gzip và
cache dài hạn cho static asset đã hash.

## Cấu trúc dự án

```text
guest-fe-angular/
├── deploy/nginx/          # Cấu hình Nginx mẫu
├── public/                # Static assets và runtime env.js
├── scripts/               # Script sinh runtime config
└── src/app/
    ├── components/        # UI components dùng chung
    ├── guards/            # Route guards
    ├── interceptors/      # Gắn access token vào request
    ├── models/            # Domain types
    ├── pages/             # Các trang được lazy load
    └── services/          # API clients và signal stores
```

## Xử lý sự cố

| Triệu chứng | Cách kiểm tra |
| --- | --- |
| Trang trắng hoặc lỗi `Missing API_URL runtime configuration` | Chạy `npm run config:runtime` và kiểm tra `public/env.js`. |
| Request báo `ERR_CONNECTION_REFUSED` | Kiểm tra backend đang chạy tại URL trong `.env`. |
| Đăng ký xong nhưng không đăng nhập được | Xác minh email bằng link trong email hoặc console backend. |
| `401 Unauthorized` | Đăng nhập lại; access token có thể đã hết hạn. |
| Không thấy sản phẩm | Chạy `npm run seed:demo` trong backend và kiểm tra đúng database. |
| Thanh toán không có phương thức khả dụng | Backend chưa có payment credential active đúng environment. |
| Đổi `API_URL` nhưng app vẫn gọi URL cũ | Chạy lại `npm run config:runtime` và reload trình duyệt. |
| Cài dependency báo `Unsupported engine` | Đổi sang phiên bản Node.js được liệt kê ở phần yêu cầu môi trường. |

## Nguyên tắc bảo mật

- Không commit `.env`, `public/env.js`, token hoặc credential.
- Không đặt secret trong Angular source hoặc runtime `env.js`.
- Không dùng dữ liệu tài khoản/thanh toán production cho môi trường local.

## Cập nhật mới & Hướng dẫn khi Pull / Clone (Sprint Update)

Khi clone mới hoặc pull code mới nhất về máy, cần lưu ý các cập nhật sau:

### 1. Cập nhật mã nguồn & Build
```bash
npm install
npm run build
```
*(Cấu hình `angular.json` đã được tắt persistent cache LMDB để tương thích ổn định với Node 24).*

### 2. Các tính năng và giao diện mới bổ sung
- **Phân trang & Tìm kiếm Server-side**: Trang Catalog và Search kết nối API phân trang thực tế, hỗ trợ lọc theo danh mục, mức giá, sắp xếp và ô tìm kiếm với debounce 300ms.
- **Chuyên mục Tạp chí ("The Studio Journal")**: Trang danh sách `/journal` và chi tiết bài viết `/journal/:slug` hiển thị các bài viết chia sẻ phong cách, kiến thức chất liệu và lookbook thời trang. Đã tích hợp link trên Header menu.
- **Nâng cấp Trang chủ**: Bổ sung thanh cam kết Store Perks (Freeship, Đổi trả 30 ngày, 100% sợi tự nhiên), lưới 6 danh mục nổi bật (Curated Lines), khối 3 bài viết tạp chí mới nhất và trích dẫn báo chí thời trang.
- **Tài khoản cá nhân**: Bổ sung xem trước và upload ảnh đại diện (Avatar) tại trang Account.
- **Hệ thống Toast thông báo**: Toast notification toàn cục mounted tại `app.html` hỗ trợ auto-dismiss sau 4 giây.

