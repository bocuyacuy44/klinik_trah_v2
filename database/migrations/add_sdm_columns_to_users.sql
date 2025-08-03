-- Migration untuk menambahkan kolom SDM ke tabel users yang sudah ada
-- Jalankan script ini jika tabel users sudah ada dan ingin menambahkan kolom SDM

-- Tambahkan kolom baru untuk Data SDM
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nama VARCHAR(100),
ADD COLUMN IF NOT EXISTS jabatan VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'non-aktif')),
ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Update role constraint untuk menambahkan 'perawat' dan 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('dokter', 'administrasi', 'perawat', 'admin'));

-- Update data yang sudah ada (jika ada)
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

-- Insert data contoh tambahan jika belum ada
INSERT INTO users (username, email, password, full_name, role, nama, jabatan, status, keterangan) 
SELECT 'suster.maria', 'suster.maria@klinik.com', '$2b$10$rQZ8kqXvqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Suster Maria', 'perawat', 'Suster Maria', 'Perawat', 'aktif', 'Perawat senior'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'suster.maria'); 