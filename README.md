# ⚡ AOF Register Tool - Tool Đăng Ký Tín Chỉ HVTC

Dự án tự động hóa đăng ký tín chỉ cho sinh viên **Học viện Tài Chính** ([congdangky.hvtc.edu.vn](https://congdangky.hvtc.edu.vn)).

---

## 🛠 2 Cách Sử Dụng

### Cách 1: Chạy Script Python tự động hoàn toàn (Khuyên Dùng)

#### 1. Cấu hình file `config.json`
Mở file `config.json` và điền:
```json
{
  "username": "YOUR_STUDENT_ID",
  "password": "MẬT_KHẨU_CỦA_BẠN",
  "period_id": 55,
  "target_class_ids": [87315, 87317],
  "auto_chot_du_lieu": true,
  "target_time": "08:00:00"
}
```

#### 2. Xem danh sách mã lớp (Class ID):
```bash
python3 bot.py --list
```

#### 3. Kích hoạt bot chạy tự động:
```bash
python3 bot.py --run
```
Bot sẽ:
1. Đăng nhập SSO và lấy JWT Token.
2. Tự động lắng nghe hàng chờ (Queue System).
3. Đúng 07:59:58 bắt đầu bắn request đăng ký song song các lớp bạn chọn.
4. Tự động gọi API `chot-du-lieu` để xác nhận thành công.

---

### Cách 2: Tiện ích Trình duyệt (Tampermonkey Userscript)
Nếu bạn muốn trực tiếp mở Chrome/Cốc Cốc:
1. Cài extension [Tampermonkey](https://www.tampermonkey.net/) trên Chrome.
2. Thêm script từ file `aof_helper.user.js`.
3. Mở trang `https://congdangky.hvtc.edu.vn/classes`, bạn sẽ thấy một bảng điều khiển ở góc phải màn hình:
   - Điền các `Class ID` cần đăng ký.
   - Bấm **Kích hoạt**, đúng 08:00:00 script sẽ tự động đăng ký và chốt dữ liệu.
