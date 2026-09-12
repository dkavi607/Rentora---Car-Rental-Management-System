import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { UserRole } from '../../types';
import { 
  Car, 
  Search, 
  Bell, 
  MapPin, 
  Shield, 
  UserCheck, 
  Plus, 
  LogOut, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewBooking: () => void;
  onOpenNewCar: () => void;
  isCustomerMode: boolean;
  setIsCustomerMode: (mode: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewBooking,
  onOpenNewCar,
  isCustomerMode,
  setIsCustomerMode
}) => {
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    branches, 
    selectedBranchId, 
    setSelectedBranchId,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    users,
    setCurrentUser
  } = useRentora();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const availableRoles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Rental Manager',
    'Staff',
    'Accountant',
    'Maintenance Manager',
    'Customer'
  ];

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const matchedUser = users.find(u => u.role === role) || users[0];
    setCurrentUser({ ...matchedUser, role });
    setShowRoleMenu(false);

    if (role === 'Customer') {
      setIsCustomerMode(true);
    } else {
      setIsCustomerMode(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Mode Tag */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => {
              if (isCustomerMode) {
                setActiveTab('customer-portal');
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                  Rent<span className="text-blue-600">ora</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {isCustomerMode ? 'Customer Portal' : 'Fleet HQ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Vehicle Rental & Fleet Management
              </p>
            </div>
          </div>

          {/* Branch Switcher Dropdown (Admin Mode Only) */}
          {!isCustomerMode && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-500">Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Branches (Global Fleet)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Notifications, Role Switcher & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Quick Create Dropdown for Admins/Staff */}
          {!isCustomerMode && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Action</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showQuickActions && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowQuickActions(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickActions(false);
                        onOpenNewBooking();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Create New Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickActions(false);
                        onOpenNewCar();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Add New Vehicle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickActions(false);
                        setActiveTab('customers');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      Register Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickActions(false);
                        setActiveTab('rentals');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Vehicle Pickup Handover
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mode Switcher Button: Toggle between Admin Dashboard & Customer Portal */}
          <button
            type="button"
            onClick={() => {
              if (isCustomerMode) {
                setIsCustomerMode(false);
                setCurrentRole('Super Admin');
                setActiveTab('dashboard');
              } else {
                setIsCustomerMode(true);
                setCurrentRole('Customer');
                setActiveTab('customer-portal');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isCustomerMode
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCustomerMode ? 'Switch to Admin HQ' : 'View as Customer'}</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
              title="Switch role for testing permissions"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
              <span className="text-slate-900">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowRoleMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active RBAC Role
                  </div>
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentRole === role
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          role === 'Super Admin' ? 'bg-purple-600' :
                          role === 'Admin' ? 'bg-blue-600' :
                          role === 'Rental Manager' ? 'bg-emerald-600' :
                          role === 'Accountant' ? 'bg-amber-500' :
                          role === 'Maintenance Manager' ? 'bg-red-500' :
                          role === 'Customer' ? 'bg-indigo-600' : 'bg-slate-500'
                        }`} />
                        {role}
                      </span>
                      {currentRole === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold tracking-wide">Notifications</span>
                      {unreadNotifs.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold">
                          {unreadNotifs.length} new
                        </span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-300 hover:text-white underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications to display.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkTab) setActiveTab(notif.linkTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !notif.read ? 'bg-blue-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${
                              notif.type === 'warning' ? 'text-amber-700' :
                              notif.type === 'danger' ? 'text-red-700' :
                              notif.type === 'success' ? 'text-emerald-700' : 'text-blue-700'
                            }`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-2xs"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {currentRole}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
