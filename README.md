# Message Online

Ứng dụng nhắn tin trực tuyến: đăng nhập bằng JWT, tìm người dùng, trò chuyện 1-1 theo thời gian thực qua Socket.IO, có hồ sơ cá nhân và ảnh đại diện.

Dự án gồm hai phần:

| Phần | Thư mục | Công nghệ |
| --- | --- | --- |
| Backend | `message-online/` | Spring Boot 4.1.1, Java 25, Maven |
| Frontend | `message-online-web/` | React 19, TypeScript, Vite, socket.io-client |

## Tính năng

- Đăng ký, đăng nhập, đăng xuất (JWT).
- Tìm người dùng và mở cuộc trò chuyện 1-1 (backend tự gộp nếu hai người đã có hội thoại).
- Gửi và nhận tin nhắn realtime, đếm tin chưa đọc, tự nạp lại tin khi kết nối lại.
- Xem và sửa hồ sơ, đổi ảnh đại diện (ảnh được cắt vuông và nén ngay trên trình duyệt).
- Giao diện dùng được trên điện thoại.

## Kiến trúc

```
Trình duyệt (React)
   │  REST  http://localhost:8080/message   (Spring MVC, JWT)
   │  WS    http://localhost:8099           (netty-socketio, token qua query)
   ▼
Backend Spring Boot
   ├─ MySQL    người dùng, vai trò, quyền (JPA)
   ├─ MongoDB  hội thoại, tin nhắn
   ├─ Kafka    sự kiện thông báo (broker localhost:9092)
   └─ ./upload tệp tải lên (ảnh đại diện)
```

Khi client kết nối Socket.IO, server đọc JWT từ query `token`, rồi cho client vào room của mọi hội thoại mà người đó tham gia. Tin mới được phát tới room bằng event `message`.

## Yêu cầu

- JDK 25
- Maven (hoặc dùng `./mvnw` trong dự án)
- Node.js 20 trở lên
- MySQL, MongoDB và Kafka đang chạy

## Cấu hình backend

`application.yaml` đọc các biến môi trường sau (có thể đặt trong file `.env` ở thư mục chạy, dự án dùng `dotenv-java`):

| Biến | Ý nghĩa |
| --- | --- |
| `MYSQL_URL` | JDBC URL, ví dụ `jdbc:mysql://localhost:3306/message_online` |
| `MONGO_URL` | Mongo URI, ví dụ `mongodb://localhost:27017/message_online` |
| `VALID_DURATION` | Thời hạn access token (giây) |
| `REFRESHABLE_DURATION` | Thời hạn được làm mới token (giây) |

Các giá trị cố định trong file:

| Khóa | Giá trị mặc định |
| --- | --- |
| `server.port` | `8080` |
| `server.servlet.context-path` | `/message` |
| Socket.IO | cổng `8099` (`SocketIOConfig`) |
| `spring.kafka.bootstrap-servers` | `localhost:9092` |
| `app.config.store-located` | `./upload` |
| `app.config.url-prefix` | `http://localhost:8080/message/file/media/download/` |

> **Bảo mật:** `jwt.signerKey`, mật khẩu MySQL và `brev.apiKey` (Brevo) không nên nằm cứng trong `application.yaml`. Chuyển chúng sang biến môi trường hoặc `.env`, và thêm `.env` vào `.gitignore`. Nếu từng commit các giá trị thật, hãy đổi chúng.

## Chạy backend

```bash
cd message-online
./mvnw clean package
./mvnw spring-boot:run
```

REST chạy ở `http://localhost:8080/message`, Socket.IO ở `http://localhost:8099`.

## Chạy frontend

```bash
cd message-online-web
cp .env.example .env     # chỉnh địa chỉ backend nếu cần
npm install
npm run dev
```

| Biến (`.env`) | Mặc định |
| --- | --- |
| `VITE_API_URL` | `http://localhost:8080/message` |
| `VITE_SOCKET_URL` | `http://localhost:8099` |
| `VITE_PROFILE_EDIT` | `true` (đặt `false` để ẩn form sửa hồ sơ) |

Cổng dev mặc định là `5713` (khai báo trong `vite.config.ts`), khớp với origin cấu hình ở `SocketIOConfig` và CORS của backend. Nếu bạn đổi cổng mà Socket.IO bị chặn, hãy sửa origin ở backend cho trùng.

Kiểm tra kiểu và build:

```bash
npm run typecheck
npm run build
```

## API

Mọi response có dạng `{ "code": 1000, "message": "...", "results": ... }`. `code = 1000` là thành công. Các endpoint dưới đây (trừ đăng nhập, đăng ký) cần header `Authorization: Bearer <token>`.

| Việc | Endpoint |
| --- | --- |
| Đăng nhập | `POST /auth/login` `{ username, password }` → `{ token, authenticated }` |
| Đăng xuất | `POST /auth/logout` `{ token }` |
| Đăng ký | `POST /users/create` `{ username, email, password }` |
| Thông tin của tôi | `GET /users/myInfor` |
| Tìm người dùng | `POST /users/search` `{ keyword }` |
| Sửa hồ sơ | `PUT /users/update` (`UserUpdateRequest`) |
| Đổi ảnh đại diện | `PUT /users/avatar`, multipart, tham số `file` |
| Tải ảnh | `GET /file/media/download/{filename}` |
| Danh sách hội thoại | `GET /chat` |
| Tạo hội thoại | `POST /chat/create` `{ type, participantIds }` |
| Lịch sử tin nhắn | `GET /chatting?conversationId=...` (mới nhất trước) |
| Gửi tin | `POST /chatting/create` `{ conversationId, message }` |

## Socket.IO

```ts
const socket = io('http://localhost:8099', { query: { token }, transports: ['websocket'] });
socket.on('message', (msg) => { /* ChatMessageResponse */ });
```

| Event | Hướng | Nội dung |
| --- | --- | --- |
| `message` | server → client | tin nhắn mới của một hội thoại mà bạn tham gia |

Token thiếu hoặc không hợp lệ thì server ngắt kết nối ngay khi handshake.

## Cấu trúc thư mục

```
message-online/src/main/java/com/huumod/chat/
  configuration/   bảo mật, JWT, Socket.IO, Kafka
  controller/      chatcontroller, filecontroller, identity, notify
  service/         chatservice, fileservice, identityservice, notifyservice
  repository/      mysql, mongodb, kafka, filerepository
  entity/ dto/ mapper/ exception/

message-online-web/src/
  api/             fetch wrapper, hàm gọi REST, tải ảnh có token
  context/         AuthContext (phiên đăng nhập)
  hooks/           useChat (hội thoại, tin nhắn, socket), useProtectedImage
  components/      Sidebar, ThreadView, Composer, Avatar, ProfileDialog
  pages/           LoginPage, ChatPage
  socket.ts        kết nối Socket.IO
```

## Lưu ý và hạn chế đã biết

- **Trường `me`** trong event `message` được tính theo người gửi rồi phát cho cả phòng, nên người nhận cũng nhận `me: true`. Frontend tự so `sender.id` với id của mình. Có thể bỏ `me` khỏi payload socket ở backend.
- **Tin của chính mình đến hai lần** (response REST và event socket); frontend khử trùng theo `id`.
- **Avatar trong hội thoại là bản sao** lưu trong MongoDB (`ParticipantInfo`), nên đổi ảnh xong thì hội thoại và tin nhắn cũ vẫn hiện ảnh cũ.
- **Upload tối đa 1 MB** theo mặc định của Spring (chưa cấu hình `spring.servlet.multipart`). Ảnh đại diện đã được nén nên không vướng; nếu cho gửi ảnh trong chat thì cần tăng giới hạn.
- **Ảnh không hiện sau khi đổi:** mở DevTools → Network, lọc `download` và xem status. Kiểm tra `FileController.download` trả về dữ liệu ảnh (`Resource`) chứ không phải object `FileData`, và đường dẫn tải khớp với `app.config.url-prefix`.

## Lỗi thường gặp

**`ObjectMapper` bean not found khi khởi động:** Spring Boot 4 dùng Jackson 3 (`tools.jackson.*`). Dùng `import tools.jackson.databind.ObjectMapper;` và `import tools.jackson.core.type.TypeReference;` thay cho `com.fasterxml.jackson.*`.

**Không kết nối được Socket.IO:** kiểm tra backend đang chạy ở cổng `8099`, token còn hạn, và origin của frontend khớp cấu hình ở `SocketIOConfig`.

**Đăng nhập xong bị đẩy ra:** token hết hạn hoặc bị từ chối (HTTP 401); frontend tự đăng xuất, hãy đăng nhập lại.
