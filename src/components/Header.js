import React from 'react';
import { Search, User } from 'lucide-react';

export default function Header({ 
  viewTitle, 
  searchTerm, 
  setSearchTerm, 
  searchPlaceholder = "Search by name..." 
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[#f9fafa] border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4 min-w-0">
            <img 
              src="/church-web-logo.svg" 
              alt="FFSC Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0 flex items-center gap-4">
              <div>
                <h1 className="text-sm font-semibold text-[#001740]">FFSC Anniversary</h1>
              </div>

              {/* Move search next to the title on larger screens */}
              <div className="hidden md:block ml-4 w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f4d642] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[#001740]">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#001740] to-[#0f2a71] flex items-center justify-center">
              <User size={20} className="text-[#f4d642]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}