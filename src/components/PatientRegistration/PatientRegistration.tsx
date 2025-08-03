import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RegistrationTable from "./RegistrationTable";
import ConfirmationModal from "../UI/ConfirmationModal";
import { Registration, Patient } from "../../types";
import { registrationService } from "../../services/registrationService";
import { patientService } from "../../services/patientService";

interface PatientRegistrationProps {
  onNavigateToPatients: () => void;
  onNavigateToNewPatient: () => void;
  onNavigateToSelectPatient: () => void;
  onNavigateToEditRegistration: (
    patient: Patient,
    registration: Registration
  ) => void;
  onNavigateToPatientDetail: (registration: Registration) => void;
  onShowNotification?: (type: "success" | "error", message: string) => void;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onNavigateToPatients,
  onNavigateToNewPatient,
  onNavigateToSelectPatient,
  onNavigateToEditRegistration,
  onNavigateToPatientDetail,
  onShowNotification,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    registration: Registration | null;
    loading: boolean;
  }>({
    isOpen: false,
    registration: null,
    loading: false,
  });

  // Fungsi untuk mengambil data pendaftaran dari Supabase
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await registrationService.getAllRegistrations();
        setRegistrations(data);
      } catch (error) {
        console.error("Gagal mengambil data pendaftaran:", error);
      }
    };

    fetchRegistrations();
  }, []);

  const handleEdit = async (registration: Registration) => {
    try {
      const patient = await patientService.getPatientById(
        registration.patientId
      );
      if (patient) {
        onNavigateToEditRegistration(patient as Patient, registration);
      } else {
        onShowNotification?.("error", "Pasien tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching patient for edit:", error);
      onShowNotification?.("error", "Gagal memuat data pasien untuk edit");
    }
  };

  const handleView = (registration: Registration) => {
    onNavigateToPatientDetail(registration);
  };

  /**
   * Menangani penghapusan pendaftaran dengan konfirmasi dan notifikasi.
   * @param registration Registration yang akan dihapus
   */
  const handleDelete = async (registration: Registration) => {
    setDeleteModal({
      isOpen: true,
      registration,
      loading: false,
    });
  };

  const confirmDeleteRegistration = async () => {
    if (!deleteModal.registration) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await registrationService.deleteRegistration(deleteModal.registration.id);
      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== deleteModal.registration!.id)
      );
      onShowNotification?.("success", "Data pendaftaran berhasil dibatalkan");
      setDeleteModal({ isOpen: false, registration: null, loading: false });
    } catch (error) {
      console.error("Gagal membatalkan data:", error);
      onShowNotification?.("error", "Gagal membatalkan data pendaftaran");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteRegistration = () => {
    setDeleteModal({ isOpen: false, registration: null, loading: false });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pendaftaran Pasien
        </h1>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={onNavigateToSelectPatient}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pendaftaran Pasien Lama</span>
          </button>

          <button
            onClick={onNavigateToNewPatient}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pendaftaran Pasien Baru</span>
          </button>
        </div>
      </div>

      <RegistrationTable
        registrations={registrations}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Batalkan Pendaftaran"
        message={`Apakah Anda yakin ingin membatalkan pendaftaran dengan ID "${deleteModal.registration?.idPendaftaran}" untuk pasien "${deleteModal.registration?.pasien}"? Tindakan ini tidak dapat dibatalkan.`}
        type="warning"
        confirmText="Ya, Batalkan"
        cancelText="Batal"
        onConfirm={confirmDeleteRegistration}
        onCancel={cancelDeleteRegistration}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default PatientRegistration;
