import React, { useState, useEffect } from "react";
import { Search, Plus, Save, RotateCcw } from "lucide-react";
import { Patient } from "../../types";
import { assessmentService } from "../../services/assessmentService";

interface AssessmentProps {
  patient: Patient;
}

interface AssessmentHistory {
  id: string;
  waktu: string;
  dokter: string;
  assessment: string;
}

interface ICD10Item {
  kode: string;
  nama: string;
  jenis: string;
}

interface ICD9Item {
  kode: string;
  nama: string;
}

interface TindakanItem {
  nama: string;
  jumlah: number;
  biaya: number;
  total: number;
}

interface ResepItem {
  nama: string;
  jumlah: string;
  signa: string;
}

const Assessment: React.FC<AssessmentProps> = ({ patient }) => {
  // State untuk riwayat assessment
  const [assessmentHistory, setAssessmentHistory] = useState<
    AssessmentHistory[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk form assessment
  const [formData, setFormData] = useState({
    // Anamnesis
    keluhanUtama: "",
    alergiObat: "tidak",
    alergiObatDetail: "",
    alergiMakanan: "tidak",
    alergiMakananDetail: "",

    // Medical History
    tekananDarah: "",
    penyakitJantung: "tidak",
    hemofilia: "tidak",
    hepatitis: "tidak",
    gastritis: "tidak",
  });

  // State untuk modal dan data yang dipilih
  const [showICD10Modal, setShowICD10Modal] = useState(false);
  const [showICD9Modal, setShowICD9Modal] = useState(false);
  const [showTindakanModal, setShowTindakanModal] = useState(false);
  const [showResepModal, setShowResepModal] = useState(false);

  // State untuk data yang dipilih
  const [selectedICD10, setSelectedICD10] = useState<ICD10Item[]>([]);
  const [selectedICD9, setSelectedICD9] = useState<ICD9Item[]>([]);
  const [selectedTindakan, setSelectedTindakan] = useState<TindakanItem[]>([]);
  const [selectedResep, setSelectedResep] = useState<ResepItem[]>([]);

  // State untuk form modal
  const [icd10Search, setIcd10Search] = useState("");
  const [icd9Search, setIcd9Search] = useState("");
  const [tindakanForm, setTindakanForm] = useState({
    nama: "",
    jumlah: 1,
    biaya: 0,
  });
  const [resepForm, setResepForm] = useState({
    nama: "",
    jumlah: "",
    signa: "",
  });

  // Sample data ICD 10
  const sampleICD10 = [
    { kode: "K02.1", nama: "Karies dentin", jenis: "Primer" },
    { kode: "K02.9", nama: "Karies gigi, tidak spesifik", jenis: "Sekunder" },
    { kode: "K04.0", nama: "Pulpitis", jenis: "Primer" },
    { kode: "K05.0", nama: "Gingivitis akut", jenis: "Primer" },
    { kode: "K08.1", nama: "Kehilangan gigi karena trauma", jenis: "Sekunder" },
  ];

  // Sample data ICD 9
  const sampleICD9 = [
    { kode: "23.01", nama: "Pencabutan gigi" },
    { kode: "23.3", nama: "Pembersihan gigi dan scaling" },
    { kode: "23.41", nama: "Penambalan gigi dengan amalgam" },
    { kode: "23.42", nama: "Penambalan gigi dengan komposit" },
    { kode: "23.43", nama: "Penambalan gigi dengan semen" },
  ];

  // Filter functions
  const filteredICD10 = sampleICD10.filter(
    (item) =>
      item.kode.toLowerCase().includes(icd10Search.toLowerCase()) ||
      item.nama.toLowerCase().includes(icd10Search.toLowerCase())
  );

  const filteredICD9 = sampleICD9.filter(
    (item) =>
      item.kode.toLowerCase().includes(icd9Search.toLowerCase()) ||
      item.nama.toLowerCase().includes(icd9Search.toLowerCase())
  );

  // Load assessment history when patient changes
  useEffect(() => {
    loadAssessmentHistory();
  }, [patient.id]);

  const loadAssessmentHistory = async () => {
    try {
      setLoadingHistory(true);
      // Create table first if it doesn't exist
      await assessmentService.createAssessmentTable();
      const history = await assessmentService.getAssessmentHistory(patient.id);

      // Format data for display
      const formattedHistory = history.map((item) => ({
        id: item.id,
        waktu: new Date(item.waktu).toLocaleString("id-ID"),
        dokter: item.dokter,
        assessment: item.assessment,
      }));

      setAssessmentHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading assessment history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset detail fields when changing allergy status to "tidak"
      if (field === "alergiObat" && value === "tidak") {
        newData.alergiObatDetail = "";
      }
      if (field === "alergiMakanan" && value === "tidak") {
        newData.alergiMakananDetail = "";
      }

      return newData;
    });
  };

  const handleAddICD10 = (item: ICD10Item) => {
    if (!selectedICD10.find((selected) => selected.kode === item.kode)) {
      setSelectedICD10((prev) => [...prev, item]);
    }
  };

  const handleAddICD9 = (item: ICD9Item) => {
    if (!selectedICD9.find((selected) => selected.kode === item.kode)) {
      setSelectedICD9((prev) => [...prev, item]);
    }
  };

  const handleAddTindakan = () => {
    if (
      tindakanForm.nama &&
      tindakanForm.jumlah > 0 &&
      tindakanForm.biaya > 0
    ) {
      const newTindakan: TindakanItem = {
        ...tindakanForm,
        total: tindakanForm.jumlah * tindakanForm.biaya,
      };
      setSelectedTindakan((prev) => [...prev, newTindakan]);
      setTindakanForm({ nama: "", jumlah: 1, biaya: 0 });
      setShowTindakanModal(false);
    }
  };

  const handleAddResep = () => {
    if (resepForm.nama && resepForm.jumlah && resepForm.signa) {
      setSelectedResep((prev) => [...prev, resepForm]);
      setResepForm({ nama: "", jumlah: "", signa: "" });
      setShowResepModal(false);
    }
  };

  const handleRemoveICD10 = (kode: string) => {
    setSelectedICD10((prev) => prev.filter((item) => item.kode !== kode));
  };

  const handleRemoveICD9 = (kode: string) => {
    setSelectedICD9((prev) => prev.filter((item) => item.kode !== kode));
  };

  const handleRemoveTindakan = (index: number) => {
    setSelectedTindakan((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveResep = (index: number) => {
    setSelectedResep((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalTindakan = () => {
    return selectedTindakan.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveAssessment = async () => {
    try {
      setSaving(true);

      // Prepare assessment data
      const assessmentData = {
        patient_id: patient.id,
        formData,
        selectedICD10,
        selectedICD9,
        selectedTindakan,
        selectedResep,
      };

      // Save to database
      await assessmentService.createAssessment(assessmentData);

      // Reload assessment history to show the new entry
      await loadAssessmentHistory();

      // Reset form after successful save
      handleResetForm();

      alert("Assessment berhasil disimpan!");
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert(
        `Gagal menyimpan assessment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      keluhanUtama: "",
      alergiObat: "tidak",
      alergiObatDetail: "",
      alergiMakanan: "tidak",
      alergiMakananDetail: "",
      tekananDarah: "",
      penyakitJantung: "tidak",
      hemofilia: "tidak",
      hepatitis: "tidak",
      gastritis: "tidak",
    });
    setSelectedICD10([]);
    setSelectedICD9([]);
    setSelectedTindakan([]);
    setSelectedResep([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Riwayat Assessment */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Riwayat Assessment
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dokter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessmentHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.waktu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.dokter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.assessment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Assessment Awal Poli Gigi */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assessment Awal Poli Gigi
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anamnesis */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">Anamnesis</h4>

            {/* Keluhan Utama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keluhan Utama
              </label>
              <textarea
                value={formData.keluhanUtama}
                onChange={(e) =>
                  handleInputChange("keluhanUtama", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan keluhan utama pasien..."
              />
            </div>

            {/* Alergi Obat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alergi Obat-obatan
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tidak"
                      checked={formData.alergiObat === "tidak"}
                      onChange={(e) =>
                        handleInputChange("alergiObat", e.target.value)
                      }
                      className="mr-2"
                    />
                    Tidak
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ya"
                      checked={formData.alergiObat === "ya"}
                      onChange={(e) =>
                        handleInputChange("alergiObat", e.target.value)
                      }
                      className="mr-2"
                    />
                    Ya
                  </label>
                </div>
                {formData.alergiObat === "ya" && (
                  <textarea
                    value={formData.alergiObatDetail}
                    onChange={(e) =>
                      handleInputChange("alergiObatDetail", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sebutkan jenis obat yang menyebabkan alergi..."
                  />
                )}
              </div>
            </div>

            {/* Alergi Makanan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alergi Makanan
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tidak"
                      checked={formData.alergiMakanan === "tidak"}
                      onChange={(e) =>
                        handleInputChange("alergiMakanan", e.target.value)
                      }
                      className="mr-2"
                    />
                    Tidak
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ya"
                      checked={formData.alergiMakanan === "ya"}
                      onChange={(e) =>
                        handleInputChange("alergiMakanan", e.target.value)
                      }
                      className="mr-2"
                    />
                    Ya
                  </label>
                </div>
                {formData.alergiMakanan === "ya" && (
                  <textarea
                    value={formData.alergiMakananDetail}
                    onChange={(e) =>
                      handleInputChange("alergiMakananDetail", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sebutkan jenis makanan yang menyebabkan alergi..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Riwayat Kesehatan
            </h4>

            {/* Tekanan Darah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tekanan Darah (mmHg)
              </label>
              <input
                type="text"
                value={formData.tekananDarah}
                onChange={(e) =>
                  handleInputChange("tekananDarah", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="120/80"
              />
            </div>

            {/* Penyakit Jantung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penyakit Jantung
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tidak"
                    checked={formData.penyakitJantung === "tidak"}
                    onChange={(e) =>
                      handleInputChange("penyakitJantung", e.target.value)
                    }
                    className="mr-2"
                  />
                  Tidak
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ya"
                    checked={formData.penyakitJantung === "ya"}
                    onChange={(e) =>
                      handleInputChange("penyakitJantung", e.target.value)
                    }
                    className="mr-2"
                  />
                  Ya
                </label>
              </div>
            </div>

            {/* Hemofilia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hemofilia
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tidak"
                    checked={formData.hemofilia === "tidak"}
                    onChange={(e) =>
                      handleInputChange("hemofilia", e.target.value)
                    }
                    className="mr-2"
                  />
                  Tidak
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ya"
                    checked={formData.hemofilia === "ya"}
                    onChange={(e) =>
                      handleInputChange("hemofilia", e.target.value)
                    }
                    className="mr-2"
                  />
                  Ya
                </label>
              </div>
            </div>

            {/* Hepatitis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hepatitis
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tidak"
                    checked={formData.hepatitis === "tidak"}
                    onChange={(e) =>
                      handleInputChange("hepatitis", e.target.value)
                    }
                    className="mr-2"
                  />
                  Tidak
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ya"
                    checked={formData.hepatitis === "ya"}
                    onChange={(e) =>
                      handleInputChange("hepatitis", e.target.value)
                    }
                    className="mr-2"
                  />
                  Ya
                </label>
              </div>
            </div>

            {/* Gastritis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gastritis
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tidak"
                    checked={formData.gastritis === "tidak"}
                    onChange={(e) =>
                      handleInputChange("gastritis", e.target.value)
                    }
                    className="mr-2"
                  />
                  Tidak
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ya"
                    checked={formData.gastritis === "ya"}
                    onChange={(e) =>
                      handleInputChange("gastritis", e.target.value)
                    }
                    className="mr-2"
                  />
                  Ya
                </label>
              </div>
            </div>
          </div>

          {/* Diagnosa & Procedure */}
          <div className="space-y-4">
            {/* Diagnosa */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Diagnosa</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ICD 10
                </label>
                <button
                  onClick={() => setShowICD10Modal(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Diagnosa</span>
                </button>
              </div>
            </div>

            {/* Procedure */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Procedure</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ICD 9
                </label>
                <button
                  onClick={() => setShowICD9Modal(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Prosedur</span>
                </button>
              </div>
            </div>

            {/* Tata Laksana */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tata Laksana</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTindakanModal(true)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                >
                  <span>Tindakan</span>
                </button>
                <button
                  onClick={() => setShowResepModal(true)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
                >
                  <span>Resep</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Tabel Data yang Dipilih */}
      <div className="space-y-6">
        {/* Tabel ICD 10 */}
        {selectedICD10.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Diagnosa (ICD 10)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedICD10.map((item) => (
                    <tr key={item.kode}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.jenis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => handleRemoveICD10(item.kode)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel ICD 9 */}
        {selectedICD9.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Prosedur (ICD 9)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Prosedur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Prosedur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedICD9.map((item) => (
                    <tr key={item.kode}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => handleRemoveICD9(item.kode)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel Tindakan */}
        {selectedTindakan.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tindakan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Biaya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTindakan.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.jumlah}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp. {item.biaya.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp. {item.total.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => handleRemoveTindakan(index)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right font-medium text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>
                          Rp. {getTotalTindakan().toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right font-medium text-gray-900"
                    >
                      Cara Bayar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Cash
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel Resep */}
        {selectedResep.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resep</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Obat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedResep.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.jumlah}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.signa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => handleRemoveResep(index)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleResetForm}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
        <button
          onClick={handleSaveAssessment}
          disabled={saving}
          className={`px-4 py-2 ${
            saving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Menyimpan..." : "Simpan"}</span>
        </button>
      </div>

      {/* Modal ICD 10 */}
      {showICD10Modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cari Diagnosa ICD 10
              </h3>
              <button
                onClick={() => setShowICD10Modal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={icd10Search}
                onChange={(e) => setIcd10Search(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cari berdasarkan kode atau nama diagnosa..."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pilih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredICD10.map((item) => (
                    <tr key={item.kode}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={selectedICD10.some(
                            (selected) => selected.kode === item.kode
                          )}
                          onChange={() => handleAddICD10(item)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowICD10Modal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ICD 9 */}
      {showICD9Modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cari Prosedur ICD 9
              </h3>
              <button
                onClick={() => setShowICD9Modal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={icd9Search}
                onChange={(e) => setIcd9Search(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cari berdasarkan kode atau nama prosedur..."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Prosedur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Prosedur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pilih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredICD9.map((item) => (
                    <tr key={item.kode}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={selectedICD9.some(
                            (selected) => selected.kode === item.kode
                          )}
                          onChange={() => handleAddICD9(item)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowICD9Modal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tindakan */}
      {showTindakanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah Tindakan
              </h3>
              <button
                onClick={() => setShowTindakanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tindakan
                </label>
                <input
                  type="text"
                  value={tindakanForm.nama}
                  onChange={(e) =>
                    setTindakanForm((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama tindakan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  min="1"
                  value={tindakanForm.jumlah}
                  onChange={(e) =>
                    setTindakanForm((prev) => ({
                      ...prev,
                      jumlah: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biaya (Rp.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tindakanForm.biaya}
                  onChange={(e) =>
                    setTindakanForm((prev) => ({
                      ...prev,
                      biaya: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddTindakan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resep */}
      {showResepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah Resep
              </h3>
              <button
                onClick={() => setShowResepModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Obat
                </label>
                <input
                  type="text"
                  value={resepForm.nama}
                  onChange={(e) =>
                    setResepForm((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama obat..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="text"
                  value={resepForm.jumlah}
                  onChange={(e) =>
                    setResepForm((prev) => ({
                      ...prev,
                      jumlah: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 10 tablet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signa
                </label>
                <input
                  type="text"
                  value={resepForm.signa}
                  onChange={(e) =>
                    setResepForm((prev) => ({ ...prev, signa: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 3x1 setelah makan"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddResep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
