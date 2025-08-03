const API_BASE_URL = "http://localhost:3001";

interface Registration {
  id: string;
  idPendaftaran: string;
  noAntrian: number;
  tanggal: string;
  patientId: string;
  status: string;
  ruangan?: string;
  dokter?: string;
  namaPengantar?: string;
  teleponPengantar?: string;
  noRekamMedik?: string;
  pasien?: string;
}

const convertToRegistration = (data: any): Registration => ({
  id: data.id,
  idPendaftaran: data.id_pendaftaran,
  noAntrian: data.no_antrian,
  tanggal: data.tanggal,
  patientId: data.patient_id,
  status: data.status,
  ruangan: data.ruangan,
  dokter: data.dokter,
  namaPengantar: data.nama_pengantar,
  teleponPengantar: data.telepon_pengantar,
  noRekamMedik: data.no_rekam_medik,
  pasien: data.pasien,
});

export const registrationService = {
  async createRegistration(
    patientId: string,
    ruangan: string,
    dokter: string,
    namaPengantar: string,
    teleponPengantar: string
  ): Promise<Registration> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          ruangan,
          dokter,
          nama_pengantar: namaPengantar,
          telepon_pengantar: teleponPengantar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menyimpan pendaftaran: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return convertToRegistration(data);
    } catch (error) {
      console.error("Error in createRegistration:", error);
      throw error;
    }
  },

  async updateRegistration(
    id: string,
    patientId: string,
    ruangan: string,
    dokter: string,
    namaPengantar: string,
    teleponPengantar: string
  ): Promise<Registration> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          ruangan,
          dokter,
          nama_pengantar: namaPengantar,
          telepon_pengantar: teleponPengantar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal memperbarui pendaftaran: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return convertToRegistration(data);
    } catch (error) {
      console.error("Error in updateRegistration:", error);
      throw error;
    }
  },

  async getAllRegistrations(): Promise<Registration[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal mengambil data pendaftaran: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return data.map(convertToRegistration);
    } catch (error) {
      console.error("Error in getAllRegistrations:", error);
      throw error;
    }
  },

  async deleteRegistration(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menghapus pendaftaran: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error in deleteRegistration:", error);
      throw error;
    }
  },
};
