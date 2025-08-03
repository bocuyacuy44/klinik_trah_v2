import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { Patient } from "../../types";
import Breadcrumb from "../Layout/Breadcrumb";
import { patientService } from "../../services/patientService";

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (patient: Omit<Patient, "id">, id?: string) => void;
  onCancel: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToPatients: () => void;
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  onNavigateToDashboard,
  onNavigateToPatients,
}) => {
  const isEditMode = !!patient?.id;

  // Initialize images state with existing images if in edit mode
  const initializeImages = () => {
    const initialImages = Array(17).fill({ preview: "", file: null });

    if (patient) {
      for (let i = 1; i <= 17; i++) {
        const key = `gambarKolom${i}` as keyof Patient;
        if (patient[key]) {
          initialImages[i - 1] = {
            preview: patient[key] as string,
            file: null, // File tidak diperlukan untuk pratinjau
          };
        }
      }
      // Pastikan fotoRontgen juga diinisialisasi jika ada
      if (patient.fotoRontgen) {
        const fotoRontgenUrls = patient.fotoRontgen.split(", ");
        fotoRontgenUrls.forEach((url, index) => {
          if (index < 17 && url) {
            initialImages[index] = { preview: url, file: null };
          }
        });
      }
    }
    return initialImages;
  };

  const [images, setImages] = useState<
    { preview: string; file: File | null }[]
  >(initializeImages());

  const [formData, setFormData] = useState<Omit<Patient, "id">>({
    rekamMedik: patient?.rekamMedik || "",
    namaLengkap: patient?.namaLengkap || "",
    jenisIdentitas: patient?.jenisIdentitas || "",
    nomorIdentitas: patient?.nomorIdentitas || "",
    tempatLahir: patient?.tempatLahir || "",
    tanggalLahir: formatDateForInput(patient?.tanggalLahir || "") || "",
    jenisKelamin: patient?.jenisKelamin || "",
    golonganDarah: patient?.golonganDarah || "",
    statusPerkawinan: patient?.statusPerkawinan || "",
    namaSuami: patient?.namaSuami || "",
    namaIbu: patient?.namaIbu || "",
    pendidikan: patient?.pendidikan || "",
    pekerjaan: patient?.pekerjaan || "",
    kewarganegaraan: patient?.kewarganegaraan || "",
    agama: patient?.agama || "",
    suku: patient?.suku || "",
    bahasa: patient?.bahasa || "",
    alamat: patient?.alamat || "",
    rt: patient?.rt || "",
    rw: patient?.rw || "",
    provinsi: patient?.provinsi || "",
    kabupaten: patient?.kabupaten || "",
    kecamatan: patient?.kecamatan || "",
    kelurahan: patient?.kelurahan || "",
    kodePos: patient?.kodePos || "",
    telepon: patient?.telepon || "",
    hubunganPenanggungJawab: patient?.hubunganPenanggungJawab || "",
    namaPenanggungJawab: patient?.namaPenanggungJawab || "",
    teleponPenanggungJawab: patient?.teleponPenanggungJawab || "",
    fotoRontgen: patient?.fotoRontgen || "",
    gambarKolom1: patient?.gambarKolom1 || "",
    gambarKolom2: patient?.gambarKolom2 || "",
    gambarKolom3: patient?.gambarKolom3 || "",
    gambarKolom4: patient?.gambarKolom4 || "",
    gambarKolom5: patient?.gambarKolom5 || "",
    gambarKolom6: patient?.gambarKolom6 || "",
    gambarKolom7: patient?.gambarKolom7 || "",
    gambarKolom8: patient?.gambarKolom8 || "",
    gambarKolom9: patient?.gambarKolom9 || "",
    gambarKolom10: patient?.gambarKolom10 || "",
    gambarKolom11: patient?.gambarKolom11 || "",
    gambarKolom12: patient?.gambarKolom12 || "",
    gambarKolom13: patient?.gambarKolom13 || "",
    gambarKolom14: patient?.gambarKolom14 || "",
    gambarKolom15: patient?.gambarKolom15 || "",
    gambarKolom16: patient?.gambarKolom16 || "",
    gambarKolom17: patient?.gambarKolom17 || "",
    informedConsent: patient?.informedConsent || "",
    createdAt: patient?.createdAt || new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);

  // Function to check if URL is a valid server URL
  const isValidServerUrl = (url: string): boolean => {
    return (
      typeof url === "string" &&
      (url.startsWith("http://") || url.startsWith("https://")) &&
      !url.startsWith("blob:")
    );
  };

  // Helper function to create fotoRontgen string that preserves positions
  const createFotoRontgenString = (
    imagesArray: { preview: string; file: File | null }[]
  ): string => {
    return imagesArray
      .map((img) => img.preview || "") // Keep empty strings to preserve positions
      .join(", ");
  };

  // Add useEffect to reinitialize images when patient changes
  useEffect(() => {
    if (patient) {
      const initialImages = Array(17).fill({ preview: "", file: null });

      // Use fotoRontgen as primary source since it preserves positions
      if (patient.fotoRontgen) {
        const fotoRontgenUrls = patient.fotoRontgen.split(", ");
        fotoRontgenUrls.forEach((url, index) => {
          if (index < 17) {
            initialImages[index] = {
              preview: url || "",
              file: null,
            };
          }
        });
      } else {
        // Fallback to individual kolom fields if fotoRontgen is empty
        for (let i = 1; i <= 17; i++) {
          const key = `gambarKolom${i}` as keyof Patient;
          if (patient[key] && isValidServerUrl(patient[key] as string)) {
            initialImages[i - 1] = {
              preview: patient[key] as string,
              file: null,
            };
          }
        }
      }

      setImages(initialImages);
    }
  }, [patient]);

  const labels = [
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namaLengkap.trim())
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    if (!formData.jenisIdentitas)
      newErrors.jenisIdentitas = "Jenis identitas wajib dipilih";
    if (!formData.nomorIdentitas.trim())
      newErrors.nomorIdentitas = "Nomor identitas wajib diisi";
    if (!formData.tempatLahir.trim())
      newErrors.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.tanggalLahir)
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.jenisKelamin)
      newErrors.jenisKelamin = "Jenis kelamin wajib dipilih";
    if (!formData.namaIbu.trim()) newErrors.namaIbu = "Nama ibu wajib diisi";
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (!formData.telepon.trim()) newErrors.telepon = "Telepon wajib diisi";
    if (!formData.hubunganPenanggungJawab)
      newErrors.hubunganPenanggungJawab =
        "Hubungan penanggung jawab wajib dipilih";
    if (!formData.namaPenanggungJawab.trim())
      newErrors.namaPenanggungJawab = "Nama penanggung jawab wajib diisi";
    if (!formData.teleponPenanggungJawab.trim())
      newErrors.teleponPenanggungJawab = "Telepon penanggung jawab wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Modify handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create a fresh patientData object with current formData
        const patientData: Omit<Patient, "id"> = {
          ...formData,
        };

        // Update individual kolom fields from current images state
        images.forEach((img, index) => {
          const key = `gambarKolom${index + 1}` as keyof typeof patientData;
          patientData[key] = img.preview || "";
        });

        // Rebuild fotoRontgen string from current images state
        patientData.fotoRontgen = createFotoRontgenString(images);

        onSubmit(patientData, patient?.id);
      } catch (error) {
        console.error("Error submitting patient:", error);
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Modify handleImageChange to update both images and formData
  const handleImageChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload image to server
        const imageUrl = await patientService.uploadImage(file);

        const newImages = [...images];
        newImages[index] = { preview: imageUrl, file };
        setImages(newImages);

        // Update formData with all individual kolom fields
        setFormData((prev) => {
          const updatedFormData = { ...prev };

          // Update all individual kolom fields based on current images state
          newImages.forEach((img, imgIndex) => {
            const key = `gambarKolom${imgIndex + 1}` as keyof typeof formData;
            updatedFormData[key] = img.preview || "";
          });

          // Rebuild fotoRontgen string from current images state
          updatedFormData.fotoRontgen = createFotoRontgenString(newImages);

          return updatedFormData;
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        // You might want to show an error notification here
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = { preview: "", file: null }; // Clear the image at the specified index
    setImages(newImages);

    // Update formData with all individual kolom fields and fotoRontgen
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      // Update all individual kolom fields based on current images state
      newImages.forEach((img, imgIndex) => {
        const key = `gambarKolom${imgIndex + 1}` as keyof typeof formData;
        updatedFormData[key] = img.preview || "";
      });

      // Rebuild fotoRontgen string from current images state
      updatedFormData.fotoRontgen = createFotoRontgenString(newImages);

      return updatedFormData;
    });
  };
  const handleClearAllImages = () => {
    setImages(Array(17).fill({ preview: "", file: null }));
    setFormData((prev) => ({
      ...prev,
      fotoRontgen: createFotoRontgenString(
        Array(17).fill({ preview: "", file: null })
      ),
      gambarKolom1: "",
      gambarKolom2: "",
      gambarKolom3: "",
      gambarKolom4: "",
      gambarKolom5: "",
      gambarKolom6: "",
      gambarKolom7: "",
      gambarKolom8: "",
      gambarKolom9: "",
      gambarKolom10: "",
      gambarKolom11: "",
      gambarKolom12: "",
      gambarKolom13: "",
      gambarKolom14: "",
      gambarKolom15: "",
      gambarKolom16: "",
      gambarKolom17: "",
    }));
  };

  // Update handleSaveImages to maintain consistency
  const handleSaveImages = () => {
    // Create fresh formData update
    const updatedFormData = { ...formData };

    // Update individual kolom fields from current images state
    images.forEach((img, index) => {
      const key = `gambarKolom${index + 1}` as keyof typeof formData;
      updatedFormData[key] = img.preview || "";
    });

    // Rebuild fotoRontgen string from current images state
    updatedFormData.fotoRontgen = createFotoRontgenString(images);

    setFormData(updatedFormData);
    setShowPopup(false);
  };

  const hasSelectedImages = images.some((img) => img.preview);

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", onClick: onNavigateToDashboard },
          { label: "Data Pasien", onClick: onNavigateToPatients },
          {
            label: isEditMode ? "Edit Pasien" : "Tambah Pasien Baru",
            active: true,
          },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? "Edit Pasien" : "Tambah Pasien Baru"}
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Data Pribadi */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Pribadi
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Rekam Medik
                </label>
                <input
                  type="text"
                  value={formData.rekamMedik}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    handleInputChange("namaLengkap", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.namaLengkap ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.namaLengkap && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.namaLengkap}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Identitas
                </label>
                <select
                  value={formData.jenisIdentitas}
                  onChange={(e) =>
                    handleInputChange("jenisIdentitas", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.jenisIdentitas ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Pilih Jenis Identitas</option>
                  <option value="KTP">KTP</option>
                  <option value="SIM">SIM</option>
                  <option value="Passport">Passport</option>
                </select>
                {errors.jenisIdentitas && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.jenisIdentitas}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Identitas
                </label>
                <input
                  type="text"
                  value={formData.nomorIdentitas}
                  onChange={(e) =>
                    handleInputChange("nomorIdentitas", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomorIdentitas ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.nomorIdentitas && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nomorIdentitas}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={(e) =>
                    handleInputChange("tempatLahir", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tempatLahir ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.tempatLahir && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tempatLahir}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) =>
                    handleInputChange("tanggalLahir", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggalLahir ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.tanggalLahir && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tanggalLahir}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) =>
                    handleInputChange("jenisKelamin", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.jenisKelamin ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                {errors.jenisKelamin && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.jenisKelamin}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Golongan Darah
                </label>
                <select
                  value={formData.golonganDarah}
                  onChange={(e) =>
                    handleInputChange("golonganDarah", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Perkawinan
                </label>
                <select
                  value={formData.statusPerkawinan}
                  onChange={(e) =>
                    handleInputChange("statusPerkawinan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Status Perkawinan</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Cerai">Cerai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Suami
                </label>
                <input
                  type="text"
                  value={formData.namaSuami}
                  onChange={(e) =>
                    handleInputChange("namaSuami", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Ibu
                </label>
                <input
                  type="text"
                  value={formData.namaIbu}
                  onChange={(e) => handleInputChange("namaIbu", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.namaIbu ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.namaIbu && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaIbu}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pendidikan
                </label>
                <select
                  value={formData.pendidikan}
                  onChange={(e) =>
                    handleInputChange("pendidikan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pekerjaan
                </label>
                <select
                  value={formData.pekerjaan}
                  onChange={(e) =>
                    handleInputChange("pekerjaan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Pekerjaan</option>
                  <option value="PNS">PNS</option>
                  <option value="Swasta">Swasta</option>
                  <option value="Wiraswasta">Wiraswasta</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Pensiunan">Pensiunan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kewarganegaraan
                </label>
                <select
                  value={formData.kewarganegaraan}
                  onChange={(e) =>
                    handleInputChange("kewarganegaraan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kewarganegaraan</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Asing">Asing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agama
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) => handleInputChange("agama", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Agama</option>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suku
                </label>
                <input
                  type="text"
                  value={formData.suku}
                  onChange={(e) => handleInputChange("suku", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bahasa
                </label>
                <input
                  type="text"
                  value={formData.bahasa}
                  onChange={(e) => handleInputChange("bahasa", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Alamat */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alamat
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => handleInputChange("alamat", e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.alamat ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.alamat && (
                  <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RT
                  </label>
                  <input
                    type="text"
                    value={formData.rt}
                    onChange={(e) => handleInputChange("rt", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RW
                  </label>
                  <input
                    type="text"
                    value={formData.rw}
                    onChange={(e) => handleInputChange("rw", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <select
                  value={formData.provinsi}
                  onChange={(e) =>
                    handleInputChange("provinsi", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Provinsi</option>
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Banten">Banten</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kabupaten/Kota
                </label>
                <select
                  value={formData.kabupaten}
                  onChange={(e) =>
                    handleInputChange("kabupaten", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  <option value="Jakarta Pusat">Jakarta Pusat</option>
                  <option value="Jakarta Utara">Jakarta Utara</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Barat">Jakarta Barat</option>
                  <option value="Jakarta Timur">Jakarta Timur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan
                </label>
                <select
                  value={formData.kecamatan}
                  onChange={(e) =>
                    handleInputChange("kecamatan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kecamatan</option>
                  <option value="Menteng">Menteng</option>
                  <option value="Gambir">Gambir</option>
                  <option value="Tanah Abang">Tanah Abang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelurahan
                </label>
                <select
                  value={formData.kelurahan}
                  onChange={(e) =>
                    handleInputChange("kelurahan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kelurahan</option>
                  <option value="Menteng">Menteng</option>
                  <option value="Pegangsaan">Pegangsaan</option>
                  <option value="Cikini">Cikini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.kodePos}
                  onChange={(e) => handleInputChange("kodePos", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.telepon}
                  onChange={(e) => handleInputChange("telepon", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.telepon ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.telepon && (
                  <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>
                )}
              </div>
            </div>

            {/* Penanggung Jawab Pasien */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Penanggung Jawab Pasien
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hubungan dengan Pasien
                </label>
                <select
                  value={formData.hubunganPenanggungJawab}
                  onChange={(e) =>
                    handleInputChange("hubunganPenanggungJawab", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hubunganPenanggungJawab
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Pilih Hubungan</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Teman">Teman</option>
                  <option value="Tetangga">Tetangga</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Saya Sendiri">Saya Sendiri</option>
                </select>
                {errors.hubunganPenanggungJawab && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.hubunganPenanggungJawab}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.namaPenanggungJawab}
                  onChange={(e) =>
                    handleInputChange("namaPenanggungJawab", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.namaPenanggungJawab
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.namaPenanggungJawab && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.namaPenanggungJawab}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.teleponPenanggungJawab}
                  onChange={(e) =>
                    handleInputChange("teleponPenanggungJawab", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.teleponPenanggungJawab
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.teleponPenanggungJawab && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.teleponPenanggungJawab}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Rontgen
                </label>
                <button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Upload Gambar</span>
                </button>
                {formData.fotoRontgen && (
                  <p className="mt-2 text-sm text-gray-600">
                    {
                      formData.fotoRontgen
                        .split(", ")
                        .filter((url) => url && isValidServerUrl(url)).length
                    }{" "}
                    gambar terupload
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Gambar Informed Consent
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Klik untuk upload foto Informed Consent
                  </p>
                  {formData.informedConsent && (
                    <div className="mt-2">
                      <img
                        src={formData.informedConsent}
                        alt="Informed Consent"
                        className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                        style={{ maxHeight: "200px" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            informedConsent: "",
                          }));
                        }}
                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await patientService.uploadImage(
                            file
                          );
                          setFormData((prev) => ({
                            ...prev,
                            informedConsent: imageUrl,
                          }));
                        } catch (error) {
                          console.error(
                            "Error uploading informed consent:",
                            error
                          );
                        }
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-7 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Upload Gambar</h3>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-4 items-stretch">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="space-y-2 flex flex-col items-center relative"
                    >
                      <div
                        className="w-32 h-32 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-white relative"
                        onMouseEnter={(e) => {
                          const div = e.currentTarget;
                          div
                            .querySelector(".hover-label")
                            ?.classList.remove("opacity-0");
                          div
                            .querySelector(".hover-label")
                            ?.classList.add("opacity-100");
                        }}
                        onMouseLeave={(e) => {
                          const div = e.currentTarget;
                          div
                            .querySelector(".hover-label")
                            ?.classList.remove("opacity-100");
                          div
                            .querySelector(".hover-label")
                            ?.classList.add("opacity-0");
                        }}
                      >
                        {img.preview ? (
                          <img
                            src={img.preview}
                            alt={labels[index]}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              // If image fails to load, show placeholder
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://mhdc.co.id/wp-content/uploads//Rontgen-gigi-panoramik.jpg";
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        ) : (
                          <>
                            {index < 11 ? (
                              <img
                                src={`/assets/img/gambar_kolom${index + 1}.png`}
                                alt={`Placeholder ${labels[index]}`}
                                className="max-w-full max-h-full object-contain opacity-70"
                                onError={(e) => {
                                  // If local image fails to load, show default placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://mhdc.co.id/wp-content/uploads//Rontgen-gigi-panoramik.jpg";
                                  target.onerror = null; // Prevent infinite loop
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 text-sm font-medium">
                                Gambar extra {index - 10}
                              </div>
                            )}
                          </>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center text-center justify-center text-white text-base opacity-0 transition-opacity hover-label">
                          {labels[index]}
                        </div>
                        <label className="absolute inset-0 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="hidden"
                          />
                        </label>
                        {img.preview && (
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={handleClearAllImages}
                    disabled={!hasSelectedImages}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      !hasSelectedImages
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    Hapus
                  </button>
                  <button
                    onClick={handleSaveImages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
