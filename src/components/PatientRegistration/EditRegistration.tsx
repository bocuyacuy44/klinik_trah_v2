import React, { useState } from 'react';
import { Patient, Registration } from '../../types';
import Breadcrumb from '../Layout/Breadcrumb';
import { registrationService } from '../../services/registrationService';

interface EditRegistrationProps {
  patient: Patient;
  registration: Registration;
  onNavigateToDashboard: () => void;
  onNavigateToRegistration: () => void;
  onNavigateToSelectPatient: () => void;
  onShowNotification?: (type: 'success' | 'error', message: string) => void;
  onRegistrationComplete: () => void;
}

const EditRegistration: React.FC<EditRegistrationProps> = ({
  patient,
  registration,
  onNavigateToDashboard,
  onNavigateToRegistration,
  onNavigateToSelectPatient,
  onShowNotification,
  onRegistrationComplete
}) => {
  const [formData, setFormData] = useState({
    ruangan: registration.ruangan || '',
    dokter: registration.dokter || '',
    namaPengantar: registration.namaPengantar || patient.namaLengkap,
    teleponPengantar: registration.teleponPengantar || patient.telepon
  });

  const [loading, setLoading] = useState(false);

  // Mock data - in real app would come from database
  const ruanganOptions = [
    { value: 'poli-gigi', label: 'Poli Gigi' }
  ];

  const dokterOptions = [
    { value: 'dr-kartini', label: 'dr. Sri Kartini Kussudiardjo, Sp.A' }
  ];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruangan || !formData.dokter) {
      onShowNotification?.('error', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await registrationService.updateRegistration(
        registration.id,
        patient.id,
        formData.ruangan,
        formData.dokter,
        formData.namaPengantar,
        formData.teleponPengantar
      );
      onShowNotification?.('success', 'Pendaftaran pasien berhasil diperbarui');
      onRegistrationComplete();
    } catch (error) {
      console.error('Error updating registration:', error);
      onShowNotification?.('error', 'Gagal memperbarui pendaftaran pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigateToRegistration();
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateToDashboard },
          { label: 'Pendaftaran Pasien', onClick: onNavigateToRegistration },
          { label: 'Pilih Pasien', onClick: onNavigateToSelectPatient },
          { label: 'Edit Pendaftaran Pasien', active: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Pendaftaran Pasien</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card 1: Data Pribadi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Pribadi</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No Rekam Medik</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.rekamMedik}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.namaLengkap}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Identitas</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.jenisIdentitas}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Identitas</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.nomorIdentitas}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.tempatLahir}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {new Date(patient.tanggalLahir).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.jenisKelamin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.golonganDarah || '-'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.alamat}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{patient.telepon}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Data Kunjungan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Kunjungan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruangan / Poliklinik <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ruangan}
                  onChange={(e) => handleInputChange('ruangan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Ruangan / Poliklinik</option>
                  {ruanganOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dokter <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dokter}
                  onChange={(e) => handleInputChange('dokter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Dokter</option>
                  {dokterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pengantar Pasien */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pengantar Pasien</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengantar</label>
                <input
                  type="text"
                  value={formData.namaPengantar}
                  onChange={(e) => handleInputChange('namaPengantar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Otomatis isi nama pasien yang dipilih"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Pengantar</label>
                <input
                  type="tel"
                  value={formData.teleponPengantar}
                  onChange={(e) => handleInputChange('teleponPengantar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Otomatis isi nomor pasien yang dipilih jika tersedia"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRegistration;