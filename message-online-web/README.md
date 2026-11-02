# Message Online – Web (React + TypeScript + Vite)

Frontend cho backend Spring Boot `message-online` (REST + Socket.IO realtime).

## Chạy
```bash
npm install
cp .env.example .env     # chỉnh nếu backend chạy địa chỉ khác
npm run dev              # http://localhost:5173  (bắt buộc đúng cổng này vì CORS của backend)
```
Backend cần chạy sẵn: REST `http://localhost:8080/message`, Socket.IO `http://localhost:8099`.
Tài khoản admin mặc định do backend tạo: `admin` / `admin`.

## Chức năng
- Đăng ký, đăng nhập (JWT), đăng nhập Google (OAuth code flow), đăng xuất (thu hồi token)
- Tìm người dùng, tạo cuộc trò chuyện 1-1, danh sách hội thoại
- Nhắn tin realtime qua Socket.IO (+ số tin chưa đọc, trạng thái kết nối)
- Hồ sơ: đổi tên, email, mật khẩu, ảnh đại diện
- Trang quản trị (chỉ ADMIN): người dùng, vai trò, quyền

## Cấu trúc
```
src/api        gọi REST (client.ts bọc fetch + token + ApiResponse)
src/lib        jwt, socket, tải ảnh có token
src/context    AuthContext
src/pages      Auth, GoogleCallback, Chat, Profile, Admin
src/components Avatar, ProtectedRoute
```

## Lưu ý về backend (nên sửa)
1. `SecurityConfig`: `PUBLIC_ENDPOINT` có `/outbound/identity` nhưng route thật là `/auth/outbound/identity` → đăng nhập Google bị 401. Đổi thành `/auth/outbound/identity`.
2. `app.config.url-prefix` có thừa `/file/` (`.../message/file/media/download/`) trong khi route là `/message/media/download/`. Frontend đã tự chuẩn hóa, nhưng nên sửa gốc.
3. `/media/download/**` yêu cầu đăng nhập nên `<img>` không tự gửi token; frontend tải ảnh bằng fetch + Bearer. Nếu cho phép public GET download thì đơn giản hơn.
4. `UserResponse` trả cả `password` (hash) ra client → nên bỏ field này.
5. `UserService.updateUser` chưa gọi `userRepository.save(...)` nên cập nhật hồ sơ có thể không lưu.
6. Payload socket `message` có `me=true` với mọi người nhận (tính theo người gửi); frontend tự so sánh `sender.id`.
7. Chưa có API refresh token: token hết hạn thì người dùng phải đăng nhập lại.
