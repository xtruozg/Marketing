# 🚀 Hướng dẫn Deploy lên TinoHost (cPanel Shared Hosting)

Hệ thống **Việt Tiến Global** có 2 bản chạy độc lập. Trên **TinoHost shared hosting** ta dùng
**bản PHP + MySQL** nằm trong thư mục `public_html/` — vì shared hosting **không** chạy được
Node.js/MongoDB nền liên tục. Bản PHP đã được thiết kế đúng chuẩn cPanel:

- Frontend: `index.html` (Cổng khách hàng, React build) + `admin/` (Trang quản trị VT-SYS, React build) — file tĩnh.
- Backend: `api/*.php` — PHP 7.4+ dùng PDO/MySQL.
- **2 cổng đăng nhập tách biệt theo role**: cổng khách `/` chỉ cho tài khoản khách; tài khoản quản trị chỉ đăng nhập ở cổng riêng `/admin/`. (Bản admin PHP cũ `admin.html` đã loại bỏ.)
- **Engine quyết toán**: chạy theo cơ chế *lazy-settlement* — hàm `syncGameClock()` chạy trên
  **mỗi request**, tự tính thời gian đã trôi qua và quyết toán bù các kỳ đã đóng (không cần
  tiến trình nền). Mã kỳ sinh theo mốc đầy đủ `YYYYMMDDHHMMSS`, chu kỳ 40 giây.

---

## ✅ Yêu cầu
- Gói hosting TinoHost có **cPanel + PHP 7.4 trở lên + MySQL** (mọi gói share của Tino đều có).
- Một tên miền đã trỏ về hosting (hoặc dùng tạm subdomain Tino cấp).

---

## Bước 1 — Tạo Database MySQL trên cPanel
1. Đăng nhập cPanel TinoHost → mục **Databases** → **MySQL® Databases**.
2. **Create New Database**: đặt tên, ví dụ `viettien` → cPanel sẽ tạo tên đầy đủ dạng
   `cpaneluser_viettien`. **Ghi lại tên đầy đủ này.**
3. **Add New User**: tạo user (vd `viettien`) + mật khẩu mạnh → tên đầy đủ dạng
   `cpaneluser_viettien`. **Ghi lại user + mật khẩu.**
4. **Add User To Database**: gán user vừa tạo vào database, cấp **ALL PRIVILEGES**.

## Bước 2 — Import cấu trúc bảng (db.sql)
1. cPanel → **phpMyAdmin** → chọn database vừa tạo ở cột trái.
2. Tab **Import** → **Choose File** → chọn `public_html/api/db.sql` → **Go**.
3. Kiểm tra: phải thấy 6 bảng `accounts, rooms, bets, transactions, periods_history,
   forced_results, system_settings` và có sẵn tài khoản `admin`, 2 phòng `Facebook`/`Youtube`.

## Bước 3 — Cấu hình kết nối DB trong `config.php`
Mở `public_html/api/config.php`, sửa 4 dòng sau bằng thông tin ở Bước 1:
```php
define('DB_HOST', 'localhost');            // giữ nguyên
define('DB_USER', 'cpaneluser_viettien');  // user đầy đủ
define('DB_PASS', 'MẬT_KHẨU_DB_CỦA_BẠN');  // mật khẩu vừa đặt
define('DB_NAME', 'cpaneluser_viettien');  // tên database đầy đủ
```
> Có thể sửa ngay trên máy rồi upload, hoặc dùng **File Manager → Edit** của cPanel sau khi upload.

## Bước 4 — Upload mã nguồn
Upload **toàn bộ nội dung bên trong** thư mục `public_html/` của dự án vào thư mục
`public_html/` trên hosting (đây là web root của cPanel).

Cách nhanh nhất:
1. Nén thư mục `public_html/` thành `deploy.zip` (nén **nội dung bên trong**, không nén cả thư mục cha).
2. cPanel → **File Manager** → vào `public_html` → **Upload** `deploy.zip`.
3. Chuột phải `deploy.zip` → **Extract** → xóa file zip sau khi giải nén.

Cấu trúc đích phải là:
```
public_html/
├── index.html          ← Cổng khách hàng (React)
├── admin/              ← Trang quản trị VT-SYS (React)
│   ├── index.html
│   └── assets/...
├── assets/
│   ├── index-*.js/css  ← bundle cổng khách
│   └── images/...      ← ảnh thương hiệu
└── api/
    ├── .htaccess       ← chặn lộ db.sql
    ├── config.php      ← đã sửa thông tin DB
    ├── auth.php  bets.php  rooms.php  transactions.php  admin.php  notifications.php
    └── db.sql
```

> ⚠️ **Khi re-deploy đè lên site cũ:** giải nén zip KHÔNG tự xóa file cũ. Nếu trên hosting còn
> `public_html/admin/` (bản admin PHP cũ) thì **xóa tay** file đó sau khi upload — nay đã thay
> bằng thư mục `admin/`.

## Bước 5 — Truy cập & kiểm tra
- **Cổng khách hàng:** `https://tenmien-cua-ban.com/`
- **Trang quản trị:** `https://tenmien-cua-ban.com/admin/`
- **Đăng nhập admin mặc định:** tài khoản `admin` / mật khẩu `admin`
- **Mã giới thiệu đăng ký mặc định:** `88888`

Kiểm tra nhanh sau khi lên:
1. Mở trang chủ → thấy đồng hồ đếm ngược phòng chạy (chứng tỏ `rooms.php` + DB OK).
2. Đăng ký 1 tài khoản test (mã giới thiệu `88888`) → đăng nhập được.
3. Vào `/admin/` đăng nhập admin → nạp tiền cho tài khoản test → đặt cược → chờ kỳ quyết toán.

---

## 🔒 Bảo mật BẮT BUỘC làm ngay sau khi deploy
1. **Đổi mật khẩu admin:** đăng nhập `/admin/` hoặc sửa trực tiếp trong phpMyAdmin
   (bảng `accounts`, dòng `admin`). Mật khẩu mặc định `admin` **phải đổi**.
2. **Đổi mã giới thiệu** nếu muốn: sửa chuỗi `'88888'` trong `api/auth.php` (khối `register`).
3. File `.htaccess` trong `api/` đã tự chặn truy cập trực tiếp `db.sql`. Nếu muốn chắc chắn,
   có thể **xóa hẳn `api/db.sql`** trên hosting sau khi đã import xong.
4. Đảm bảo `display_errors` = 0 trong `config.php` (đã đặt sẵn) để không lộ lỗi ra ngoài.

---

## ⏱️ (Tùy chọn) Giữ engine luôn "sống" bằng Cron Job
Engine quyết toán chỉ tick khi **có request đến**. Khi có người dùng truy cập/đặt cược thì
nó tự bù đủ các kỳ đã trôi qua, nên bình thường **không cần** cron. Nếu muốn kỳ vẫn quay và
quyết toán ngay cả lúc vắng khách:

cPanel → **Cron Jobs** → thêm lệnh chạy mỗi phút:
```
*/1 * * * *  curl -s "https://tenmien-cua-ban.com/api/rooms.php" > /dev/null 2>&1
```
> Lưu ý: `rooms.php` là endpoint công khai (không cần đăng nhập) nên cron gọi được luôn.

---

## 🧩 Ghi chú kỹ thuật
- **Không cần Node.js, Composer hay build gì** cho bản deploy này — chỉ HTML tĩnh + PHP.
- Thư mục `frontend-client/`, `frontend-admin/`, `server/`, `src/`, `dev-server.ts`… là **bản
  Node/MongoDB dùng để phát triển/local**, **không upload** lên shared hosting.
- Nếu sau này nâng cấp lên **VPS TinoHost**, khi đó mới dùng được bản Node + MongoDB
  (chạy `npm run build` → `npm start`, xem `server/index.ts`).
- Toàn bộ tính toán tiền tệ (đặt cược trừ tiền, rút tiền khấu trừ ngay, hoàn tiền khi từ chối,
  cộng thưởng 1.95) đều nằm trong DB transaction để đảm bảo an toàn dòng tiền.

---

## 🐛 Xử lý sự cố thường gặp
| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| Trang trắng / lỗi 500 | Sai thông tin DB trong `config.php`. Bật tạm `ini_set('display_errors',1)` để xem lỗi. |
| "Lỗi kết nối cơ sở dữ liệu" | Sai `DB_USER`/`DB_PASS`/`DB_NAME`, hoặc quên gán user vào database (Bước 1.4). |
| Đồng hồ phòng không chạy | Chưa import `db.sql` (thiếu bảng `rooms`/`system_settings`), import lại Bước 2. |
| Đăng ký báo sai mã giới thiệu | Nhập đúng `88888` (hoặc mã bạn đã đổi trong `auth.php`). |
| Liên kết ngân hàng / avatar không lưu | Đã vá trong bản này (auth.php nhận cả `bank`/`avatar`). Đảm bảo upload `auth.php` mới nhất. |
