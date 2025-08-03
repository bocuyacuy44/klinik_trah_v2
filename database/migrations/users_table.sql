-- Tabel untuk sistem login dengan role dokter dan administrasi
-- Ditambahkan kolom untuk Data SDM (Human Resources)
CREATE TABLE IF NOT EXISTS users (
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

-- Insert data contoh untuk testing
INSERT INTO users (username, email, password, full_name, role, nama, jabatan, status, keterangan) VALUES
('admin', 'admin@klinik.com', '$2b$10$rQZ8kqXvqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Administrator Klinik', 'administrasi', 'Budi Santoso', 'Administrasi', 'aktif', 'Staff administrasi'),
('dr.smith', 'dr.smith@klinik.com', '$2b$10$rQZ8kqXvqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Dr. John Smith', 'dokter', 'Dr. Sri Kartini Kussudiardjo, Sp.A', 'Dokter Spesialis Anak', 'aktif', 'Dokter utama klinik'),
('dr.jane', 'dr.jane@klinik.com', '$2b$10$rQZ8kqXvqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Dr. Jane Doe', 'dokter', 'Dr. Ahmad Hidayat', 'Dokter Umum', 'non-aktif', 'Sedang cuti'),
('suster.maria', 'suster.maria@klinik.com', '$2b$10$rQZ8kqXvqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Suster Maria', 'perawat', 'Suster Maria', 'Perawat', 'aktif', 'Perawat senior');

-- Catatan: Password di atas adalah hash dari "password123"
-- Untuk keamanan, ganti dengan password yang lebih kuat dan hash yang benar

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_nama ON users(nama);
CREATE INDEX IF NOT EXISTS idx_users_jabatan ON users(jabatan);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();