# Hướng dẫn test Admin API bằng Swagger (Lessons & Grammars)

## Prerequisites

- Node.js 20+
- Đã cấu hình `.env` với `DATABASE_URL` / `DIRECT_URL` (xem `docs/SETUP.md`)

## 1) Cập nhật DB (tạo bảng `grammars`)

Trong thư mục `BE/`:

Nếu bạn đang dùng Supabase DB đã có sẵn schema (không quản lý bằng Prisma Migrate), dùng:
```bash
npx prisma db pull
npx prisma generate
```

Nếu bạn muốn **tạo bảng `grammars`** từ `schema.prisma` lên DB (dev) mà không cần migrations:

```bash
npx prisma db push
npx prisma generate
```


## 2) Chạy server

```bash
npm run dev
```

Mặc định server chạy ở `http://localhost:4000`.

## 3) Auth admin tạm thời

Admin routes yêu cầu 1 trong 2 cách sau:

### Cách A (khuyến nghị): `ADMIN_API_KEY`

Set env:

```bash
# Windows PowerShell
$env:ADMIN_API_KEY="dev-admin-key"
```

Khi gọi API thêm header:

- `x-admin-key: dev-admin-key`

### Cách B: Header role (khi chưa set `ADMIN_API_KEY`)

Nếu **không** set `ADMIN_API_KEY`, bạn có thể test bằng header:

- `x-role: ADMIN`

## 4) Swagger

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /docs/json`

## 5) Test bằng Swagger UI (khuyến nghị)

### 5.1) Mở Swagger UI

- Mở trình duyệt: `http://localhost:4000/docs`
- Tìm group:
  - `POST /admin/lessons`
  - `PATCH /admin/lessons/{id}`
  - `POST /admin/grammars`
  - `PATCH /admin/grammars/{id}`

### 5.2) Nhập header admin ngay trong Swagger

Với mỗi endpoint admin, Swagger sẽ có phần **Headers** (vì API đã khai báo schema headers).

- Nếu bạn **đã set** `ADMIN_API_KEY`:
  - set header **`x-admin-key`** = giá trị bạn set trong env
- Nếu bạn **chưa set** `ADMIN_API_KEY`:
  - set header **`x-role`** = `ADMIN`

### 5.3) Tạo lesson (FR-C-01)

1) Mở `POST /admin/lessons`  
2) Bấm **Try it out**  
3) Điền header admin như mục 5.2  
4) Nhập body ví dụ:

```json
{
  "title": "Lesson 1",
  "timelineId": null,
  "videoUrl": null,
  "contentMarkdown": "# Intro",
  "order": 1
}
```

5) Bấm **Execute**

Kết quả kỳ vọng:
- HTTP **201**
- Response body dạng `{ "data": { ... } }`

### 5.4) Cập nhật lesson (FR-C-02)

Thay `<LESSON_ID>` bằng `data.id` nhận được ở bước tạo lesson.

1) Mở `PATCH /admin/lessons/{id}`  
2) Bấm **Try it out**  
3) Nhập:
   - `id` = `<LESSON_ID>`
   - header admin như mục 5.2
4) Body ví dụ:

```json
{
  "title": "Lesson 1 (updated)",
  "order": 2
}
```

Kết quả kỳ vọng: HTTP **200** và `{ "data": { ... } }`.

### 5.5) Tạo grammar thuộc lesson (FR-C-03)

Thay `<LESSON_ID>` bằng id lesson.

1) Mở `POST /admin/grammars`  
2) Bấm **Try it out**  
3) Nhập header admin như mục 5.2  
4) Body ví dụ:

```json
{
  "lessonId": "<LESSON_ID>",
  "title": "Grammar 1",
  "contentMarkdown": "## N1",
  "order": 1
}
```

Kết quả kỳ vọng: HTTP **201** và `{ "data": { ... } }`.

### 5.6) Cập nhật grammar (FR-C-03)

Thay `<GRAMMAR_ID>` bằng `data.id` nhận được ở bước tạo grammar.

1) Mở `PATCH /admin/grammars/{id}`  
2) Bấm **Try it out**  
3) Nhập:
   - `id` = `<GRAMMAR_ID>`
   - header admin như mục 5.2
4) Body ví dụ:

```json
{
  "title": "Grammar 1 (updated)",
  "order": 2
}
```

Kết quả kỳ vọng: HTTP **200** và `{ "data": { ... } }`.

### 5.7) Tạo timeline (FR-C-04)

1) Mở `POST /admin/timelines`
2) Bấm **Try it out**
3) Nhập header admin như mục 5.2
4) Body ví dụ:

```json
{
  "title": "Beginner Roadmap",
  "description": "Lộ trình học cơ bản",
  "order": 1
}
```

Kết quả kỳ vọng: HTTP **201** và `{ "data": { ... } }`.

### 5.8) Xem timeline công khai

Mở `GET /timelines` hoặc `GET /timelines/{id}` để kiểm tra timeline và các lesson published bên trong.

## 6) Lưu ý lỗi thường gặp

- **401 Unauthorized**: bạn đã set `ADMIN_API_KEY` nhưng thiếu/sai header `x-admin-key`.
- **403 Forbidden**: bạn chưa set `ADMIN_API_KEY` và thiếu header `x-role: ADMIN`.
- **404 Lesson not found / Grammar not found**: id không tồn tại (Prisma code `P2025`).
- **404 Timeline not found**: id timeline không tồn tại (Prisma code `P2025`).

