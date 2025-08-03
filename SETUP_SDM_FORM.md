# Setup Form SDM dengan Option Role dan Status

## Overview
Form untuk menambah dan edit data SDM telah ditambahkan dengan dropdown option untuk role dan status.

## Fitur yang Ditambahkan

### 1. **Komponen SDMForm** (`src/components/SDM/SDMForm.tsx`)
- Form modal untuk menambah dan edit SDM
- Dropdown option untuk Role: **Dokter**, **Perawat**, **Admin**
- Dropdown option untuk Status: **Aktif**, **Non-Aktif**
- Validasi input (nama dan jabatan wajib diisi)
- Loading state saat menyimpan data

### 2. **Update SDMData** (`src/components/SDM/SDMData.tsx`)
- Integrasi form dengan tabel SDM
- Tombol "Tambah SDM Baru" yang membuka form create
- Tombol "Edit" di setiap baris yang membuka form edit
- State management untuk form modal

## Option yang Tersedia

### **Role Options:**
```typescript
const roleOptions = [
  { value: 'dokter', label: 'Dokter' },
  { value: 'perawat', label: 'Perawat' },
  { value: 'admin', label: 'Admin' }
];
```

### **Status Options:**
```typescript
const statusOptions = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'non-aktif', label: 'Non-Aktif' }
];
```

## Database Support

### **Role Constraint di Database:**
```sql
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('dokter', 'administrasi', 'perawat', 'admin'));
```

**Note:** Role "administrasi" masih didukung di database untuk backward compatibility, tapi di frontend form hanya menampilkan: dokter, perawat, admin.

### **Status Constraint di Database:**
```sql
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('aktif', 'non-aktif'));
```

## Cara Menggunakan

### 1. **Menambah SDM Baru:**
1. Klik tombol "Tambah SDM Baru"
2. Isi form dengan data yang diperlukan
3. Pilih role dari dropdown (Dokter/Perawat/Admin)
4. Pilih status dari dropdown (Aktif/Non-Aktif)
5. Klik "Simpan"

### 2. **Edit SDM:**
1. Klik tombol "Edit" (ikon pensil) di baris data SDM
2. Form akan terbuka dengan data yang sudah ada
3. Ubah data yang diperlukan
4. Klik "Update"

## Validasi

### **Validasi Frontend:**
- Nama wajib diisi
- Jabatan wajib diisi
- Role wajib dipilih
- Status wajib dipilih
- Keterangan bersifat opsional

### **Validasi Backend:**
- Role harus salah satu dari: 'dokter', 'perawat', 'admin'
- Status harus salah satu dari: 'aktif', 'non-aktif'
- Username dan email otomatis dibuat dari nama

## Auto-Generated Fields

Saat menambah SDM baru, sistem otomatis membuat:
- **Username**: nama dalam lowercase, spasi diganti titik
- **Email**: username@klinik.com
- **Password**: "password123" (hashed)
- **Full Name**: sama dengan nama

## Contoh Data

### **Dokter:**
```json
{
  "nama": "Dr. Sri Kartini Kussudiardjo, Sp.A",
  "jabatan": "Dokter Spesialis Anak",
  "role": "dokter",
  "status": "aktif",
  "keterangan": "Dokter utama klinik"
}
```

### **Perawat:**
```json
{
  "nama": "Suster Maria",
  "jabatan": "Perawat",
  "role": "perawat",
  "status": "aktif",
  "keterangan": "Perawat senior"
}
```

### **Admin:**
```json
{
  "nama": "Budi Santoso",
  "jabatan": "Administrasi",
  "role": "admin",
  "status": "aktif",
  "keterangan": "Staff administrasi"
}
```

## Troubleshooting

### **Error: "Invalid role"**
- Pastikan role yang dipilih sesuai dengan constraint database
- Role yang valid: 'dokter', 'perawat', 'admin'

### **Error: "Invalid status"**
- Pastikan status yang dipilih sesuai dengan constraint database
- Status yang valid: 'aktif', 'non-aktif'

### **Form tidak muncul**
- Pastikan komponen SDMForm sudah diimport dengan benar
- Cek console browser untuk error JavaScript

### **Data tidak tersimpan**
- Pastikan backend server berjalan
- Cek network tab di browser developer tools
- Pastikan semua field wajib sudah diisi

## File yang Diperlukan

1. **`src/components/SDM/SDMForm.tsx`** - Komponen form
2. **`src/components/SDM/SDMData.tsx`** - Update komponen tabel
3. **`src/types/index.ts`** - Type definitions (sudah ada)
4. **`src/services/sdmService.ts`** - Service layer (sudah ada)
5. **`database/migrations/add_sdm_columns_to_users.sql`** - Database migration (sudah ada)

## Next Steps

Setelah implementasi ini, Anda bisa:
1. Menambah SDM baru dengan role perawat
2. Edit data SDM yang sudah ada
3. Mengubah status SDM dari aktif ke non-aktif atau sebaliknya
4. Melihat data SDM dalam format tabel yang rapi 