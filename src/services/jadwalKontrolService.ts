export interface JadwalKontrol {
  id: string; // Changed from number to string (UUID)
  patient_id: string;
  tanggal_kontrol: string;
  keterangan: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJadwalKontrol {
  patient_id: string;
  tanggal_kontrol: string;
  keterangan: string;
}

export interface UpdateJadwalKontrol {
  tanggal_kontrol: string;
  keterangan: string;
}

class JadwalKontrolService {
  private baseUrl = "http://localhost:3001";

  // Mock data untuk development
  private mockJadwalData: { [patientId: string]: JadwalKontrol[] } = {};
  private mockIdCounter = 1;

  // Generate mock UUID
  private generateMockUuid(): string {
    return `mock-uuid-${this.mockIdCounter++}-${Date.now()}`;
  }

  async getJadwalKontrolByPatientId(
    patientId: string
  ): Promise<JadwalKontrol[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jadwal-kontrol/${patientId}`
      );
      if (!response.ok) {
        throw new Error("API not available");
      }
      return response.json();
    } catch (error) {
      // Fallback ke mock data jika API tidak tersedia
      console.log("Using mock data for jadwal kontrol");
      return this.mockJadwalData[patientId] || [];
    }
  }

  async createJadwalKontrol(
    jadwalData: CreateJadwalKontrol
  ): Promise<JadwalKontrol> {
    try {
      const response = await fetch(`${this.baseUrl}/jadwal-kontrol`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jadwalData),
      });

      if (!response.ok) {
        throw new Error("API not available");
      }
      return response.json();
    } catch (error) {
      // Fallback ke mock data
      console.log("Using mock data for create jadwal kontrol");
      const newJadwal: JadwalKontrol = {
        id: this.generateMockUuid(),
        patient_id: jadwalData.patient_id,
        tanggal_kontrol: jadwalData.tanggal_kontrol,
        keterangan: jadwalData.keterangan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!this.mockJadwalData[jadwalData.patient_id]) {
        this.mockJadwalData[jadwalData.patient_id] = [];
      }
      this.mockJadwalData[jadwalData.patient_id].push(newJadwal);

      return newJadwal;
    }
  }

  async updateJadwalKontrol(
    id: string,
    jadwalData: UpdateJadwalKontrol
  ): Promise<JadwalKontrol> {
    try {
      const response = await fetch(`${this.baseUrl}/jadwal-kontrol/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jadwalData),
      });

      if (!response.ok) {
        throw new Error("API not available");
      }
      return response.json();
    } catch (error) {
      // Fallback ke mock data
      console.log("Using mock data for update jadwal kontrol");

      for (const patientId in this.mockJadwalData) {
        const jadwalIndex = this.mockJadwalData[patientId].findIndex(
          (j) => j.id === id
        );
        if (jadwalIndex !== -1) {
          this.mockJadwalData[patientId][jadwalIndex] = {
            ...this.mockJadwalData[patientId][jadwalIndex],
            tanggal_kontrol: jadwalData.tanggal_kontrol,
            keterangan: jadwalData.keterangan,
            updated_at: new Date().toISOString(),
          };
          return this.mockJadwalData[patientId][jadwalIndex];
        }
      }

      throw new Error("Jadwal not found");
    }
  }

  async deleteJadwalKontrol(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jadwal-kontrol/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("API not available");
      }
    } catch (error) {
      // Fallback ke mock data
      console.log("Using mock data for delete jadwal kontrol");

      for (const patientId in this.mockJadwalData) {
        const jadwalIndex = this.mockJadwalData[patientId].findIndex(
          (j) => j.id === id
        );
        if (jadwalIndex !== -1) {
          this.mockJadwalData[patientId].splice(jadwalIndex, 1);
          return;
        }
      }

      throw new Error("Jadwal not found");
    }
  }

  async createTableIfNotExists(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/create-jadwal-table`);
      if (!response.ok) {
        throw new Error("API not available");
      }
    } catch (error) {
      // Mock mode - tidak perlu buat tabel
      console.log("Running in mock mode - no table creation needed");
    }
  }
}

export const jadwalKontrolService = new JadwalKontrolService();
