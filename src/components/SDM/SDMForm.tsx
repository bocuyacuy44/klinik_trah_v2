import React, { useState, useEffect } from 'react';
import { Save, X, UserPlus, Edit } from 'lucide-react';
import { SDM } from '../../types';
import { sdmService } from '../../services/sdmService';
import { toast } from 'react-toastify';

interface SDMFormProps {
  sdm?: SDM | null;
  onSave: () => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const SDMForm: React.FC<SDMFormProps> = ({ sdm, onSave, onCancel, mode }) => {
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    role: 'dokter' as 'dokter' | 'perawat' | 'admin',
    status: 'aktif' as 'aktif' | 'non-aktif',
    keterangan: '',
    username: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  // Role options
  const roleOptions = [
    { value: 'dokter', label: 'Dokter' },
    { value: 'perawat', label: 'Perawat' },
    { value: 'admin', label: 'Admin' }
  ];

  // Status options
  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'non-aktif', label: 'Non-Aktif' }
  ];

  useEffect(() => {
    if (sdm && mode === 'edit') {
      setFormData({
        nama: sdm.nama,
        jabatan: sdm.jabatan,
        role: sdm.role as 'dokter' | 'perawat' | 'admin',
        status: sdm.status,
        keterangan: sdm.keterangan || '',
        username: sdm.username || '',
        password: '',
        email: sdm.email || ''
      });
    }
  }, [sdm, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim() || !formData.jabatan.trim()) {
      toast.error('Nama dan jabatan harus diisi');
      return;
    }

    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Username dan email harus diisi');
      return;
    }

    if (mode === 'create' && !formData.password.trim()) {
      toast.error('Password harus diisi');
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'create') {
        await sdmService.createSDM(formData);
        toast.success('Data SDM berhasil ditambahkan');
      } else if (mode === 'edit' && sdm) {
        await sdmService.updateSDM(sdm.id, formData);
        toast.success('Data SDM berhasil diperbarui');
      }
      
      onSave();
    } catch (error) {
      toast.error(mode === 'create' ? 'Gagal menambahkan SDM' : 'Gagal memperbarui SDM');
      console.error('Error saving SDM:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            {mode === 'create' ? (
              <UserPlus className="w-5 h-5 text-blue-600" />
            ) : (
              <Edit className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Tambah SDM Baru' : 'Edit Data SDM'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nama */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          {/* Jabatan */}
          <div>
            <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700 mb-2">
              Jabatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jabatan"
              name="jabatan"
              value={formData.jabatan}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan jabatan"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan keterangan (opsional)"
            />
          </div>

          {/* Divider for Login Credentials */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Login</h3>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan username untuk login"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password {mode === 'create' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === 'create' ? "Masukkan password" : "Kosongkan jika tidak ingin mengubah password"}
              required={mode === 'create'}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan' : 'Update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SDMForm; 