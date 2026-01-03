import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Eye, ChevronDown, Key, Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import Header from '../Header';
import ConfirmDialog from '../ConfirmDialog';
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus,
  deleteUser,
  getRegistrationCodes,
  createRegistrationCode,
  toggleRegistrationCodeStatus,
  deleteRegistrationCode,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest
} from '../../services/api';
import { supabase } from '../../services/supabase';
import { useAuth } from '../auth/AuthProvider';

export default function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCodeManager, setShowCodeManager] = useState(false);
  const [showNewCodeForm, setShowNewCodeForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newCodeDescription, setNewCodeDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null, userName: '' });
  const [deleteCodeConfirm, setDeleteCodeConfirm] = useState({ isOpen: false, codeId: null, code: '' });

  useEffect(() => {
    loadData();
  }, []);

  // Listen for realtime updates on role requests
  useEffect(() => {
    const channel = supabase
      .channel('admin-role-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'role_change_requests'
      }, (payload) => {
        console.log('Role request change detected:', payload);
        // Reload pending requests when any change occurs
        getPendingRoleRequests().then((data) => {
          console.log('Loaded pending requests:', data);
          setPendingRequests(data);
        });
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, codesData, requestsData] = await Promise.all([
      getAllUsers(),
      getRegistrationCodes(),
      getPendingRoleRequests()
    ]);
    // Filter out deleted users from the list
    setUsers(usersData.filter(user => user.status !== 'deleted'));
    setCodes(codesData);
    setPendingRequests(requestsData);
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

  const handleDeleteUser = async () => {
    const result = await deleteUser(deleteConfirm.userId);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.userId));
    } else {
      alert(`Failed to delete user: ${result.error || 'Unknown error'}`);
    }
  };

  const handleDeleteCode = async () => {
    const result = await deleteRegistrationCode(deleteCodeConfirm.codeId);
      if (result.success) {
        setCodes(prev => prev.filter(c => c.id !== deleteCodeConfirm.codeId));
      }
    };

    const handleApproveRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await approveRoleRequest(requestId, profile.id);
      if (result.success) {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        // Refresh users list to show updated role
        const usersData = await getAllUsers();
        setUsers(usersData.filter(user => user.status !== 'deleted'));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await rejectRoleRequest(requestId, profile.id);
      if (result.success) {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessingRequest(null);
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
      case 'committee': return 'bg-blue-100 text-blue-800';
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
      {/* Desktop Header */}
      {!window.matchMedia('(max-width: 767px)').matches && (
        <Header 
          viewTitle="Dashboard" 
          showSearch={false}
          onOpenPersonNotes={(personId) => {
            console.log('Open notes for person:', personId);
          }}
        />
      )}
      
      <div className="p-6 bg-[#f9fafa] min-h-screen">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="md:block" />
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

      {/* Pending Role Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {pendingRequests.length} Pending Role Change Request{pendingRequests.length > 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Users are waiting for role change approval.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Role Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-300 overflow-hidden mb-6">
          <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={20} className="text-yellow-600" />
              Pending Role Change Requests ({pendingRequests.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {request.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {request.profiles?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">{request.profiles?.email}</p>
                      </div>
                    </div>
                    
                    <div className="ml-15 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Current Role:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {request.profiles?.role?.charAt(0).toUpperCase() + request.profiles?.role?.slice(1)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">Requested:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          Committee
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Requested {new Date(request.requested_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processingRequest === request.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processingRequest === request.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <option value="Committee">Committee</option>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                {users.filter(u => u.role === 'committee').length}
              </div>
              <div className="text-sm text-gray-600">Committee</div>
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
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                            <option value="committee">Committee</option>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDeleteConfirm({ 
                            isOpen: true, 
                            userId: user.id, 
                            userName: user.full_name || user.email 
                          })}
                          disabled={user.id === profile.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 group relative"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                            Delete user
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-900 truncate">
                        {user.full_name || 'No name'}
                        {user.id === profile.id && (
                          <span className="text-xs text-blue-600 ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Role</span>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === profile.id}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)} border-none disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <option value="admin">Admin</option>
                        <option value="committee">Committee</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <button
                        onClick={() => handleStatusChange(
                          user.id, 
                          user.status === 'active' ? 'suspended' : 'active'
                        )}
                        disabled={user.id === profile.id}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Joined</span>
                      <span className="text-xs text-gray-900">
                        {new Date(user.created_at + 'Z').toLocaleDateString('en-US', {
                          timeZone: 'Asia/Manila',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setDeleteConfirm({ 
                      isOpen: true, 
                      userId: user.id, 
                      userName: user.full_name || user.email 
                    })}
                    disabled={user.id === profile.id}
                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 border border-red-200"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-medium">Delete User</span>
                  </button>
                </div>
              ))}
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
                      onClick={() => setDeleteCodeConfirm({ 
                        isOpen: true, 
                        codeId: code.id, 
                        code: code.code 
                      })}
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
      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        message={`Are you sure you want to delete ${deleteConfirm.userName}? They will be permanently suspended and cannot log in anymore.`}
        confirmText="Delete User"
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteCodeConfirm.isOpen}
        onClose={() => setDeleteCodeConfirm({ isOpen: false, codeId: null, code: '' })}
        onConfirm={handleDeleteCode}
        title="Delete Registration Code?"
        message={`Are you sure you want to delete the code "${deleteCodeConfirm.code}"?`}
        confirmText="Delete Code"
        type="danger"
      />
    </>
  );
}