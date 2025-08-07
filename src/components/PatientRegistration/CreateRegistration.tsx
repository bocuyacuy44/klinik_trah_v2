import React, { useState, useEffect } from "react";
import moment from "moment";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Patient } from "../../types";
import Breadcrumb from "../Layout/Breadcrumb";
import Assessment from "./Assessment";
import { registrationService } from "../../services/registrationService";
import {
  jadwalKontrolService,
  JadwalKontrol,
} from "../../services/jadwalKontrolService";

// Konfigurasi bahasa Indonesia untuk moment
moment.locale("id", {
  months:
    "Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember".split(
      "_"
    ),
  monthsShort: "Jan_Feb_Mar_Apr_Mei_Jun_Jul_Agu_Sep_Okt_Nov_Des".split("_"),
  weekdays: "Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu".split("_"),
  weekdaysShort: "Min_Sen_Sel_Rab_Kam_Jum_Sab".split("_"),
  weekdaysMin: "Mi_Sn_Sl_Rb_Km_Jm_Sb".split("_"),
});

interface CreateRegistrationProps {
  patient: Patient;
  onNavigateToDashboard: () => void;
  onNavigateToRegistration: () => void;
  onNavigateToSelectPatient: () => void;
  onShowNotification?: (type: "success" | "error", message: string) => void;
  onRegistrationComplete: () => void;
}

const CreateRegistration: React.FC<CreateRegistrationProps> = ({
  patient,
  onNavigateToDashboard,
  onNavigateToRegistration,
  onNavigateToSelectPatient,
  onShowNotification,
  onRegistrationComplete,
}) => {
  const [formData, setFormData] = useState({
    ruangan: "poli-klinik-gigi",
    dokter: "drg-fahrul",
    namaPengantar: patient.namaLengkap,
    teleponPengantar: patient.telepon,
  });

  const [loading, setLoading] = useState(false);
  const [jadwalLoading, setJadwalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "assessment" | "image" | "lembarPersetujuan" | "jadwal"
  >("assessment");

  // State untuk modal detail jadwal
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalKontrol | null>(
    null
  );

  // State untuk modal konfirmasi hapus
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [jadwalToDelete, setJadwalToDelete] = useState<JadwalKontrol | null>(
    null
  );

  // State untuk jadwal kontrol
  const [jadwalKontrol, setJadwalKontrol] = useState<JadwalKontrol[]>([
    // Sample data untuk testing dengan tanggal yang lebih dekat
    {
      id: "test-jadwal-1",
      patient_id: patient.id,
      tanggal_kontrol: "2025-03-20", // Format YYYY-MM-DD
      keterangan: "Scaling gigi",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "test-jadwal-2",
      patient_id: patient.id,
      tanggal_kontrol: "2025-03-25", // Format YYYY-MM-DD
      keterangan: "Kontrol rutin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "test-jadwal-3",
      patient_id: patient.id,
      tanggal_kontrol: moment().format("YYYY-MM-DD"), // Hari ini dengan format yang benar
      keterangan: "Pemeriksaan hari ini",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [newJadwal, setNewJadwal] = useState({
    tanggal_kontrol: "",
    keterangan: "",
  });
  // State untuk modal full-screen image
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>("");

  // State untuk riwayat pasien
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

  // Mock data untuk dropdown
  const dokterOptions = [
    { value: "drg-fahrul", label: "drg. Moehammad Fahrul Rozi, Sp.Ort" },
  ];

  const poliklinikOptions = [
    { value: "poli-klinik-gigi", label: "Poli Klinik Gigi" },
  ];

  // Fungsi untuk mendapatkan tanggal dan jam saat ini
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const time = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  // Load jadwal kontrol saat component mount
  useEffect(() => {
    const loadJadwalKontrol = async () => {
      try {
        console.log("Loading jadwal kontrol for patient:", patient.id);
        // Buat tabel jika belum ada
        await jadwalKontrolService.createTableIfNotExists();
        // Load jadwal kontrol untuk pasien ini
        const jadwalData =
          await jadwalKontrolService.getJadwalKontrolByPatientId(patient.id);
        console.log("Loaded jadwal data:", jadwalData);
        setJadwalKontrol(jadwalData);
      } catch (error) {
        console.error("Error loading jadwal kontrol:", error);
      }
    };

    loadJadwalKontrol();
  }, [patient.id]);

  // Load riwayat pasien saat component mount
  useEffect(() => {
    const loadPatientHistory = async () => {
      try {
        console.log("Loading patient history for patient:", patient.id);
        const historyData =
          await registrationService.getRegistrationsByPatientId(patient.id);
        console.log("Loaded history data:", historyData);
        setPatientHistory(historyData);
      } catch (error) {
        console.error("Error loading patient history:", error);
      }
    };

    loadPatientHistory();
  }, [patient.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ruangan || !formData.dokter) {
      onShowNotification?.(
        "error",
        "Mohon lengkapi semua field yang wajib diisi"
      );
      return;
    }

    try {
      setLoading(true);
      await registrationService.createRegistration(
        patient.id,
        formData.ruangan,
        formData.dokter,
        formData.namaPengantar,
        formData.teleponPengantar
      );
      onShowNotification?.("success", "Pendaftaran pasien berhasil disimpan");

      // Reload riwayat pasien setelah pendaftaran berhasil
      try {
        const historyData =
          await registrationService.getRegistrationsByPatientId(patient.id);
        setPatientHistory(historyData);
      } catch (error) {
        console.error("Error reloading patient history:", error);
      }

      // Reset form ke default values (opsional)
      setFormData({
        ruangan: "poli-klinik-gigi",
        dokter: "drg-fahrul",
        namaPengantar: patient.namaLengkap,
        teleponPengantar: patient.telepon,
      });

      // Jangan panggil onRegistrationComplete() agar tidak pindah halaman
      // onRegistrationComplete();
    } catch (error) {
      console.error("Error creating registration:", error);
      onShowNotification?.("error", "Gagal menyimpan pendaftaran pasien");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigateToSelectPatient();
  };

  // Fungsi untuk menambah jadwal kontrol
  const handleAddJadwal = async () => {
    if (!newJadwal.tanggal_kontrol || !newJadwal.keterangan) {
      onShowNotification?.("error", "Tanggal dan keterangan harus diisi");
      return;
    }

    try {
      setJadwalLoading(true);
      const createdJadwal = await jadwalKontrolService.createJadwalKontrol({
        patient_id: patient.id,
        tanggal_kontrol: newJadwal.tanggal_kontrol,
        keterangan: newJadwal.keterangan,
      });

      setJadwalKontrol((prev) =>
        [...prev, createdJadwal].sort(
          (a, b) =>
            new Date(a.tanggal_kontrol).getTime() -
            new Date(b.tanggal_kontrol).getTime()
        )
      );
      setNewJadwal({ tanggal_kontrol: "", keterangan: "" });
      onShowNotification?.("success", "Jadwal kontrol berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding jadwal kontrol:", error);
      onShowNotification?.("error", "Gagal menambahkan jadwal kontrol");
    } finally {
      setJadwalLoading(false);
    }
  };

  const handleDeleteJadwal = async (jadwalId: string) => {
    try {
      await jadwalKontrolService.deleteJadwalKontrol(jadwalId);
      setJadwalKontrol((prev) => prev.filter((j) => j.id !== jadwalId));
      onShowNotification?.("success", "Jadwal kontrol berhasil dihapus");
    } catch (error) {
      console.error("Error deleting jadwal kontrol:", error);
      onShowNotification?.("error", "Gagal menghapus jadwal kontrol");
    }
  };

  // Labels untuk setiap kolom gambar (sama dengan di PatientForm)
  const imageLabels = [
    "Gambar Muka Samping",
    "Gambar Muka Depan",
    "Gambar Gigi Depan",
    "Gambar Gigi Belakang",
    "Gambar Muka Samping 2",
    "Gambar Muka Depan 2",
    "Gambar Gigi Depan 2",
    "Gambar Gigi Belakang 2",
    "Gambar Muka Samping 3",
    "Gambar Muka Depan 3",
    "Gambar Gigi Depan 3",
    "Gambar Gigi Belakang 3",
    "Gambar Tambahan 1",
    "Gambar Tambahan 2",
    "Gambar Tambahan 3",
    "Gambar Tambahan 4",
    "Gambar Tambahan 5",
  ];

  // Fungsi untuk membuka image dalam full screen
  const handleImageClick = (imageUrl: string, title: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  // Komponen Modal Full-Screen Image
  const ImageFullScreenModal = () => {
    if (!showImageModal || !selectedImage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="relative max-w-full max-h-full">
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={selectedImage}
              alt={selectedImageTitle}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://mhdc.co.id/wp-content/uploads//Rontgen-gigi-panoramik.jpg";
                target.onerror = null;
              }}
            />
            {/* Image Title */}
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-white font-medium text-center">
                {selectedImageTitle}
              </p>
              <p className="text-white text-sm text-center opacity-80">
                Pasien: {patient.namaLengkap} | RM: {patient.rekamMedik}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Komponen untuk menampilkan konten tab image (tanpa informed consent)
  const ImageTabContent = () => {
    // Mengumpulkan semua gambar dari patient data, kecuali informed consent
    const patientImages = [];

    // Mengambil gambar dari gambarKolom1 sampai gambarKolom17
    for (let i = 1; i <= 17; i++) {
      const imageKey = `gambarKolom${i}` as keyof typeof patient;
      const imageUrl = patient[imageKey] as string;

      if (imageUrl && imageUrl.trim()) {
        patientImages.push({
          url: imageUrl,
          title: imageLabels[i - 1],
          column: i,
        });
      }
    }

    // Tidak menambahkan informed consent di sini lagi - sudah dipindah ke tab terpisah

    return (
      <div className="p-6">
        {patientImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">
              Belum ada gambar tersimpan
            </p>
            <p className="text-gray-400 text-sm">
              Gambar akan ditampilkan setelah diinputkan melalui form pasien
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    Gambar Pasien
                  </h4>
                  <p className="text-sm text-gray-600">
                    Total: <strong>{patientImages.length} gambar</strong>{" "}
                    tersimpan
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div className="font-medium">{patient.namaLengkap}</div>
                  <div>RM: {patient.rekamMedik}</div>
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {patientImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleImageClick(image.url, image.title)}
                >
                  {/* Image Container */}
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://mhdc.co.id/wp-content/uploads//Rontgen-gigi-panoramik.jpg";
                        target.onerror = null;
                      }}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Column Number Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {image.column}
                      </span>
                    </div>
                  </div>

                  {/* Image Title */}
                  <div className="p-3">
                    <h5 className="font-medium text-gray-900 text-sm leading-tight">
                      {image.title}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      Kolom {image.column}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h6 className="font-medium text-gray-900 text-sm mb-1">
                    Petunjuk Penggunaan:
                  </h6>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Klik pada gambar untuk melihat dalam ukuran penuh</li>
                    <li>• Angka pada badge menunjukkan kolom gambar</li>
                    <li>• Gambar diurutkan berdasarkan kolom</li>
                    <li>
                      • Untuk melihat lembar persetujuan, gunakan tab "Lembar
                      Persetujuan"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Komponen untuk menampilkan konten tab lembar persetujuan (informed consent)
  const LembarPersetujuanTabContent = () => {
    // Cek apakah ada informed consent
    const hasInformedConsent =
      patient.informedConsent && patient.informedConsent.trim();

    if (!hasInformedConsent) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">
              Belum ada lembar persetujuan tersimpan
            </p>
            <p className="text-gray-400 text-sm">
              Lembar persetujuan (informed consent) akan ditampilkan setelah
              diinputkan melalui form pasien
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Lembar Persetujuan (Informed Consent)
                </h4>
                <p className="text-sm text-gray-600">
                  Dokumen persetujuan tindakan medis dari pasien
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="font-medium">{patient.namaLengkap}</div>
                <div>RM: {patient.rekamMedik}</div>
              </div>
            </div>
          </div>

          {/* Informed Consent Image */}
          <div className="flex justify-center">
            <div
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer max-w-lg"
              onClick={() =>
                handleImageClick(patient.informedConsent, "Informed Consent")
              }
            >
              {/* Image Container */}
              <div className="relative">
                <img
                  src={patient.informedConsent}
                  alt="Informed Consent"
                  className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://mhdc.co.id/wp-content/uploads//Rontgen-gigi-panoramik.jpg";
                    target.onerror = null;
                  }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Informed Consent Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium shadow-md">
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Informed Consent
                  </span>
                </div>
              </div>

              {/* Image Title */}
              <div className="p-4 bg-gray-50">
                <h5 className="font-medium text-gray-900 text-base leading-tight text-center">
                  Lembar Persetujuan Tindakan Medis
                </h5>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Klik untuk melihat dalam ukuran penuh
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h6 className="font-medium text-gray-900 text-sm mb-1">
                  Informasi Lembar Persetujuan:
                </h6>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>
                    • Dokumen ini berisi persetujuan pasien untuk tindakan medis
                  </li>
                  <li>• Klik pada gambar untuk melihat dalam ukuran penuh</li>
                  <li>
                    • Lembar persetujuan adalah bagian penting dari rekam medis
                  </li>
                  <li>• Pastikan semua informasi tercantum dengan jelas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h6 className="font-medium text-gray-900 text-sm mb-1">
                  Data Pasien:
                </h6>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
                  <div>
                    <span className="font-medium">Nama:</span>{" "}
                    {patient.namaLengkap}
                  </div>
                  <div>
                    <span className="font-medium">RM:</span>{" "}
                    {patient.rekamMedik}
                  </div>
                  <div>
                    <span className="font-medium">Tanggal Lahir:</span>{" "}
                    {new Date(patient.tanggalLahir).toLocaleDateString("id-ID")}
                  </div>
                  <div>
                    <span className="font-medium">Telepon:</span>{" "}
                    {patient.telepon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Komponen Modal Konfirmasi Hapus
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirmModal || !jadwalToDelete) return null;

    const jadwalDate = new Date(jadwalToDelete.tanggal_kontrol);
    const formattedDate = jadwalDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const handleConfirmDelete = async () => {
      setShowDeleteConfirmModal(false);
      setJadwalToDelete(null);
      await handleDeleteJadwal(jadwalToDelete.id);
    };

    const handleCancelDelete = () => {
      setShowDeleteConfirmModal(false);
      setJadwalToDelete(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-modal-enter">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus Jadwal
              </h3>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Yakin ingin menghapus jadwal kontrol ini?
              </h4>
              <p className="text-sm text-gray-600">
                Tindakan ini tidak dapat dibatalkan. Jadwal kontrol akan dihapus
                secara permanen.
              </p>
            </div>

            {/* Schedule Details */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-2">
                Detail Jadwal yang akan dihapus:
              </h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Pasien:</span>
                  <span className="font-medium text-red-900">
                    {patient.namaLengkap}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Tanggal:</span>
                  <span className="font-medium text-red-900">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Keterangan:</span>
                  <span className="font-medium text-red-900">
                    {jadwalToDelete.keterangan}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>Peringatan:</strong> Data yang sudah dihapus tidak
                    dapat dikembalikan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Ya, Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const JadwalDetailModal = () => {
    if (!showJadwalModal || !selectedJadwal) return null;

    const jadwalDate = new Date(selectedJadwal.tanggal_kontrol);
    const isPast = jadwalDate < new Date();
    const isToday = jadwalDate.toDateString() === new Date().toDateString();

    const formattedDate = jadwalDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let statusText = "";
    let statusColor = "";
    let statusIcon = "";

    if (isPast) {
      statusText = "Sudah Lewat";
      statusColor = "text-gray-600 bg-gray-100";
      statusIcon = "✅";
    } else if (isToday) {
      statusText = "Hari Ini";
      statusColor = "text-green-600 bg-green-100";
      statusIcon = "⏰";
    } else {
      const daysUntil = Math.ceil(
        (jadwalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      statusText = `${daysUntil} hari lagi`;
      statusColor = "text-blue-600 bg-blue-100";
      statusIcon = "🏥";
    }

    const handleDeleteConfirm = async () => {
      setShowJadwalModal(false);
      setSelectedJadwal(null);
      // Tampilkan modal konfirmasi delete
      setJadwalToDelete(selectedJadwal);
      setShowDeleteConfirmModal(true);
    };

    const handleCloseModal = () => {
      setShowJadwalModal(false);
      setSelectedJadwal(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-modal-enter">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Jadwal Kontrol
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
              >
                <span className="mr-2">{statusIcon}</span>
                {statusText}
              </span>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Informasi Pasien
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{patient.namaLengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rekam Medik:</span>
                  <span className="font-medium">{patient.rekamMedik}</span>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Detail Jadwal</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium text-right">
                    {formattedDate}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Keterangan:</span>
                  <span className="font-medium text-right max-w-[200px]">
                    {selectedJadwal.keterangan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const FullCalendarComponent = () => {
    const totalJadwal = jadwalKontrol.length;
    const jadwalMendatang = jadwalKontrol.filter(
      (j) => new Date(j.tanggal_kontrol) >= new Date()
    ).length;

    // Convert jadwal to FullCalendar events
    const events = jadwalKontrol.map((jadwal) => {
      const jadwalDate = new Date(jadwal.tanggal_kontrol);
      const isPast = jadwalDate < new Date();
      const isToday = jadwalDate.toDateString() === new Date().toDateString();

      let color = "#3b82f6"; // blue for future
      if (isPast) {
        color = "#6b7280"; // gray for past
      } else if (isToday) {
        color = "#10b981"; // green for today
      }

      return {
        id: jadwal.id,
        title: jadwal.keterangan,
        date: jadwal.tanggal_kontrol,
        allDay: true, // Menandai sebagai event sepanjang hari
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          isPast,
          isToday,
          jadwal,
        },
      };
    });

    const handleDateClick = (arg: any) => {
      // Empty date clicked - set date in form
      const selectedDate = arg.dateStr;
      setNewJadwal((prev) => ({
        ...prev,
        tanggal_kontrol: selectedDate,
      }));
    };

    const handleEventClick = (arg: any) => {
      const jadwal = arg.event.extendedProps.jadwal;
      setSelectedJadwal(jadwal);
      setShowJadwalModal(true);
    };

    return (
      <div className="space-y-4">
        {/* Header dengan statistik */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Kalender Jadwal Kontrol Pasien
              </h4>
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Total Jadwal: <strong>{totalJadwal}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Mendatang: <strong>{jadwalMendatang}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">Pasien: {patient.namaLengkap}</div>
              <div>RM: {patient.rekamMedik}</div>
            </div>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="id"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            buttonText={{
              today: "Hari Ini",
              prev: "‹",
              next: "›",
            }}
            dayHeaderFormat={{ weekday: "short" }}
            firstDay={1} // Monday
            eventDisplay="block"
            eventTextColor="white"
            dayMaxEvents={3}
            moreLinkText="lainnya"
            displayEventTime={false} // Menyembunyikan tampilan waktu
            eventDidMount={(info) => {
              // Add hover tooltip
              info.el.title = `${info.event.title} - Klik untuk detail`;

              // Add emoji based on status
              const statusIcon = info.event.extendedProps.isPast
                ? "✅"
                : info.event.extendedProps.isToday
                ? "⏰"
                : "🏥";

              const titleElement = info.el.querySelector(".fc-event-title");
              if (titleElement) {
                titleElement.innerHTML = `${statusIcon} ${info.event.title}`;
              }
            }}
            dayCellClassNames={(arg) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const cellDate = new Date(arg.date);
              cellDate.setHours(0, 0, 0, 0);

              if (cellDate.getTime() === today.getTime()) {
                return ["bg-blue-50", "border-blue-200"];
              }
              return [];
            }}
          />
        </div>
      </div>
    );
  };

  // Tab component untuk menampilkan konten tab
  const TabButton = ({
    id,
    label,
    isActive,
    onClick,
  }: {
    id: "assessment" | "image" | "lembarPersetujuan" | "jadwal";
    label: string;
    isActive: boolean;
    onClick: (
      tab: "assessment" | "image" | "lembarPersetujuan" | "jadwal"
    ) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        isActive
          ? "text-blue-600 border-blue-600 bg-blue-50"
          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "assessment":
        return <Assessment patient={patient} />;
      case "image":
        return <ImageTabContent />;
      case "lembarPersetujuan":
        return <LembarPersetujuanTabContent />;
      case "jadwal":
        return (
          <div className="p-6 space-y-6">
            {/* Form untuk menambah jadwal kontrol */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">
                Tambah Jadwal Kontrol
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kontrol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newJadwal.tanggal_kontrol}
                    onChange={(e) =>
                      setNewJadwal((prev) => ({
                        ...prev,
                        tanggal_kontrol: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJadwal.keterangan}
                    onChange={(e) =>
                      setNewJadwal((prev) => ({
                        ...prev,
                        keterangan: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan keterangan jadwal kontrol"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddJadwal}
                  disabled={jadwalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {jadwalLoading ? "Menyimpan..." : "Tambah Jadwal"}
                </button>
              </div>
            </div>

            {/* Daftar jadwal kontrol yang sudah ada - sekarang akan ditampilkan di kalender */}

            {/* Kalender */}
            <div>
              <FullCalendarComponent />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", onClick: onNavigateToDashboard },
          { label: "Pendaftaran Pasien", onClick: onNavigateToRegistration },
          { label: "Pilih Pasien", onClick: onNavigateToSelectPatient },
          { label: "Buat Pendaftaran Pasien", active: true },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Pendaftaran Pasien
      </h1>

      {/* Form hanya untuk pendaftaran pasien */}
      <form onSubmit={handleSubmit}>
        {/* Bagian Data Pribadi Pasien */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Data Pribadi Pasien
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tanggal Daftar & Jam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Daftar & Jam
                </label>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed">
                    {currentDate}
                  </p>
                  <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed">
                    {currentTime}
                  </p>
                </div>
              </div>

              {/* Rekam Medis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rekam Medis
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {patient.rekamMedik}
                </p>
              </div>

              {/* Nama Pasien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pasien
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {patient.namaLengkap}
                </p>
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {new Date(patient.tanggalLahir).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Inputan Dokter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dokter <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dokter}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dokter: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Dokter</option>
                  {dokterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inputan Poliklinik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poliklinik <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ruangan}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ruangan: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Poliklinik</option>
                  {poliklinikOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons untuk Pendaftaran Pasien */}
            <div className="mt-6 pt-4 border-t border-gray-200">
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
                  {loading ? "Menyimpan..." : "Simpan Pendaftaran"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Bagian Tabel Riwayat Pasien - di luar form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Riwayat Pasien
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pendaftaran / ID Pendaftaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunjungan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assesmen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Belum ada riwayat kunjungan untuk pasien ini
                    </td>
                  </tr>
                ) : (
                  patientHistory
                    .sort(
                      (a, b) =>
                        new Date(a.tanggal).getTime() -
                        new Date(b.tanggal).getTime()
                    )
                    .map((history, index) => {
                      // Hitung nomor kunjungan berdasarkan tanggal yang berbeda
                      const uniqueDates = [
                        ...new Set(
                          patientHistory
                            .filter((_, idx) => idx <= index)
                            .map((h) => new Date(h.tanggal).toDateString())
                        ),
                      ];
                      const visitNumber = uniqueDates.length;

                      const formattedDate = new Date(
                        history.tanggal
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });

                      // Tentukan dokter yang ditampilkan
                      const doctorName =
                        history.dokter === "drg-fahrul"
                          ? "drg. Moehammad Fahrul Rozi, Sp.Ort"
                          : history.dokter === "dr-kartini"
                          ? "dr. Sri Kartini Kussudiardjo, Sp.A"
                          : history.dokter || "-";

                      // Tentukan nama poliklinik berdasarkan value
                      const poliklinikName =
                        history.ruangan === "poli-klinik-gigi"
                          ? "Poli Klinik Gigi"
                          : history.ruangan || "-";

                      return (
                        <tr key={history.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {formattedDate}
                              </span>
                              <span className="text-xs text-gray-500">
                                {history.idPendaftaran}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {poliklinikName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {doctorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                // Buka tab assessment
                                setActiveTab("assessment");
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                              title="Lihat Assessment"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                // Buka tab image
                                setActiveTab("image");
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                              title="Lihat Gambar"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                              title="Lihat Resep"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bagian Tab Dinamis - di luar form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 pt-6">
          <div className="flex space-x-1 border-b border-gray-200">
            <TabButton
              id="assessment"
              label="Tab Assesmen"
              isActive={activeTab === "assessment"}
              onClick={setActiveTab}
            />
            <TabButton
              id="image"
              label="Tab Image"
              isActive={activeTab === "image"}
              onClick={setActiveTab}
            />
            <TabButton
              id="lembarPersetujuan"
              label="Lembar Persetujuan"
              isActive={activeTab === "lembarPersetujuan"}
              onClick={setActiveTab}
            />
            <TabButton
              id="jadwal"
              label="Tab Jadwal Kontrol"
              isActive={activeTab === "jadwal"}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Konten Tab */}
        <div className="min-h-[200px]">{renderTabContent()}</div>
      </div>

      {/* Modal Detail Jadwal */}
      <JadwalDetailModal />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal />

      {/* Modal Full Screen Image */}
      <ImageFullScreenModal />
    </div>
  );
};

export default CreateRegistration;
