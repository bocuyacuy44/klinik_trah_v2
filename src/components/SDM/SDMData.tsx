import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Users } from 'lucide-react';
import { SDM } from '../../types';
import { sdmService } from '../../services/sdmService';
import { toast } from 'react-toastify';
import ConfirmationModal from '../UI/ConfirmationModal';
import SDMForm from './SDMForm';

const SDMData: React.FC = () => {
  const [sdmList, setSdmList] = useState<SDM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSDM, setSelectedSDM] = useState<SDM | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingSDM, setEditingSDM] = useState<SDM | null>(null);

  useEffect(() => {
    fetchSDMData();
  }, []);

  const fetchSDMData = async () => {
    try {
      setLoading(true);
      const data = await sdmService.getAllSDM();
      setSdmList(data);
    } catch (error) {
      toast.error('Gagal mengambil data SDM');
      console.error('Error fetching SDM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSDMData();
      return;
    }

    try {
      setLoading(true);
      const data = await sdmService.searchSDM(searchTerm);
      setSdmList(data);
    } catch (error) {
      toast.error('Gagal mencari data SDM');
      console.error('Error searching SDM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSDM) return;

    try {
      await sdmService.deleteSDM(selectedSDM.id);
      toast.success('Data SDM berhasil dihapus');
      fetchSDMData();
      setShowDeleteModal(false);
      setSelectedSDM(null);
    } catch (error) {
      toast.error('Gagal menghapus data SDM');
      console.error('Error deleting SDM:', error);
    }
  };

  const openDeleteModal = (sdm: SDM) => {
    setSelectedSDM(sdm);
    setShowDeleteModal(true);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setEditingSDM(null);
    setShowForm(true);
  };

  const openEditForm = (sdm: SDM) => {
    setFormMode('edit');
    setEditingSDM(sdm);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingSDM(null);
    fetchSDMData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSDM(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'aktif' ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Aktif
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Non-Aktif
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Data SDM</h1>
      </div>

      {/* Search and Add Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari SDM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cari
          </button>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah SDM Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jabatan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keterangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sdmList.map((sdm) => (
              <tr key={sdm.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sdm.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sdm.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sdm.jabatan}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sdm.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sdm.username || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sdm.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(sdm.status)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {sdm.keterangan || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(sdm)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Navigate to view SDM details */}}
                      className="text-green-600 hover:text-green-900"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(sdm)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sdmList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data SDM ditemukan
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedSDM(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Data SDM"
        message={`Apakah Anda yakin ingin menghapus data SDM "${selectedSDM?.nama}"?`}
        confirmText="Hapus"
        cancelText="Batal"
      />

      {/* SDM Form Modal */}
      {showForm && (
        <SDMForm
          sdm={editingSDM}
          mode={formMode}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default SDMData; 