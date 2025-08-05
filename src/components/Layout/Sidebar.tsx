import React from "react";
import { Home, Users, ClipboardList, BarChart3, UserCheck } from "lucide-react";
import { User } from "../../types";

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuClick, user }) => {
  const allMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      section: "HOME",
      roles: ["admin", "administrasi", "dokter", "perawat"],
    },
    {
      id: "pendaftaran-pasien",
      label: "Pendaftaran Pasien",
      icon: ClipboardList,
      section: "TRANSAKSI",
      roles: ["admin", "administrasi", "dokter", "perawat"],
    },
    {
      id: "pasien",
      label: "Pasien",
      icon: Users,
      section: "MASTER DATA",
      roles: ["admin", "administrasi", "perawat"],
    },
    {
      id: "sdm",
      label: "Data SDM",
      icon: UserCheck,
      section: "MASTER DATA",
      roles: ["admin", "administrasi"],
    },
    {
      id: "laporan",
      label: "Laporan kunjungan",
      icon: BarChart3,
      section: "LAPORAN",
      roles: ["admin", "administrasi", "perawat"],
    },
  ];

  // Filter menu items based on user role
  const menuItems = user
    ? allMenuItems.filter((item) => item.roles.includes(user.role))
    : allMenuItems;

  const sections = ["HOME", "TRANSAKSI", "MASTER DATA", "LAPORAN"];

  // Filter visible sections
  const visibleSections = sections.filter((section) =>
    menuItems.some((item) => item.section === section)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          {/* Ganti ikon dengan gambar logo */}
          <img
            src="/assets/img/logo.png"
            alt="Logo Klinik"
            className="w-10 h-10 center-lg object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              KLINIK DENTAL CARE
            </h1>
          </div>
        </div>
      </div>

      <nav className="px-4">
        {visibleSections.map((section) => (
          <div key={section} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              {section}
            </h3>
            <div className="space-y-1">
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onMenuClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
