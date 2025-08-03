const API_BASE_URL = "http://localhost:3001";

interface Patient {
  id: string;
  rekamMedik: string;
  namaLengkap: string;
  jenisIdentitas: string;
  nomorIdentitas: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  golonganDarah?: string;
  statusPerkawinan?: string;
  namaSuami?: string;
  namaIbu: string;
  pendidikan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  agama?: string;
  suku?: string;
  bahasa?: string;
  alamat: string;
  rt?: string;
  rw?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  kodePos?: string;
  telepon: string;
  hubunganPenanggungJawab: string;
  namaPenanggungJawab: string;
  teleponPenanggungJawab: string;
  fotoRontgen?: string;
  gambarKolom1?: string;
  gambarKolom2?: string;
  gambarKolom3?: string;
  gambarKolom4?: string;
  gambarKolom5?: string;
  gambarKolom6?: string;
  gambarKolom7?: string;
  gambarKolom8?: string;
  gambarKolom9?: string;
  gambarKolom10?: string;
  gambarKolom11?: string;
  gambarKolom12?: string;
  gambarKolom13?: string;
  gambarKolom14?: string;
  gambarKolom15?: string;
  gambarKolom16?: string;
  gambarKolom17?: string;
  informedConsent?: string;
  createdAt?: string;
  updatedAt?: string;
}

const convertToPatient = (data: any): Patient => ({
  id: data.id,
  rekamMedik: data.rekam_medik,
  namaLengkap: data.nama_lengkap,
  jenisIdentitas: data.jenis_identitas,
  nomorIdentitas: data.nomor_identitas,
  tempatLahir: data.tempat_lahir,
  tanggalLahir: data.tanggal_lahir,
  jenisKelamin: data.jenis_kelamin,
  golonganDarah: data.golongan_darah,
  statusPerkawinan: data.status_perkawinan,
  namaSuami: data.nama_suami,
  namaIbu: data.nama_ibu,
  pendidikan: data.pendidikan,
  pekerjaan: data.pekerjaan,
  kewarganegaraan: data.kewarganegaraan,
  agama: data.agama,
  suku: data.suku,
  bahasa: data.bahasa,
  alamat: data.alamat,
  rt: data.rt,
  rw: data.rw,
  provinsi: data.provinsi,
  kabupaten: data.kabupaten,
  kecamatan: data.kecamatan,
  kelurahan: data.kelurahan,
  kodePos: data.kode_pos,
  telepon: data.telepon,
  hubunganPenanggungJawab: data.hubungan_penanggung_jawab,
  namaPenanggungJawab: data.nama_penanggung_jawab,
  teleponPenanggungJawab: data.telepon_penanggung_jawab,
  fotoRontgen: data.foto_rontgen,
  gambarKolom1: data.gambar_kolom1,
  gambarKolom2: data.gambar_kolom2,
  gambarKolom3: data.gambar_kolom3,
  gambarKolom4: data.gambar_kolom4,
  gambarKolom5: data.gambar_kolom5,
  gambarKolom6: data.gambar_kolom6,
  gambarKolom7: data.gambar_kolom7,
  gambarKolom8: data.gambar_kolom8,
  gambarKolom9: data.gambar_kolom9,
  gambarKolom10: data.gambar_kolom10,
  gambarKolom11: data.gambar_kolom11,
  gambarKolom12: data.gambar_kolom12,
  gambarKolom13: data.gambar_kolom13,
  gambarKolom14: data.gambar_kolom14,
  gambarKolom15: data.gambar_kolom15,
  gambarKolom16: data.gambar_kolom16,
  gambarKolom17: data.gambar_kolom17,
  informedConsent: data.informed_consent,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const patientService = {
  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(convertToPatient);
    } catch (error) {
      console.error("Error in getAllPatients:", error);
      throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal upload gambar: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  },

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API_BASE_URL}/upload-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal upload gambar: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.imageUrls.map((item: any) => item.url);
    } catch (error) {
      console.error("Error in uploadMultipleImages:", error);
      throw error;
    }
  },

  async createPatient(patient: Omit<Patient, "id">): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rekam_medik: patient.rekamMedik,
          nama_lengkap: patient.namaLengkap,
          jenis_identitas: patient.jenisIdentitas,
          nomor_identitas: patient.nomorIdentitas,
          tempat_lahir: patient.tempatLahir,
          tanggal_lahir: patient.tanggalLahir,
          jenis_kelamin: patient.jenisKelamin,
          golongan_darah: patient.golonganDarah,
          status_perkawinan: patient.statusPerkawinan,
          nama_suami: patient.namaSuami,
          nama_ibu: patient.namaIbu,
          pendidikan: patient.pendidikan,
          pekerjaan: patient.pekerjaan,
          kewarganegaraan: patient.kewarganegaraan,
          agama: patient.agama,
          suku: patient.suku,
          bahasa: patient.bahasa,
          alamat: patient.alamat,
          rt: patient.rt,
          rw: patient.rw,
          provinsi: patient.provinsi,
          kabupaten: patient.kabupaten,
          kecamatan: patient.kecamatan,
          kelurahan: patient.kelurahan,
          kode_pos: patient.kodePos,
          telepon: patient.telepon,
          hubungan_penanggung_jawab: patient.hubunganPenanggungJawab,
          nama_penanggung_jawab: patient.namaPenanggungJawab,
          telepon_penanggung_jawab: patient.teleponPenanggungJawab,
          foto_rontgen: patient.fotoRontgen,
          gambar_kolom1: patient.gambarKolom1,
          gambar_kolom2: patient.gambarKolom2,
          gambar_kolom3: patient.gambarKolom3,
          gambar_kolom4: patient.gambarKolom4,
          gambar_kolom5: patient.gambarKolom5,
          gambar_kolom6: patient.gambarKolom6,
          gambar_kolom7: patient.gambarKolom7,
          gambar_kolom8: patient.gambarKolom8,
          gambar_kolom9: patient.gambarKolom9,
          gambar_kolom10: patient.gambarKolom10,
          gambar_kolom11: patient.gambarKolom11,
          gambar_kolom12: patient.gambarKolom12,
          gambar_kolom13: patient.gambarKolom13,
          gambar_kolom14: patient.gambarKolom14,
          gambar_kolom15: patient.gambarKolom15,
          gambar_kolom16: patient.gambarKolom16,
          gambar_kolom17: patient.gambarKolom17,
          informed_consent: patient.informedConsent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menyimpan pasien: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return convertToPatient(data);
    } catch (error) {
      console.error("Error in createPatient:", error);
      throw error;
    }
  },

  async deletePatient(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menghapus pasien: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error in deletePatient:", error);
      throw error;
    }
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rekam_medik: patient.rekamMedik,
          nama_lengkap: patient.namaLengkap,
          jenis_identitas: patient.jenisIdentitas,
          nomor_identitas: patient.nomorIdentitas,
          tempat_lahir: patient.tempatLahir,
          tanggal_lahir: patient.tanggalLahir,
          jenis_kelamin: patient.jenisKelamin,
          golongan_darah: patient.golonganDarah,
          status_perkawinan: patient.statusPerkawinan,
          nama_suami: patient.namaSuami,
          nama_ibu: patient.namaIbu,
          pendidikan: patient.pendidikan,
          pekerjaan: patient.pekerjaan,
          kewarganegaraan: patient.kewarganegaraan,
          agama: patient.agama,
          suku: patient.suku,
          bahasa: patient.bahasa,
          alamat: patient.alamat,
          rt: patient.rt,
          rw: patient.rw,
          provinsi: patient.provinsi,
          kabupaten: patient.kabupaten,
          kecamatan: patient.kecamatan,
          kelurahan: patient.kelurahan,
          kode_pos: patient.kodePos,
          telepon: patient.telepon,
          hubungan_penanggung_jawab: patient.hubunganPenanggungJawab,
          nama_penanggung_jawab: patient.namaPenanggungJawab,
          telepon_penanggung_jawab: patient.teleponPenanggungJawab,
          foto_rontgen: patient.fotoRontgen,
          gambar_kolom1: patient.gambarKolom1,
          gambar_kolom2: patient.gambarKolom2,
          gambar_kolom3: patient.gambarKolom3,
          gambar_kolom4: patient.gambarKolom4,
          gambar_kolom5: patient.gambarKolom5,
          gambar_kolom6: patient.gambarKolom6,
          gambar_kolom7: patient.gambarKolom7,
          gambar_kolom8: patient.gambarKolom8,
          gambar_kolom9: patient.gambarKolom9,
          gambar_kolom10: patient.gambarKolom10,
          gambar_kolom11: patient.gambarKolom11,
          gambar_kolom12: patient.gambarKolom12,
          gambar_kolom13: patient.gambarKolom13,
          gambar_kolom14: patient.gambarKolom14,
          gambar_kolom15: patient.gambarKolom15,
          gambar_kolom16: patient.gambarKolom16,
          gambar_kolom17: patient.gambarKolom17,
          informed_consent: patient.informedConsent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal memperbarui pasien: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return convertToPatient(data);
    } catch (error) {
      console.error("Error in updatePatient:", error);
      throw error;
    }
  },

  async getPatientById(id: string): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal mengambil data pasien: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return convertToPatient(data);
    } catch (error) {
      console.error("Error in getPatientById:", error);
      throw error;
    }
  },

  async generateRekamMedik(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-rekam-medik`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menghasilkan rekam medik: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return data.rekamMedik;
    } catch (error) {
      console.error("Error in generateRekamMedik:", error);
      throw error;
    }
  },
};
