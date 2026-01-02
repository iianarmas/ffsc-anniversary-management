import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Eye, ChevronDown, Key, Plus, X, AlertTriangle } from 'lucide-react';
import Header from '../Header';
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus,
  getRegistrationCodes,
  createRegistrationCode,
  toggleRegistrationCodeStatus,
  deleteRegistrationCode
} from '../../services/api';
import { useAuth } from '../auth/AuthProvider';

export default function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCodeManager, setShowCodeManager] = useState(false);
  const [showNewCodeForm, setShowNewCodeForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newCodeDescription, setNewCodeDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, codesData] = await Promise.all([
      getAllUsers(),
      getRegistrationCodes()
    ]);
    setUsers(usersData);
    setCodes(codesData);
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const result = await createRegistrationCode(newCode, newCodeDescription, profile.id);
    if (result.success) {
      setCodes(prev => [result.data, ...prev]);
      setNewCode('');
      setNewCodeDescription('');
      setShowNewCodeForm(false);
    }
  };

  const handleToggleCodeStatus = async (codeId, currentStatus) => {
    const result = await toggleRegistrationCodeStatus(codeId, currentStatus);
    if (result.success) {
      setCodes(prev => prev.map(c => c.id === codeId ? { ...c, is_active: !currentStatus } : c));
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this registration code?')) return;
    
    const result = await deleteRegistrationCode(codeId);
    if (result.success) {
      setCodes(prev => prev.filter(c => c.id !== codeId));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Header 
        viewTitle="User Management" 
        showSearch={false}
        onOpenPersonNotes={(personId) => {
          console.log('Open notes for person:', personId);
        }}
      />
      
      <div className="p-6 bg-[#f9fafa] min-h-screen">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={28} />
            User Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage user roles and registration codes
          </p>
        </div>
        <button
          onClick={() => setShowCodeManager(!showCodeManager)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Key size={18} />
          {showCodeManager ? 'Show Users' : 'Manage Codes'}
        </button>
      </div>

      {!showCodeManager ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Viewer">Viewer</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'volunteer').length}
              </div>
              <div className="text-sm text-gray-600">Volunteers</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-600">
                {users.filter(u => u.role === 'viewer').length}
              </div>
              <div className="text-sm text-gray-600">Viewers</div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.full_name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'No name'}
                            </div>
                            {user.id === profile.id && (
                              <span className="text-xs text-blue-600">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.id === profile.id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)} border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            <option value="admin">Admin</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusChange(
                            user.id, 
                            user.status === 'active' ? 'suspended' : 'active'
                          )}
                          disabled={user.id === profile.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {user.status === 'active' ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at + 'Z').toLocaleDateString('en-US', {
                          timeZone: 'Asia/Manila',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Registration Codes Manager */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registration Codes</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage codes that allow new users to register
                </p>
              </div>
              <button
                onClick={() => setShowNewCodeForm(!showNewCodeForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={18} />
                New Code
              </button>
            </div>

            {/* New Code Form */}
            {showNewCodeForm && (
              <form onSubmit={handleCreateCode} className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="FFSC2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newCodeDescription}
                      onChange={(e) => setNewCodeDescription(e.target.value)}
                      placeholder="Anniversary 2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Create Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCodeForm(false);
                      setNewCode('');
                      setNewCodeDescription('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Codes List */}
            <div className="space-y-3">
              {codes.map(code => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-bold font-mono text-gray-900">
                        {code.code}
                      </code>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {code.description && (
                      <p className="text-sm text-gray-600 mt-1">{code.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(code.created_at + 'Z').toLocaleDateString('en-US', {
                        timeZone: 'Asia/Manila',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCodeStatus(code.id, code.is_active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        code.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete code"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {codes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Key size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No registration codes yet</p>
                  <p className="text-sm">Create one to allow new users to register</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
        </div>
      </div>
    </>
  );
}