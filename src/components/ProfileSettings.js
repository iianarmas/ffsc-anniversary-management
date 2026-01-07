import React, { useState, useRef } from 'react';
import Header from './Header';
import { useAuth } from './auth/AuthProvider';
import { User, Mail, Shield, Calendar, Save, Lock, X, Camera, Trash2, Upload, LogOut } from 'lucide-react';
import { supabase, uploadAvatar, deleteAvatar } from '../services/supabase';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';
import RoleRequestDialog from './RoleRequestDialog';
import { canRequestRoleChange, requestRoleChange, getMyRoleRequestStatus } from '../services/api';

export default function ProfileSettings() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load role request status on mount
React.useEffect(() => {
  const loadRoleRequestData = async () => {
    if (!profile?.id) return;
    
    const status = await getMyRoleRequestStatus(profile.id);
    setRoleRequestStatus(status);
    
    if (profile.role === 'viewer') {
      const eligibility = await canRequestRoleChange(profile.id);
      setRequestEligibility(eligibility);
    }
  };
  
  loadRoleRequestData();
}, [profile?.id, profile?.role]);

// Listen for realtime role request updates
React.useEffect(() => {
  if (!profile?.id) return;
  
  const channel = supabase
    .channel('role-request-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'role_change_requests',
      filter: `user_id=eq.${profile.id}`
    }, (payload) => {
      if (payload.new.status !== 'pending') {
        setShowRoleRequestDialog({
          show: true,
          status: payload.new.status
        });
        setRoleRequestStatus(payload.new);
      }
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [profile?.id]);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [roleRequestStatus, setRoleRequestStatus] = useState(null);
  const [requestEligibility, setRequestEligibility] = useState({ canRequest: false, reason: '' });
  const [showRoleRequestDialog, setShowRoleRequestDialog] = useState({ show: false, status: '' });
  const [requestingRole, setRequestingRole] = useState(false);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Name updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating name:', error);
      setMessage({ type: 'error', text: 'Failed to update name' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { url, error } = await uploadAvatar(profile.id, file);
      
      if (error) throw error;

      await refreshProfile();
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setUploadingAvatar(true);
    try {
      const { error } = await deleteAvatar(profile.id);
      
      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile picture removed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setMessage({ type: 'error', text: 'Failed to remove picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'volunteer': return 'Volunteer';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const handleRequestRoleChange = async () => {
    setRequestingRole(true);
    try {
      const result = await requestRoleChange(profile.id);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Role change request submitted successfully!' });
        
        // Reload status
        const status = await getMyRoleRequestStatus(profile.id);
        setRoleRequestStatus(status);
        const eligibility = await canRequestRoleChange(profile.id);
        setRequestEligibility(eligibility);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit request' });
      }
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error('Error requesting role change:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setRequestingRole(false);
    }
  };

  return (
      <>
        {!isMobile && (
          <Header 
            viewTitle="Profile Settings"
            showSearch={false}
          />
        )}

        {/* Mobile Header with Branding */}
        {isMobile && (
          <div className="sticky top-0 bg-white shadow-md z-20 mb-4">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <img 
                src="/church-logo.svg" 
                alt="FFSC Logo" 
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              <div>
                <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-lg font-bold text-[#001740]">
                  FFSC20
                </h1>
                <p className="text-xs text-gray-500">Profile Settings</p>
              </div>
            </div>
          </div>
        )}

    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'py-0 px-0 pb-20' : 'py-8 px-4'}`}>
      <div className={`max-w-3xl mx-auto ${isMobile ? 'px-4' : ''}`}>
        {/* Header - Desktop Only */}
        {!isMobile && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
        )}

        {/* Mobile Page Title */}
        {isMobile && (
          <div className="mb-4 mt-4">
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
        )}

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#0f2a71] to-[#001740] p-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <Avatar 
                    src={profile?.avatar_url}
                    name={profile?.full_name}
                    size="xl"
                    className="border-2 border-white/20"
                  />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  <Camera size={24} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                <p className="text-blue-200">{profile?.email}</p>
                
                {/* Avatar action buttons */}
                {previewUrl && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-2 px-3 py-1 bg-white text-blue-900 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition text-sm"
                    >
                      <Upload size={14} />
                      {uploadingAvatar ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      className="flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                )}
                
                {profile?.avatar_url && !previewUrl && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-3 py-1 mt-3 bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition text-sm"
                  >
                    <Trash2 size={14} />
                    Remove Picture
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Full Name Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={18} />
                  Full Name
                </label>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || '');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900 text-lg">{profile?.full_name}</p>
              )}
            </div>

            {/* Email Section (Read-only) */}
            <div className="border-b border-gray-200 pb-6">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Mail size={18} />
                Email Address
              </label>
              <p className="text-gray-900">{profile?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Role Section */}
            <div className="border-b border-gray-200 pb-6">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Shield size={18} />
                Account Role
              </label>
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(profile?.role)}`}>
                  {getRoleDisplayName(profile?.role)}
                </span>
                
                {/* Show pending badge if request exists */}
                {roleRequestStatus?.status === 'pending' && (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    Request Pending
                  </span>
                )}
              </div>
              
              {/* Request Role Change Button - Only for Viewers */}
              {profile?.role === 'viewer' && (
                <>
                  {roleRequestStatus?.status === 'pending' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Request Pending
                      </p>
                      <p className="text-xs text-blue-700">
                        Your role change request is awaiting admin approval.
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleRequestRoleChange}
                        disabled={!requestEligibility.canRequest || requestingRole}
                        className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                          requestEligibility.canRequest && !requestingRole
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {requestingRole ? 'Submitting...' : 'Request Committee Access'}
                      </button>
                      
                      {!requestEligibility.canRequest && (
                        <p className="text-xs text-red-600 mt-2">
                          {requestEligibility.reason}
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
              
              {profile?.role !== 'viewer' && (
                <p className="text-xs text-gray-500 mt-2">Contact an administrator to change your role</p>
              )}
            </div>

            {/* Account Created Date */}
            <div className="border-b border-gray-200 pb-6">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Calendar size={18} />
                Member Since
              </label>
              <p className="text-gray-900">{formatDate(profile?.created_at)}</p>
            </div>

            {/* Change Password Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={18} />
                  Password
                </label>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      <Save size={16} />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">••••••••</p>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out Button - Mobile Only */}
        {isMobile && (
          <div className="mt-6 mb-6">
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        )}

        {/* Sign Out Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showSignOutDialog}
          onClose={() => setShowSignOutDialog(false)}
          onConfirm={handleSignOut}
          title="Sign Out?"
          message="Are you sure you want to sign out of your account?"
          confirmText="Sign Out"
          cancelText="Cancel"
          type="danger"
        />

        {/* Role Request Result Dialog */}
        <RoleRequestDialog
          isOpen={showRoleRequestDialog.show}
          status={showRoleRequestDialog.status}
          onClose={() => setShowRoleRequestDialog({ show: false, status: '' })}
        />
        
      </div>
      
    </div>
    </>
  );
}