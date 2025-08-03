# Setup Data SDM - Menggunakan Tabel Users

## Overview
Fitur Data SDM (Human Resources) telah ditambahkan ke aplikasi klinik dengan menggunakan tabel `users` yang sudah ada. Kolom baru telah ditambahkan ke tabel `users` untuk menyimpan data SDM.

## Perubahan Database

### 1. Update Tabel Users
Jalankan migration untuk menambahkan kolom SDM ke tabel `users`:

```sql
-- Jalankan file: database/migrations/add_sdm_columns_to_users.sql
```

Atau jalankan query berikut di PostgreSQL:

```sql
-- Tambahkan kolom baru untuk Data SDM
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nama VARCHAR(100),
ADD COLUMN IF NOT EXISTS jabatan VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'non-aktif')),
ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Update role constraint untuk menambahkan 'perawat' dan 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('dokter', 'administrasi', 'perawat', 'admin'));

-- Update data yang sudah ada
UPDATE users SET 
    nama = COALESCE(nama, full_name),
    jabatan = COALESCE(jabatan, 
        CASE 
            WHEN role = 'dokter' THEN 'Dokter'
            WHEN role = 'administrasi' THEN 'Administrasi'
            ELSE 'Staff'
        END
    ),
    status = COALESCE(status, 
        CASE 
            WHEN is_active = true THEN 'aktif'
            ELSE 'non-aktif'
        END
    ),
    keterangan = COALESCE(keterangan, 'Staff klinik')
WHERE nama IS NULL OR jabatan IS NULL OR status IS NULL OR keterangan IS NULL;

-- Buat kolom NOT NULL setelah mengisi data
ALTER TABLE users 
ALTER COLUMN nama SET NOT NULL,
ALTER COLUMN jabatan SET NOT NULL;

-- Tambahkan index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_nama ON users(nama);
CREATE INDEX IF NOT EXISTS idx_users_jabatan ON users(jabatan);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
```

### 2. Struktur Tabel Users Setelah Update

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('dokter', 'administrasi', 'perawat', 'admin')),
    is_active BOOLEAN DEFAULT true,
    -- Kolom tambahan untuk Data SDM
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'non-aktif')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Perubahan Backend

### 1. API Endpoints SDM
Semua endpoint SDM sekarang menggunakan tabel `users`:

- `GET /sdm` - Ambil semua data SDM
- `POST /sdm` - Tambah SDM baru (otomatis membuat user account)
- `GET /sdm/:id` - Ambil data SDM berdasarkan ID
- `PUT /sdm/:id` - Update data SDM
- `DELETE /sdm/:id` - Hapus data SDM
- `GET /sdm/search?term=keyword` - Cari SDM

### 2. Fitur Otomatis
- Saat menambah SDM baru, sistem otomatis membuat username dan email
- Password default: "password123" (bisa diubah nanti)
- Username dibuat dari nama (lowercase, spasi diganti titik)

## Perubahan Frontend

### 1. TypeScript Types
- Interface `User` diperluas dengan kolom SDM
- Type `SDM` menggunakan `Pick<User, ...>` untuk subset data

### 2. Komponen SDM
- `src/components/SDM/SDMData.tsx` - Tabel untuk menampilkan data SDM
- Fitur: tampil data, cari, hapus
- TODO: tambah form untuk create/edit SDM

### 3. Navigasi
- Menu "Data SDM" ditambahkan di sidebar
- Routing di `App.tsx` untuk halaman SDM

## Cara Menjalankan

### 1. Update Database
```bash
# Masuk ke PostgreSQL
psql -U postgres -d klinik_db

# Jalankan migration
\i database/migrations/add_sdm_columns_to_users.sql
```

### 2. Restart Backend
```bash
cd backend
node server.js
```

### 3. Restart Frontend
```bash
npm run dev
```

## Data Contoh

Setelah migration, tabel `users` akan berisi data contoh:

| ID | Nama | Jabatan | Role | Status | Keterangan |
|----|------|---------|------|--------|------------|
| 1 | Budi Santoso | Administrasi | administrasi | aktif | Staff administrasi |
| 2 | Dr. Sri Kartini Kussudiardjo, Sp.A | Dokter Spesialis Anak | dokter | aktif | Dokter utama klinik |
| 3 | Dr. Ahmad Hidayat | Dokter Umum | dokter | non-aktif | Sedang cuti |
| 4 | Suster Maria | Perawat | perawat | aktif | Perawat senior |

## Fitur yang Tersedia

✅ **Sudah Implementasi:**
- Tampil data SDM dalam tabel
- Cari SDM berdasarkan nama/jabatan/role
- Hapus data SDM
- Navigasi ke halaman SDM

🔄 **Perlu Ditambahkan:**
- Form untuk tambah SDM baru
- Form untuk edit SDM
- Detail view SDM
- Validasi input
- Konfirmasi sebelum hapus

## Catatan Penting

1. **Password Default**: Semua SDM baru akan memiliki password "password123"
2. **Username Otomatis**: Dibuat dari nama (lowercase, spasi jadi titik)
3. **Email Otomatis**: Format: username@klinik.com
4. **Role Baru**: Ditambahkan 'perawat' dan 'admin' selain 'dokter' dan 'administrasi'
5. **Status**: Hanya 'aktif' atau 'non-aktif'

## Troubleshooting

### Error: "column does not exist"
- Pastikan migration sudah dijalankan
- Cek struktur tabel dengan `\d users`

### Error: "constraint violation"
- Pastikan role yang dimasukkan sesuai (dokter, administrasi, perawat, admin)
- Pastikan status yang dimasukkan sesuai (aktif, non-aktif)

### Data tidak muncul
- Cek koneksi database
- Cek apakah backend berjalan di port 3001
- Cek console browser untuk error 