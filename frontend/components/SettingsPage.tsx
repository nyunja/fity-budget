
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Sun, 
  Globe, 
  CreditCard, 
  Smartphone, 
  Lock, 
  Download, 
  Trash2, 
  Mail, 
  RefreshCw,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsPageProps {
  user: UserType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

type SettingsTab = 'profile' | 'preferences' | 'security' | 'notifications' | 'data' | 'about';

const SettingsPage: React.FC<SettingsPageProps> = ({ user, isDarkMode, toggleTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // Local State for Form Interactions (Simulation)
  const [currency, setCurrency] = useState('KES');
  const [language, setLanguage] = useState('English');
  const [showBalance, setShowBalance] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'preferences', label: 'App Preferences', icon: Settings },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Integrations', icon: Database },
    { id: 'about', label: 'About & Support', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                   <img 
                     src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                     alt="Profile" 
                     className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-600"
                   />
                   <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full border-2 border-white dark:border-gray-800 hover:bg-indigo-700 transition-colors">
                      <RefreshCw size={14} />
                   </button>
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                   <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                   <button className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Edit details</button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Personal Information</h3>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input type="text" defaultValue={user.name} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <input type="email" defaultValue={user.email} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <input type="tel" placeholder="+254 700 000 000" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none" />
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Regional Settings</h3>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                      <div className="relative">
                         <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <select 
                           value={currency} 
                           onChange={(e) => setCurrency(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                         >
                            <option value="KES">Kenyan Shilling (KES)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                         </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                      <div className="relative">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                         >
                            <option value="English">English</option>
                            <option value="Swahili">Swahili</option>
                            <option value="French">French</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="flex justify-end pt-4">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
                   Save Changes
                </button>
             </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">App Preferences</h3>
             
             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                         {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white">Dark Mode</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleTheme} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700"></div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                         {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white">Show Balances</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Hide sensitive amounts on dashboard</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={showBalance} onChange={() => setShowBalance(!showBalance)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Wallet</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none">
                            <option>M-PESA</option>
                            <option>Bank Account</option>
                            <option>Cash</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget Period</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none">
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Bi-Weekly</option>
                        </select>
                    </div>
                </div>
             </div>
          </div>
        );

      case 'security':
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security & Privacy</h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Change Password</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors">
                            Update
                        </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Biometric Login</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Use FaceID or Fingerprint to log in</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={biometricEnabled} onChange={() => setBiometricEnabled(!biometricEnabled)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                     <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                     <p className="text-sm text-red-500/80 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                     <div className="flex gap-4">
                        <button 
                            onClick={onLogout}
                            className="px-4 py-2 bg-white dark:bg-red-900/20 border border-gray-200 dark:border-red-800 text-gray-700 dark:text-red-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-red-900/40 transition-colors"
                        >
                            Log Out All Devices
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                            Delete Account
                        </button>
                     </div>
                </div>
            </div>
        );

      case 'notifications':
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                     {[
                         { title: 'Monthly Budget Alerts', desc: 'Get notified when you approach your budget limit' },
                         { title: 'Goal Achievements', desc: 'Celebratory alerts when you hit a savings milestone' },
                         { title: 'Weekly Summary', desc: 'A short summary of your weekly spending every Monday' },
                         { title: 'Bill Reminders', desc: 'Get reminded 2 days before a recurring bill is due' },
                         { title: 'New Features', desc: 'Updates about new features in FityBudget' }
                     ].map((item, index) => (
                         <div key={index} className="flex items-start justify-between">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                     ))}
                </div>
            </div>
        );
      
      case 'data':
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data & Integrations</h3>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                     <h4 className="font-bold text-gray-900 dark:text-white mb-4">Connected Accounts</h4>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">MP</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">M-PESA</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><Check size={10} /> Connected</p>
                                </div>
                             </div>
                             <button className="text-sm text-red-500 font-medium hover:underline">Disconnect</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">KCB</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">KCB Bank</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last synced: 2 hrs ago</p>
                                </div>
                             </div>
                             <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sync Now</button>
                        </div>
                        <button className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                             <PlusIcon size={18} /> Connect New Account
                        </button>
                     </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Export Data</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Download your transaction history and budget reports for your records.</p>
                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Download size={18} /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Download size={18} /> Export PDF
                        </button>
                    </div>
                </div>
            </div>
        );

        case 'about':
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">FityBudget Premium</h3>
                        <p className="text-indigo-100 mb-6 max-w-md mx-auto">Unlock unlimited budgets, advanced AI insights, and priority support.</p>
                        <button className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            Upgrade Plan
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white">About</h4>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-600 dark:text-gray-300">Version</span>
                             <span className="font-medium text-gray-900 dark:text-white">2.4.0 (Build 20240825)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-600 dark:text-gray-300">Terms of Service</span>
                             <ChevronRight size={18} className="text-gray-400" />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-600 dark:text-gray-300">Privacy Policy</span>
                             <ChevronRight size={18} className="text-gray-400" />
                        </div>
                        <div className="flex justify-between items-center py-2">
                             <span className="text-gray-600 dark:text-gray-300">Contact Support</span>
                             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">
                                <Mail size={16} /> help@FityBudget.com
                             </div>
                        </div>
                    </div>
                </div>
            );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and app settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Sidebar Navigation */}
         <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden sticky top-24">
               {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                        className={`w-full flex items-center gap-3 px-6 py-4 transition-colors border-l-4 ${
                           isActive 
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'
                        }`}
                     >
                        <tab.icon size={20} />
                        <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1">
            {renderContent()}
         </div>
      </div>
    </div>
  );
};

// Helper component for icon used in "Data" tab
const PlusIcon = ({ size }: { size: number }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default SettingsPage;
