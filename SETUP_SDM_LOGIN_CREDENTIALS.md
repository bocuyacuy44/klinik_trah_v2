# Fitur Pengelolaan Login Credentials untuk Data SDM

## 📋 **Deskripsi Fitur**

Fitur ini memungkinkan admin untuk mengelola username, email, dan password untuk akses login setiap SDM (Sumber Daya Manusia) langsung dari halaman Data SDM.

## ✨ **Fitur yang Ditambahkan**

### 1. **Form Input Login Credentials**
- **Username**: Field untuk username login (wajib diisi)
- **Email**: Field untuk email (wajib diisi)
- **Password**: Field untuk password (wajib saat create, opsional saat edit)

### 2. **Tabel dengan Informasi Login**
- Kolom **Username**: Menampilkan username untuk login
- Kolom **Email**: Menampilkan email SDM
- Data login ditampilkan di tabel utama

### 3. **Validasi Form**
- Username dan email wajib diisi
- Password wajib diisi saat membuat SDM baru
- Password opsional saat edit (kosongkan jika tidak ingin mengubah)

## 🔧 **Perubahan Teknis**

### **Frontend Changes**

#### 1. **SDMForm.tsx**
```typescript
// Form state diperluas
const [formData, setFormData] = useState({
  nama: '',
  jabatan: '',
  role: 'dokter' as 'dokter' | 'perawat' | 'admin',
  status: 'aktif' as 'aktif' | 'non-aktif',
  keterangan: '',
  username: '',    // ✅ Baru
  password: '',    // ✅ Baru
  email: ''        // ✅ Baru
});

// Validasi diperluas
if (!formData.username.trim() || !formData.email.trim()) {
  toast.error('Username dan email harus diisi');
  return;
}

if (mode === 'create' && !formData.password.trim()) {
  toast.error('Password harus diisi');
  return;
}
```

#### 2. **SDMData.tsx**
```typescript
// Tabel diperluas dengan kolom login
<th>Username</th>  // ✅ Baru
<th>Email</th>     // ✅ Baru

// Data ditampilkan
<td>{sdm.username || '-'}</td>  // ✅ Baru
<td>{sdm.email || '-'}</td>     // ✅ Baru
```

#### 3. **Types (index.ts)**
```typescript
// Type SDM diperluas
export type SDM = Pick<User, 'id' | 'nama' | 'jabatan' | 'role' | 'status' | 'keterangan' | 'username' | 'email' | 'created_at' | 'updated_at'>;
```

### **Backend Changes**

#### 1. **Server.js - POST /sdm**
```javascript
// Endpoint create SDM diperluas
const { nama, jabatan, role, status, keterangan, username, email, password } = req.body;

// Validasi
if (!username || !email || !password) {
  return res.status(400).json({ message: "Username, email, dan password harus diisi" });
}

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 2. **Server.js - PUT /sdm**
```javascript
// Endpoint update SDM diperluas
const { nama, jabatan, role, status, keterangan, username, email, password } = req.body;

// Update dinamis berdasarkan field yang diisi
if (username) {
  updateFields.push(`username = $${paramIndex}`);
  values.push(username);
  paramIndex++;
}

if (password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  updateFields.push(`password = $${paramIndex}`);
  values.push(hashedPassword);
  paramIndex++;
}
```

#### 3. **Server.js - GET /sdm**
```javascript
// Query diperluas untuk mengembalikan username dan email
"SELECT id, nama, jabatan, role, status, keterangan, username, email, created_at, updated_at FROM users"
```

## 🎯 **Cara Penggunaan**

### **1. Menambah SDM Baru dengan Login Credentials**
1. Buka halaman "Data SDM"
2. Klik tombol "Tambah SDM Baru"
3. Isi data SDM (nama, jabatan, role, status, keterangan)
4. Isi **Informasi Login**:
   - **Username**: Username untuk login (contoh: `dr.ahmad`)
   - **Email**: Email SDM (contoh: `dr.ahmad@klinik.com`)
   - **Password**: Password untuk login
5. Klik "Simpan"

### **2. Edit Login Credentials SDM**
1. Di tabel SDM, klik icon "Edit" pada baris yang ingin diedit
2. Edit data SDM sesuai kebutuhan
3. Di bagian **Informasi Login**:
   - **Username**: Edit username jika perlu
   - **Email**: Edit email jika perlu
   - **Password**: Kosongkan jika tidak ingin mengubah password, atau isi password baru
4. Klik "Update"

### **3. Melihat Informasi Login**
- Informasi username dan email ditampilkan langsung di tabel SDM
- Password tidak ditampilkan untuk keamanan

## 🔍 **Fitur Pencarian**

Pencarian SDM sekarang juga mencakup:
- Nama SDM
- Jabatan
- Role
- **Username** (✅ Baru)
- **Email** (✅ Baru)

## 🔒 **Keamanan**

1. **Password Hashing**: Semua password di-hash menggunakan bcrypt
2. **Password Tidak Ditampilkan**: Password tidak ditampilkan di tabel atau form edit
3. **Validasi Input**: Username dan email wajib diisi
4. **Update Password Opsional**: Password hanya diupdate jika diisi

## 📊 **Database Schema**

Tabel `users` sudah mendukung field login credentials:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,  -- ✅ Untuk login
  email VARCHAR(100) UNIQUE NOT NULL,     -- ✅ Email SDM
  password VARCHAR(255) NOT NULL,         -- ✅ Password (hashed)
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif',
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **Langkah Implementasi**

### **1. Jalankan Backend**
```bash
cd backend
node server.js
```

### **2. Jalankan Frontend**
```bash
npm run dev
```

### **3. Test Fitur**
1. Login ke aplikasi
2. Buka menu "Data SDM"
3. Coba tambah SDM baru dengan login credentials
4. Coba edit data SDM dan ubah login credentials
5. Coba pencarian berdasarkan username atau email

## ✅ **Status Implementasi**

- ✅ Form input username, email, password
- ✅ Validasi form
- ✅ Backend API untuk create/update dengan credentials
- ✅ Tabel menampilkan username dan email
- ✅ Pencarian berdasarkan username dan email
- ✅ Password hashing dengan bcrypt
- ✅ Update password opsional
- ✅ TypeScript types updated

## 🎉 **Hasil Akhir**

Sekarang setiap SDM dapat memiliki akun login yang dikelola langsung dari halaman Data SDM, dengan fitur:
- ✅ Pengelolaan username dan email
- ✅ Pengelolaan password yang aman
- ✅ Tampilan informasi login di tabel
- ✅ Pencarian berdasarkan credentials
- ✅ Validasi form yang lengkap 