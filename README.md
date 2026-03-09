# FurnitureWebsite (FastAPI + React/Vite)

Website bán đồ nội thất gồm:

- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Frontend**: React + Vite

---

## Yêu cầu

- **Python**: khuyến nghị 3.10+ (tối thiểu 3.9)
- **Node.js**: 18+ (khuyến nghị 20 LTS)
- **Database**: MySQL/MariaDB (project dùng `SQLALCHEMY_DATABASE_URL`)

---

## Cấu hình biến môi trường

Project đang đọc biến môi trường từ file **`.env` ở thư mục gốc** (cùng cấp với README này).

Tạo file `.env` và điền tối thiểu:

```env
# Database
SQLALCHEMY_DATABASE_URL=mysql+pymysql://USER:PASSWORD@localhost:3306/furniture_db

# JWT
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs
FRONTEND_BASE_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:8000

# Mail (tuỳ chọn)
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_PORT=587
MAIL_SERVER=sandbox.smtp.mailtrap.io

# OAuth (tuỳ chọn)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# VNPay/PayPal (tuỳ chọn)
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_VND_TO_USD=25000
```

Gợi ý: tạo database `furniture_db` trước (tên tuỳ bạn, miễn khớp trong `SQLALCHEMY_DATABASE_URL`).

---

## Chạy Backend (FastAPI)

### 1) Tạo môi trường & cài dependencies

Mở terminal tại thư mục `backend/`:

```bash
cd backend
python -m venv .venv
```

Kích hoạt venv:

- **Windows (PowerShell)**: `\.venv\Scripts\Activate.ps1`
- **Windows (cmd)**: `\.venv\Scripts\activate`
- **macOS/Linux**: `source .venv/bin/activate`

Cài thư viện:

```bash
pip install -r requirements.txt
```

### 2) Chạy migrate database (Alembic)

Từ thư mục `backend/`:

```bash
alembic upgrade head
```

### 3) Run server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

---

## Chạy Frontend (React + Vite)

Mở terminal tại thư mục `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Mặc định Vite chạy ở: http://localhost:5173

---

## Chạy toàn bộ (Dev)

- Terminal 1: chạy backend ở `backend/` (port `8000`)
- Terminal 2: chạy frontend ở `frontend/` (port `5173`)

---

## Troubleshooting nhanh

- Nếu lỗi kết nối DB: kiểm tra `SQLALCHEMY_DATABASE_URL`, user/password và DB đã tạo.
- Nếu `mysqlclient` cài đặt lỗi trên Windows: cài **Microsoft C++ Build Tools** và đảm bảo MySQL/MariaDB client libs có sẵn.

---

## Nhóm FurniDev

1. Nguyễn Vũ Khanh - 22115053122118 (nhóm trưởng)
2. Nguyễn Đình Đức - 22115141122102
3. Đỗ Hùng Quốc Khánh - 22115053122119
4. Đặng Ngọc Dũng - 22115053122109
5. Nguyễn Văn Hải - 22115053122208
