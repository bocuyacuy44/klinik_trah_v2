# Setup Sistem Login Klinik

## 1. Setup Database

### Jalankan Query PostgreSQL
Jalankan file `database/migrations/users_table.sql` di PostgreSQL untuk membuat tabel users:

```sql
-- Buka PostgreSQL dan jalankan:
\i database/migrations/users_table.sql
```

### Generate Password Hash yang Benar
1. Install dependencies backend terlebih dahulu:
```bash
cd backend
npm install bcrypt jsonwebtoken
```

2. Generate password hash:
```bash
cd database
node generate_password_hash.js
```

3. Copy hash yang dihasilkan dan update tabel users:
```sql
-- Ganti hash di bawah dengan hasil dari script generate_password_hash.js
UPDATE users SET password = 'HASH_DARI_SCRIPT' WHERE username IN ('admin', 'dr.smith', 'dr.jane');
```

## 2. Setup Backend

### Install Dependencies
```bash
cd backend
npm install bcrypt jsonwebtoken
```

### Jalankan Server
```bash
cd backend
node server.js
```

## 3. Setup Frontend

### Install Dependencies (jika diperlukan)
```bash
npm install
```

### Jalankan Frontend
```bash
npm run dev
```

## 4. Testing Login

### Credentials untuk Testing:
- **Administrasi**: 
  - Username: `admin`
  - Password: `password123`

- **Dokter**: 
  - Username: `dr.smith`
  - Password: `password123`

- **Dokter 2**: 
  - Username: `dr.jane`
  - Password: `password123`

## 5. Fitur yang Telah Diimplementasi

### Backend:
- ✅ Endpoint `/login` untuk autentikasi
- ✅ Endpoint `/verify-token` untuk verifikasi token
- ✅ Middleware `authenticateToken` untuk proteksi endpoint
- ✅ JWT token dengan expire 24 jam
- ✅ Password hashing dengan bcrypt

### Frontend:
- ✅ Login form yang terintegrasi dengan backend
- ✅ Error handling untuk login gagal
- ✅ Token disimpan di localStorage
- ✅ Auto-logout jika token expired
- ✅ Header menampilkan role user (Dokter/Administrasi)
- ✅ Logout menghapus token dan user data

### Database:
- ✅ Tabel users dengan role dokter dan administrasi
- ✅ Index untuk performa
- ✅ Trigger untuk update timestamp
- ✅ Data demo untuk testing

## 6. Keamanan

- Password di-hash menggunakan bcrypt dengan salt rounds 10
- JWT token dengan secret key (gunakan environment variable di production)
- Token verification untuk setiap request yang memerlukan autentikasi
- Auto-logout jika token tidak valid

## 7. Troubleshooting

### Jika Login Gagal:
1. Pastikan server backend berjalan di port 3001
2. Pastikan database PostgreSQL berjalan
3. Pastikan tabel users sudah dibuat dan berisi data
4. Pastikan password hash sudah di-update dengan benar

### Jika Token Error:
1. Clear localStorage di browser
2. Restart server backend
3. Login ulang

## 8. Pengembangan Selanjutnya

Untuk production, pertimbangkan:
- Gunakan environment variables untuk JWT_SECRET
- Implementasi refresh token
- Rate limiting untuk endpoint login
- Logging untuk aktivitas login
- Password reset functionality