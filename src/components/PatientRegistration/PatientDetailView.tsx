import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Heart,
  FileText,
  Camera,
  X,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";
import { Patient, Registration } from "../../types";
import { patientService } from "../../services/patientService";
import { formatDate } from "../../utils/generators";

interface PatientDetailViewProps {
  registration?: Registration;
  patient?: Patient;
  onNavigateBack: () => void;
  onShowNotification?: (type: "success" | "error", message: string) => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  registration,
  patient: patientProp,
  onNavigateBack,
  onShowNotification,
}) => {
  const [patient, setPatient] = useState<Patient | null>(patientProp || null);
  const [loading, setLoading] = useState(!patientProp);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    // Jika patient sudah diberikan sebagai prop, tidak perlu fetch
    if (patientProp) {
      setPatient(patientProp);
      setLoading(false);
      return;
    }

    // Jika tidak ada patient prop, fetch berdasarkan registration
    if (registration?.patientId) {
      const fetchPatientData = async () => {
        try {
          setLoading(true);
          const patientData = await patientService.getPatientById(
            registration.patientId
          );
          setPatient(patientData as Patient);
        } catch (error) {
          console.error("Error fetching patient data:", error);
          onShowNotification?.("error", "Gagal memuat data pasien");
        } finally {
          setLoading(false);
        }
      };

      fetchPatientData();
    }
  }, [registration?.patientId, patientProp, onShowNotification]);

  const handleImageClick = (imageUrl: string | undefined) => {
    if (imageUrl) {
      setFullscreenImage(imageUrl);
    }
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <button
          onClick={onNavigateBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Data pasien tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const InfoSection = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | undefined | null;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <dt className="font-medium text-gray-700">{label}</dt>
      <dd className="md:col-span-2 text-gray-900">{value || "-"}</dd>
    </div>
  );

  const ImageGrid = ({
    images,
    title,
  }: {
    images: Array<{ label: string; url: string | undefined }>;
    title: string;
  }) => {
    const validImages = images.filter((img) => img.url);

    if (validImages.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">
          Tidak ada {title.toLowerCase()} yang tersedia
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {validImages.map((image, index) => (
          <div key={index} className="relative group">
            <div
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleImageClick(image.url)}
            >
              <img
                src={image.url}
                alt={image.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {image.label}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onNavigateBack}
          className="flex items-center space-x-2 text-black-600 hover:text-black-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{patient.namaLengkap}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-blue-100">
                  No. Rekam Medik: {patient.rekamMedik}
                </span>
                {registration && (
                  <>
                    <span className="text-blue-100">•</span>
                    <span className="text-blue-100">
                      ID Pendaftaran: {registration.idPendaftaran}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Pendaftaran - hanya tampil jika ada registration */}
          {registration && (
            <InfoSection title="Informasi Pendaftaran" icon={FileText}>
              <dl className="space-y-2">
                <InfoRow
                  label="No. Antrian"
                  value={registration.noAntrian?.toString()}
                />
                <InfoRow
                  label="Tanggal Pendaftaran"
                  value={formatDate(registration.tanggal)}
                />
                <InfoRow label="Status" value={registration.status} />
                <InfoRow label="Ruangan" value={registration.ruangan} />
                <InfoRow label="Dokter" value={registration.dokter} />
                <InfoRow
                  label="Nama Pengantar"
                  value={registration.namaPengantar}
                />
                <InfoRow
                  label="Telepon Pengantar"
                  value={registration.teleponPengantar}
                />
              </dl>
            </InfoSection>
          )}

          {/* Data Pribadi */}
          <InfoSection title="Data Pribadi" icon={User}>
            <dl className="space-y-2">
              <InfoRow label="Nama Lengkap" value={patient.namaLengkap} />
              <InfoRow label="Jenis Identitas" value={patient.jenisIdentitas} />
              <InfoRow label="Nomor Identitas" value={patient.nomorIdentitas} />
              <InfoRow label="Tempat Lahir" value={patient.tempatLahir} />
              <InfoRow
                label="Tanggal Lahir"
                value={formatDate(patient.tanggalLahir)}
              />
              <InfoRow label="Jenis Kelamin" value={patient.jenisKelamin} />
              <InfoRow
                label="Status Perkawinan"
                value={patient.statusPerkawinan}
              />
              {patient.namaSuami && (
                <InfoRow label="Nama Suami" value={patient.namaSuami} />
              )}
              <InfoRow label="Nama Ibu" value={patient.namaIbu} />
              <InfoRow label="Pendidikan" value={patient.pendidikan} />
              <InfoRow label="Pekerjaan" value={patient.pekerjaan} />
              <InfoRow
                label="Kewarganegaraan"
                value={patient.kewarganegaraan}
              />
              <InfoRow label="Agama" value={patient.agama} />
              <InfoRow label="Suku" value={patient.suku} />
              <InfoRow label="Bahasa" value={patient.bahasa} />
            </dl>
          </InfoSection>

          {/* Informasi Kontak */}
          <InfoSection title="Informasi Kontak" icon={Phone}>
            <dl className="space-y-2">
              <InfoRow label="Telepon" value={patient.telepon} />
              <InfoRow label="Alamat" value={patient.alamat} />
              <InfoRow label="RT" value={patient.rt} />
              <InfoRow label="RW" value={patient.rw} />
              <InfoRow label="Kelurahan" value={patient.kelurahan} />
              <InfoRow label="Kecamatan" value={patient.kecamatan} />
              <InfoRow label="Kabupaten" value={patient.kabupaten} />
              <InfoRow label="Provinsi" value={patient.provinsi} />
              <InfoRow label="Kode Pos" value={patient.kodePos} />
            </dl>
          </InfoSection>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Informasi Medis */}
          <InfoSection title="Informasi Medis" icon={Heart}>
            <dl className="space-y-2">
              <InfoRow label="Golongan Darah" value={patient.golonganDarah} />
            </dl>
          </InfoSection>

          {/* Penanggung Jawab */}
          <InfoSection title="Penanggung Jawab" icon={UserCheck}>
            <dl className="space-y-2">
              <InfoRow
                label="Hubungan"
                value={patient.hubunganPenanggungJawab}
              />
              <InfoRow label="Nama" value={patient.namaPenanggungJawab} />
              <InfoRow label="Telepon" value={patient.teleponPenanggungJawab} />
            </dl>
          </InfoSection>

          {/* Tanggal Dibuat */}
          <InfoSection title="Informasi Sistem" icon={Clock}>
            <dl className="space-y-2">
              <InfoRow
                label="Dibuat pada"
                value={patient.createdAt ? formatDate(patient.createdAt) : "-"}
              />
            </dl>
          </InfoSection>
        </div>
      </div>


      {/* Gambar Medis */}
      <InfoSection title="Foto Rontgen" icon={Camera}>
        <ImageGrid
          title="Foto Rontgen"
          images={[
            { label: "Gambar 1", url: patient.gambarKolom1 },
            { label: "Gambar 2", url: patient.gambarKolom2 },
            { label: "Gambar 3", url: patient.gambarKolom3 },
            { label: "Gambar 4", url: patient.gambarKolom4 },
            { label: "Gambar 5", url: patient.gambarKolom5 },
            { label: "Gambar 6", url: patient.gambarKolom6 },
            { label: "Gambar 7", url: patient.gambarKolom7 },
            { label: "Gambar 8", url: patient.gambarKolom8 },
            { label: "Gambar 9", url: patient.gambarKolom9 },
            { label: "Gambar 10", url: patient.gambarKolom10 },
            { label: "Gambar 11", url: patient.gambarKolom11 },
            { label: "Gambar 12", url: patient.gambarKolom12 },
            { label: "Gambar 13", url: patient.gambarKolom13 },
            { label: "Gambar 14", url: patient.gambarKolom14 },
            { label: "Gambar 15", url: patient.gambarKolom15 },
            { label: "Gambar 16", url: patient.gambarKolom16 },
            { label: "Gambar 17", url: patient.gambarKolom17 },
          ]}
        />
      </InfoSection>

      {/* Informed Consent */}
      {patient.informedConsent && (
        <InfoSection title="Informed Consent" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative group">
              <div
                className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleImageClick(patient.informedConsent)}
              >
                <img
                  src={patient.informedConsent}
                  alt="Informed Consent"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Informed Consent
              </p>
            </div>
          </div>
        </InfoSection>
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailView;
