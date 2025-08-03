import React, { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Registration } from "../../types";
import { formatDate } from "../../utils/generators";

interface RegistrationTableProps {
  registrations: Registration[];
  onEdit: (registration: Registration) => void;
  onView: (registration: Registration) => void;
  onDelete: (registration: Registration) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({
  registrations,
  onEdit,
  onView,
  onDelete,
}) => {
  const [searchIdPendaftaran, setSearchIdPendaftaran] = useState("");
  const [searchNoRekamMedik, setSearchNoRekamMedik] = useState("");
  const [searchPasien, setSearchPasien] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesIdPendaftaran =
      !searchIdPendaftaran ||
      reg.idPendaftaran
        .toLowerCase()
        .includes(searchIdPendaftaran.toLowerCase());
    const matchesNoRekamMedik =
      !searchNoRekamMedik ||
      (reg.noRekamMedik &&
        reg.noRekamMedik
          .toLowerCase()
          .includes(searchNoRekamMedik.toLowerCase()));
    const matchesPasien =
      !searchPasien ||
      (reg.pasien &&
        reg.pasien.toLowerCase().includes(searchPasien.toLowerCase()));
    const matchesDateRange =
      (!dateFrom || reg.tanggal >= dateFrom) &&
      (!dateTo || reg.tanggal <= dateTo);

    return (
      matchesIdPendaftaran &&
      matchesNoRekamMedik &&
      matchesPasien &&
      matchesDateRange
    );
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dari"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sampai"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Pendaftaran
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchIdPendaftaran}
                onChange={(e) => setSearchIdPendaftaran(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No Rekam Medik
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchNoRekamMedik}
                onChange={(e) => setSearchNoRekamMedik(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pasien
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchPasien}
                onChange={(e) => setSearchPasien(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                No Antrian
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Tanggal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                ID Pendaftaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                No Rekam Medik
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Pasien
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRegistrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              paginatedRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registration.noAntrian}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(registration.tanggal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registration.idPendaftaran}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registration.noRekamMedik || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registration.pasien || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(registration)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onView(registration)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(registration)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {startIndex + 1} sampai{" "}
            {Math.min(startIndex + itemsPerPage, filteredRegistrations.length)}{" "}
            dari {filteredRegistrations.length} entri
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationTable;
