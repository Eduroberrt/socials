import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Camera, 
  Eye, 
  EyeOff, 
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import DashboardNavbar from '@/components/DashboardNavbar';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings = () => {
  const { user, updateProfilePhoto } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.profile?.phone_number || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would update the user data in your backend and auth context
      console.log('Profile updated:', profileData);
      
      setIsEditing(false);
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      showMessage('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match.', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters long.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would validate current password and update the new one
      console.log('Password changed');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showMessage('Password changed successfully!', 'success');
    } catch (error) {
      showMessage('Failed to change password. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    // In production, this would handle file upload
    showMessage('Avatar upload feature coming soon!', 'success');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-saas-orange" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
          <p className="text-gray-400">Manage your account information and security settings</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-900/20 border-green-500/30 text-green-400' 
              : 'bg-red-900/20 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {messageType === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-saas-orange data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-saas-orange data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-saas-orange" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user?.profilePhoto || ""} alt="Profile" />
                      <AvatarFallback className="bg-saas-orange text-white text-xl">
                        {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        onClick={handleAvatarUpload}
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-saas-orange hover:bg-saas-orange/80"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-semibold">{user?.name || 'User'}</h3>
                    <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
                    <Badge className="mt-2 bg-green-900/20 text-green-400 border-green-500/30">
                      Verified Account
                    </Badge>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        placeholder="City, Country"
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="mt-1 w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:border-saas-orange focus:outline-none focus:ring-1 focus:ring-saas-orange disabled:opacity-50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-saas-orange hover:bg-saas-orange/90 text-white"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          firstName: user?.first_name || '',
                          lastName: user?.last_name || '',
                          username: user?.username || '',
                          email: user?.email || '',
                          phone: user?.profile?.phone_number || '',
                          bio: user?.profile?.bio || '',
                          location: user?.profile?.location || ''
                        });
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Profile Photo Upload Section */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Profile Photo</h3>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Current Avatar Display */}
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.profile?.profile_photo || ""} alt="Profile" />
                        <AvatarFallback className="bg-saas-orange text-white text-xl">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Camera icon overlay */}
                      <div className="absolute -bottom-2 -right-2 bg-saas-orange rounded-full p-2 cursor-pointer hover:bg-saas-orange/90 transition-colors">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <input
                            type="file"
                            id="profile-photo"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Convert the file to base64 for permanent storage
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64String = event.target?.result as string;
                                  if (base64String) {
                                    updateProfilePhoto(base64String);
                                    setMessage('Profile photo updated successfully!');
                                    setMessageType('success');
                                    setTimeout(() => setMessage(''), 3000);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() => document.getElementById('profile-photo')?.click()}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Choose Photo
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                              onClick={() => {
                                updateProfilePhoto('');
                                setMessage('Profile photo removed');
                                setMessageType('success');
                                setTimeout(() => setMessage(''), 3000);
                              }}
                            >
                              Remove Photo
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          <p>• Recommended size: 400x400px or larger</p>
                          <p>• Supported formats: JPG, PNG, GIF</p>
                          <p>• Maximum file size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-saas-orange" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left side - Title and Description */}
                  <div className="lg:col-span-1">
                    <h3 className="text-white text-lg font-semibold mb-2">Change Password</h3>
                    <p className="text-gray-400 text-sm">
                      Update your password to keep your account secure. Make sure your new password is strong and unique.
                    </p>
                  </div>

                  {/* Right side - Form */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4 max-w-md">
                      <div>
                        <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange"
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="text-white">New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className="pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full bg-saas-orange hover:bg-saas-orange/90 text-white"
                      >
                        {isSaving ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                            Changing Password...
                          </div>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileBottomNavigation />
    </div>
  );
};

export default AccountSettings;