const API_BASE_URL = "http://localhost:3001";

interface AssessmentHistory {
  id: string;
  patient_id: string;
  dokter: string;
  assessment: string;
  waktu: string;
}

interface AssessmentDetails {
  id: string;
  patient_id: string;
  dokter: string;
  assessment: string;
  waktu: string;
  keluhan_utama?: string;
  alergi_obat?: string;
  alergi_obat_detail?: string;
  alergi_makanan?: string;
  alergi_makanan_detail?: string;
  tekanan_darah?: string;
  penyakit_jantung?: string;
  hemofilia?: string;
  hepatitis?: string;
  gastritis?: string;
  selected_icd10?: any;
  selected_icd9?: any;
  selected_resep?: any;
  tindakan_nama?: string;
  tindakan_jumlah?: number;
  tindakan_biaya?: number;
  tindakan_total?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateAssessmentData {
  patient_id: string;
  formData: {
    keluhanUtama: string;
    alergiObat: string;
    alergiObatDetail: string;
    alergiMakanan: string;
    alergiMakananDetail: string;
    tekananDarah: string;
    penyakitJantung: string;
    hemofilia: string;
    hepatitis: string;
    gastritis: string;
  };
  selectedICD10: any[];
  selectedICD9: any[];
  selectedTindakan: any[];
  selectedResep: any[];
}

interface ICD10Item {
  kode: string;
  nama: string;
}

interface ICD9Item {
  kode: string;
  nama: string;
}

export const assessmentService = {
  // === ICD DATA METHODS ===
  async createICDTables(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/create-icd-tables`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("ICD tables created/verified");
    } catch (error) {
      console.error("Error creating ICD tables:", error);
      throw error;
    }
  },

  async getICD10Data(): Promise<ICD10Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/icd10-dental`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching ICD10 data:", error);
      throw error;
    }
  },

  async searchICD10(query: string): Promise<ICD10Item[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/icd10-dental/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching ICD10 data:", error);
      throw error;
    }
  },

  async getICD9Data(): Promise<ICD9Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/icd9-dental`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching ICD9 data:", error);
      throw error;
    }
  },

  async searchICD9(query: string): Promise<ICD9Item[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/icd9-dental/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching ICD9 data:", error);
      throw error;
    }
  },

  // === ASSESSMENT METHODS ===
  async createAssessmentTable(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/create-assessment-table`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Assessment table created/verified");
    } catch (error) {
      console.error("Error creating assessment table:", error);
      throw error;
    }
  },

  async getAssessmentHistory(patientId: string): Promise<AssessmentHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${patientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      throw error;
    }
  },

  async getAssessmentDetails(id: string): Promise<AssessmentDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/detail/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      throw error;
    }
  },

  async createAssessment(assessmentData: CreateAssessmentData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menyimpan assessment: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }
  },

  async updateAssessment(
    id: string,
    assessmentData: any
  ): Promise<AssessmentDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal memperbarui assessment: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }
  },

  async deleteAssessment(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gagal menghapus assessment: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      throw error;
    }
  },
};
