import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Patient } from "../../types";
import Breadcrumb from "../Layout/Breadcrumb";
import { registrationService } from "../../services/registrationService";
import {
  jadwalKontrolService,
  JadwalKontrol,
} from "../../services/jadwalKontrolService";

// Setup localizer untuk calendar
const localizer = momentLocalizer(moment);

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

// Interface untuk event calendar
interface CalendarEvent extends Event {
  id: string;
  jadwalId: string;
  keterangan: string;
}

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
  const [jadwalKontrol, setJadwalKontrol] = useState<JadwalKontrol[]>([
    // Sample data untuk testing
    {
      id: "test-jadwal-1",
      patient_id: patient.id,
      tanggal_kontrol: "2025-08-15",
      keterangan: "Scaling gigi",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "test-jadwal-2",
      patient_id: patient.id,
      tanggal_kontrol: "2025-08-22",
      keterangan: "Bersihkan karang gigi",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
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

  // Fungsi untuk mengkonversi jadwal kontrol ke format calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    console.log("Converting jadwal kontrol to calendar events:", jadwalKontrol);
    const events = jadwalKontrol.map((jadwal) => ({
      id: jadwal.id,
      jadwalId: jadwal.id,
      title: jadwal.keterangan,
      keterangan: jadwal.keterangan,
      start: new Date(jadwal.tanggal_kontrol + "T09:00:00"),
      end: new Date(jadwal.tanggal_kontrol + "T10:00:00"),
      allDay: false,
    }));
    console.log("Generated calendar events:", events);
    return events;
  };

  // Custom style untuk event di calendar
  const eventStyleGetter = (event: CalendarEvent) => {
    const now = new Date();
    const eventDate = new Date(event.start!);
    const isPast = eventDate < now;
    const isToday = eventDate.toDateString() === now.toDateString();

    let backgroundColor = "#3B82F6"; // Default blue

    if (isPast) {
      backgroundColor = "#6B7280"; // Gray untuk jadwal yang sudah lewat
    } else if (isToday) {
      backgroundColor = "#10B981"; // Green untuk hari ini
    } else {
      // Warna berbeda berdasarkan tingkat urgensi
      const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil <= 3) {
        backgroundColor = "#F59E0B"; // Amber untuk 3 hari ke depan
      } else if (daysUntil <= 7) {
        backgroundColor = "#8B5CF6"; // Purple untuk seminggu ke depan
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: isPast ? 0.6 : 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "11px",
        fontWeight: "500",
        padding: "3px 6px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
    };
  };

  // Custom format untuk tanggal
  const formats = {
    monthHeaderFormat: "MMMM YYYY",
    dayHeaderFormat: "dddd, DD MMMM",
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format("DD MMM")} - ${moment(end).format(
        "DD MMM YYYY"
      )}`,
    agendaDateFormat: "dddd, DD MMMM",
    agendaTimeFormat: "HH:mm",
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
  };

  // Handle klik pada event di calendar
  const handleSelectEvent = (event: CalendarEvent) => {
    const eventDate = new Date(event.start!);
    const formattedDate = moment(event.start).format("dddd, DD MMMM YYYY");
    const now = new Date();
    const isPast = eventDate < now;
    const isToday = eventDate.toDateString() === now.toDateString();

    let statusText = "";
    if (isPast) {
      statusText = " (Sudah Lewat)";
    } else if (isToday) {
      statusText = " (Hari Ini)";
    } else {
      const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      statusText = ` (${daysUntil} hari lagi)`;
    }

    const message =
      `📅 Detail Jadwal Kontrol:\n\n` +
      `👤 Pasien: ${patient.namaLengkap}\n` +
      `📋 Rekam Medik: ${patient.rekamMedik}\n` +
      `📅 Tanggal: ${formattedDate}${statusText}\n` +
      `📝 Keterangan: ${event.keterangan}\n\n` +
      `❌ Apakah Anda yakin ingin menghapus jadwal kontrol ini?`;

    if (confirm(message)) {
      handleDeleteJadwal(event.jadwalId);
    }
  };

  // Handle klik pada slot tanggal kosong
  const handleSelectSlot = ({ start }: { start: Date }) => {
    const selectedDate = moment(start).format("YYYY-MM-DD");
    setNewJadwal((prev) => ({
      ...prev,
      tanggal_kontrol: selectedDate,
    }));
  };

  // Komponen kalender yang lebih advanced
  const AdvancedCalendar = () => {
    const events = getCalendarEvents();
    const totalJadwal = jadwalKontrol.length;
    const jadwalMendatang = jadwalKontrol.filter(
      (j) => new Date(j.tanggal_kontrol) >= new Date()
    ).length;

    return (
      <div className="space-y-4">
        {/* Header dengan statistik */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                📅 Kalender Jadwal Kontrol Pasien
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

        {/* Kalender */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              eventPropGetter={eventStyleGetter}
              formats={formats}
              messages={{
                next: "Selanjutnya",
                previous: "Sebelumnya",
                today: "Hari Ini",
                month: "Bulan",
                week: "Minggu",
                day: "Hari",
                agenda: "Agenda",
                date: "Tanggal",
                time: "Waktu",
                event: "Acara",
                noEventsInRange:
                  "Tidak ada jadwal kontrol dalam rentang tanggal ini.",
                showMore: (total) => `+${total} lainnya`,
              }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable={true}
              popup={true}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              step={60}
              showMultiDayTimes
              components={{
                event: ({ event }) => {
                  const eventDate = new Date(event.start!);
                  const now = new Date();
                  const isPast = eventDate < now;
                  const isToday =
                    eventDate.toDateString() === now.toDateString();

                  let icon = "🏥";
                  if (isPast) {
                    icon = "✅";
                  } else if (isToday) {
                    icon = "⏰";
                  } else {
                    const daysUntil = Math.ceil(
                      (eventDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    if (daysUntil <= 3) {
                      icon = "🔔"; // Urgent
                    }
                  }

                  return (
                    <div className="text-xs font-medium h-full flex flex-col justify-center">
                      <div className="font-semibold text-white flex items-center justify-center">
                        <span className="mr-1">{icon}</span>
                        Kontrol
                      </div>
                      <div className="text-xs opacity-95 truncate text-white text-center leading-tight">
                        {event.keterangan.length > 15
                          ? `${event.keterangan.substring(0, 12)}...`
                          : event.keterangan}
                      </div>
                    </div>
                  );
                },
                agenda: {
                  event: ({ event }) => {
                    const eventDate = new Date(event.start!);
                    const now = new Date();
                    const isPast = eventDate < now;
                    const isToday =
                      eventDate.toDateString() === now.toDateString();

                    let statusBadge = null;
                    let icon = "🏥";

                    if (isPast) {
                      statusBadge = (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          Selesai
                        </span>
                      );
                      icon = "✅";
                    } else if (isToday) {
                      statusBadge = (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          Hari Ini
                        </span>
                      );
                      icon = "⏰";
                    } else {
                      const daysUntil = Math.ceil(
                        (eventDate.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      if (daysUntil <= 3) {
                        statusBadge = (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                            Segera
                          </span>
                        );
                        icon = "🔔";
                      } else {
                        statusBadge = (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            Mendatang
                          </span>
                        );
                      }
                    }

                    return (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">{icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Jadwal Kontrol
                            </div>
                            <div className="text-sm text-gray-600">
                              {event.keterangan}
                            </div>
                          </div>
                        </div>
                        {statusBadge}
                      </div>
                    );
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Legend dan informasi */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-gray-700 mb-3">
                🔍 Cara Menggunakan Kalender:
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong>Klik pada jadwal</strong> untuk melihat detail dan
                    opsi hapus
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong>Klik tanggal kosong</strong> untuk mengisi form
                    tanggal otomatis
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    <strong>Gunakan tombol view</strong> untuk melihat
                    Bulan/Minggu/Hari/Agenda
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-3">
                📊 Ringkasan Jadwal:
              </div>
              {jadwalKontrol.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {jadwalKontrol.slice(0, 3).map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="truncate">
                        <strong>
                          {new Date(jadwal.tanggal_kontrol).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </strong>{" "}
                        - {jadwal.keterangan}
                      </span>
                    </div>
                  ))}
                  {jadwalKontrol.length > 3 && (
                    <div className="text-xs text-gray-500 italic">
                      ... dan {jadwalKontrol.length - 3} jadwal lainnya di
                      kalender
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Belum ada jadwal kontrol. Tambahkan jadwal baru menggunakan
                  form di atas.
                </div>
              )}
            </div>
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
              <AdvancedCalendar />
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
