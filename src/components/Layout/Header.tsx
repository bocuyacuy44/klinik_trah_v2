import React from 'react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <nav className="text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">→</span>
          <span className="text-gray-900">Pendaftaran Pasien</span>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">{user?.name || 'Admin'}</div>
            <div className="text-gray-500 text-xs">
              {user?.role === 'dokter' ? 'Dokter' : 'Administrasi'}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;