# Message Online – Web

Giao diện chat realtime (React 19 + TypeScript + Vite + Socket.IO client) cho backend `message-online`.

## Chạy

```bash
npm install
npm run dev
```

Mở **http://localhost:5713**. Cổng này bắt buộc: backend chỉ cho Socket.IO từ origin
`http://localhost:5713` (`SocketIOConfig`), nên Vite được đặt `strictPort`. Nếu cổng bận, giải phóng nó
hoặc đổi origin ở backend.

Cần chạy sẵn backend (REST ở `:8080/message`, Socket.IO ở `:8099`). Đổi địa chỉ bằng `.env`
(xem `.env.example`).

## Cách frontend nói chuyện với backend

| Việc | Cách gọi |
| --- | --- |
| Đăng nhập | `POST /auth/login` → `results.token` (JWT, gửi dạng `Authorization: Bearer`) |
| Đăng ký | `POST /users/create` rồi tự đăng nhập |
| Thông tin mình | `GET /users/myInfor` |
| Tìm người | `POST /users/search` body `{ keyword }` |
| Danh sách hội thoại | `GET /chat` |
| Mở chat 1-1 | `POST /chat/create` body `{ type: "DIRECT", participantIds: [id người kia] }` |
| Lịch sử tin | `GET /chatting?conversationId=…` (server trả mới nhất trước, UI đảo lại) |
| Gửi tin | `POST /chatting/create` body `{ conversationId, message }` |
| Sửa hồ sơ | `PUT /users/update` body `{ email }` → `UserResponse` mới |
| Đổi ảnh đại diện | `PUT /users/avatar`, multipart, tham số `file` → `UserResponse` mới |
| Tải ảnh | `GET /media/download/{filename}` (cần token, nên tải bằng `fetch` rồi tạo blob URL) |
| Realtime | `io("http://localhost:8099", { query: { token } })`, lắng nghe event `message` |

Mọi response REST có dạng `{ code, message, results }`, thành công khi `code === 1000`.

## Cấu trúc

```
src/
  api/          fetch wrapper + các hàm gọi REST
  context/      AuthContext (token, phiên đăng nhập)
  hooks/        useChat: hội thoại, tin nhắn, socket, tin chưa đọc
  components/   Sidebar, ThreadView, Composer, Avatar
  pages/        LoginPage, ChatPage
  socket.ts     kết nối Socket.IO
```

## Lưu ý về backend

- Trường `me` trong event `message` được tính theo **người gửi** rồi phát cho cả phòng, nên người nhận
  cũng nhận `me: true`. Frontend bỏ qua trường này và tự so `sender.id` với id của mình.
- Tin mình gửi đến hai lần (response REST và event socket); frontend khử trùng theo `id`.
- `UserResponse` có trường `password`: kiểm tra mapper để chắc chắn không trả hash mật khẩu ra API.

## Hồ sơ và ảnh đại diện

Bấm vào ảnh hoặc tên của bạn ở góc trên bên trái để mở hồ sơ.

- **Ảnh đại diện**: chọn ảnh, xem trước, bấm "Lưu ảnh". Ảnh được cắt vuông ở giữa, thu về 512×512 và nén JPEG
  ngay trên trình duyệt (Spring mặc định chỉ nhận file tối đa 1 MB).
- **Hiển thị ảnh**: `/media/download/**` yêu cầu đăng nhập nên `<img src>` trần bị 401. `Avatar` tải ảnh bằng
  `fetch` kèm token (`src/api/media.ts`). Frontend lấy tên tệp từ URL đã lưu và gọi đúng route của
  `FileController`. `app.config.url-prefix` trong `application.yaml` đang có thêm đoạn `/file/`
  (`.../message/file/media/download/`) mà controller không có, nên hãy sửa cho khớp.
- **Ảnh cũ không tự đổi**: `ParticipantInfo` lưu bản sao avatar trong MongoDB, nên hội thoại và tin nhắn đã tạo
  vẫn hiện ảnh cũ của người đó.

## Sửa hồ sơ

Form sửa hồ sơ gọi `PUT /users/update` (body `UserUpdateRequest`, trả `UserResponse`). Hiện frontend gửi
`{ email }`. Nếu `UserUpdateRequest` có thêm trường khác, thêm vào `userApi.updateProfile` trong `src/api/index.ts`
và `ProfileDialog.tsx`. Đặt `VITE_PROFILE_EDIT=false` trong `.env` để ẩn form này.
