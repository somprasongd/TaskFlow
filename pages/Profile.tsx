import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, BarChart3, CheckCircle, Clock, Layout, Save, Moon, Sun, Monitor, Lock } from 'lucide-react';
import { cn } from '../utils';

const Profile: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, updateProfile } = useAuth();
  const { tasks, categories } = useTasks();
  const { theme, setTheme } = useTheme();
  
  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      updateProfile(name);
      setIsLoading(false);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 800);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setPasswordLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setPasswordLoading(false);
      setIsPasswordExpanded(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  // Calculate Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.isCompleted).length;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and view your productivity stats.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                  <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                      {user?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <Shield className="w-3 h-3" />
                          Pro Plan
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-8">
                    {/* Theme Preference */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => setTheme('light')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                            theme === 'light' 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          <Sun className="w-6 h-6" />
                          <span className="text-xs font-medium">Light</span>
                        </button>
                        <button 
                           onClick={() => setTheme('dark')}
                           className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                            theme === 'dark' 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          <Moon className="w-6 h-6" />
                          <span className="text-xs font-medium">Dark</span>
                        </button>
                        <button 
                           onClick={() => setTheme('system')}
                           className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                            theme === 'system' 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          <Monitor className="w-6 h-6" />
                          <span className="text-xs font-medium">System</span>
                        </button>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                        {!isEditing && (
                          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                            Edit Profile
                          </Button>
                        )}
                      </div>

                      <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                        <div className="grid grid-cols-1 gap-4">
                          <Input
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            icon={<User className="w-4 h-4" />}
                          />
                          <Input
                            label="Email Address"
                            value={email}
                            disabled={true} 
                            className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            icon={<Mail className="w-4 h-4" />}
                          />
                        </div>

                        {isEditing && (
                          <div className="flex items-center gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                            <Button type="submit" isLoading={isLoading} className="gap-2">
                              <Save className="w-4 h-4" />
                              Save Changes
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => {
                              setIsEditing(false);
                              setName(user?.name || '');
                            }}>
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        {successMessage && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in">
                            {successMessage}
                          </p>
                        )}
                      </form>
                    </div>

                    {/* Change Password Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
                      </div>

                      {!isPasswordExpanded ? (
                        <Button variant="secondary" onClick={() => setIsPasswordExpanded(true)} className="w-full sm:w-auto justify-start">
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>
                      ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                          <Input
                            label="Current Password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                          <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />

                          <div className="flex items-center gap-3 pt-2">
                             <Button type="submit" isLoading={passwordLoading}>
                               Update Password
                             </Button>
                             <Button type="button" variant="ghost" onClick={() => {
                               setIsPasswordExpanded(false);
                               setCurrentPassword('');
                               setNewPassword('');
                               setConfirmPassword('');
                               setPasswordMessage({ type: '', text: '' });
                             }}>
                               Cancel
                             </Button>
                          </div>
                        </form>
                      )}

                      {passwordMessage.text && (
                        <div className={cn(
                          "mt-4 p-3 rounded-lg text-sm font-medium animate-in fade-in",
                          passwordMessage.type === 'error' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        )}>
                          {passwordMessage.text}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Stats */}
              <div className="space-y-6">
                
                {/* Stats Grid */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    Productivity
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completedTasks}</div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-300 mt-1">Completed</div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{activeTasks}</div>
                      <div className="text-xs font-medium text-amber-600 dark:text-amber-300 mt-1">Pending</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{completionRate}%</div>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-300 mt-1">Completion Rate</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{categories.length}</div>
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-300 mt-1">Categories</div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                    Account Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        Member Since
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">Feb 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Layout className="w-4 h-4" />
                        Total Tasks Created
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        High Priority Active
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">{highPriorityTasks}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;