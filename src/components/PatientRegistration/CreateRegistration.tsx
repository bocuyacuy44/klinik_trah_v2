import React, { useState, useEffect } from "react";
import { Patient } from "../../types";
import Breadcrumb from "../Layout/Breadcrumb";
import { registrationService } from "../../services/registrationService";
import {
  jadwalKontrolService,
  JadwalKontrol,
} from "../../services/jadwalKontrolService";

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
    dokter: "dr-kartini",
    namaPengantar: patient.namaLengkap,
    teleponPengantar: patient.telepon,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"assessment" | "image" | "jadwal">(
    "assessment"
  );

  // State untuk jadwal kontrol
  const [jadwalKontrol, setJadwalKontrol] = useState<JadwalKontrol[]>([]);
  const [newJadwal, setNewJadwal] = useState({
    tanggal_kontrol: "",
    keterangan: "",
  });
  const [jadwalLoading, setJadwalLoading] = useState(false);

  // Mock data untuk dropdown
  const dokterOptions = [
    { value: "dr-kartini", label: "dr. Sri Kartini Kussudiardjo, Sp.A" },
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
        // Buat tabel jika belum ada
        await jadwalKontrolService.createTableIfNotExists();
        // Load jadwal kontrol untuk pasien ini
        const jadwalData =
          await jadwalKontrolService.getJadwalKontrolByPatientId(patient.id);
        setJadwalKontrol(jadwalData);
      } catch (error) {
        console.error("Error loading jadwal kontrol:", error);
      }
    };

    loadJadwalKontrol();
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
      onRegistrationComplete();
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
  const handleAddJadwal = async (e: React.FormEvent) => {
    e.preventDefault();

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

  // Fungsi untuk menghapus jadwal kontrol
  const handleDeleteJadwal = async (jadwalId: string) => {
    if (!confirm("Yakin ingin menghapus jadwal kontrol ini?")) return;

    try {
      await jadwalKontrolService.deleteJadwalKontrol(jadwalId);
      setJadwalKontrol((prev) => prev.filter((j) => j.id !== jadwalId));
      onShowNotification?.("success", "Jadwal kontrol berhasil dihapus");
    } catch (error) {
      console.error("Error deleting jadwal kontrol:", error);
      onShowNotification?.("error", "Gagal menghapus jadwal kontrol");
    }
  };

  // Fungsi untuk generate warna berdasarkan bulan
  const getCalendarDayColor = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const jadwal = jadwalKontrol.find((j) => j.tanggal_kontrol === dateStr);

    if (jadwal) {
      return "bg-blue-500 text-white hover:bg-blue-600";
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateStr === today) {
      return "bg-green-500 text-white";
    }

    return "bg-gray-100 hover:bg-gray-200 text-gray-700";
  };

  // Komponen kalender sederhana
  const SimpleCalendar = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const days = [];

    // Empty cells untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDayWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // Hari-hari dalam bulan
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split("T")[0];
      const jadwal = jadwalKontrol.find((j) => j.tanggal_kontrol === dateStr);

      days.push(
        <div
          key={day}
          className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer ${getCalendarDayColor(
            date
          )}`}
          title={jadwal ? jadwal.keterangan : ""}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-center font-semibold text-lg mb-4">
          {monthNames[currentMonth]} {currentYear}
        </div>

        {/* Header hari */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid tanggal */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* Legend */}
        <div className="mt-4 text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Jadwal Kontrol</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Hari Ini</span>
          </div>
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
    id: "assessment" | "image" | "jadwal";
    label: string;
    isActive: boolean;
    onClick: (tab: "assessment" | "image" | "jadwal") => void;
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
        return (
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Konten Assessment akan ditampilkan di sini
            </p>
          </div>
        );
      case "image":
        return (
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Konten Image akan ditampilkan di sini
            </p>
          </div>
        );
      case "jadwal":
        return (
          <div className="p-6 space-y-6">
            {/* Form untuk menambah jadwal kontrol */}
            <form
              onSubmit={handleAddJadwal}
              className="bg-gray-50 p-4 rounded-lg"
            >
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
                  type="submit"
                  disabled={jadwalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {jadwalLoading ? "Menyimpan..." : "Tambah Jadwal"}
                </button>
              </div>
            </form>

            {/* Daftar jadwal kontrol yang sudah ada */}
            {jadwalKontrol.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Jadwal Kontrol Yang Sudah Ada
                </h4>
                {jadwalKontrol.map((jadwal) => (
                  <div
                    key={jadwal.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(jadwal.tanggal_kontrol).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {jadwal.keterangan}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteJadwal(jadwal.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Kalender */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Kalender Jadwal Kontrol
              </h4>
              <SimpleCalendar />
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
          </div>
        </div>

        {/* Bagian Tabel Riwayat Pasien */}
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
                  {/* Kosong untuk saat ini */}
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Belum ada riwayat kunjungan untuk pasien ini
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bagian Tab Dinamis */}
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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRegistration;
