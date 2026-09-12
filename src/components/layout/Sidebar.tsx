import React from 'react';
import { useRentora } from '../../context/RentoraContext';
import { 
  LayoutDashboard, 
  Car, 
  PlusCircle, 
  Layers, 
  Calendar, 
  Wrench, 
  FileText, 
  Users, 
  UserPlus, 
  BookmarkCheck, 
  KeyRound, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  TrendingDown, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  FolderCheck,
  Tag
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewBooking: () => void;
  onOpenNewCar: () => void;
  isCustomerMode: boolean;
  setIsCustomerMode: (mode: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewBooking,
  onOpenNewCar,
  isCustomerMode,
  setIsCustomerMode
}) => {
  const { 
    vehicles, 
    bookings, 
    rentals, 
    maintenanceRecords, 
    currentRole 
  } = useRentora();

  const activeRentalsCount = rentals.filter(r => r.status === 'Active').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending' || b.status === 'Awaiting Payment').length;
  const maintenanceCount = maintenanceRecords.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length;

  // Filter menu items based on Role permissions
  const canManageCars = ['Super Admin', 'Admin', 'Rental Manager', 'Staff'].includes(currentRole);
  const canManageFinance = ['Super Admin', 'Admin', 'Accountant'].includes(currentRole);
  const canManageMaintenance = ['Super Admin', 'Admin', 'Maintenance Manager'].includes(currentRole);
  const canManageUsers = ['Super Admin', 'Admin'].includes(currentRole);
  const canViewReports = ['Super Admin', 'Admin', 'Accountant', 'Rental Manager'].includes(currentRole);

  const navItemClass = (tab: string) => `
    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
      activeTab === tab 
        ? 'bg-blue-600 text-white shadow-xs' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }
  `;

  const iconClass = (tab: string) => `
    w-4 h-4 transition-colors ${
      activeTab === tab ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
    }
  `;

  if (isCustomerMode) {
    return (
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
        <div className="mb-4 px-3 py-3 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Customer Mode</span>
          </div>
          <p className="text-xs text-slate-300">
            Welcome to the Rentora self-service portal. Browse cars, manage bookings, and view invoices.
          </p>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('customer-portal')}
            className={navItemClass('customer-portal')}
          >
            <div className="flex items-center gap-2.5">
              <Car className={iconClass('customer-portal')} />
              <span>Browse Fleet & Book</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customer-bookings')}
            className={navItemClass('customer-bookings')}
          >
            <div className="flex items-center gap-2.5">
              <BookmarkCheck className={iconClass('customer-bookings')} />
              <span>My Bookings</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customer-rentals')}
            className={navItemClass('customer-rentals')}
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className={iconClass('customer-rentals')} />
              <span>Active Rental & Agreement</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customer-invoices')}
            className={navItemClass('customer-invoices')}
          >
            <div className="flex items-center gap-2.5">
              <Receipt className={iconClass('customer-invoices')} />
              <span>My Invoices & Receipts</span>
            </div>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsCustomerMode(false);
              setActiveTab('dashboard');
            }}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center"
          >
            Back to Staff Console
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-3 overflow-y-auto">
      
      {/* Primary Navigation Tree */}
      <div className="space-y-4 text-left">
        
        {/* Main Dashboard */}
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={navItemClass('dashboard')}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={iconClass('dashboard')} />
              <span>Dashboard</span>
            </div>
          </button>
        </div>

        {/* Fleet Management */}
        {canManageCars && (
          <div>
            <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Fleet Management
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('cars')}
                className={navItemClass('cars')}
              >
                <div className="flex items-center gap-2.5">
                  <Car className={iconClass('cars')} />
                  <span>All Vehicles</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {vehicles.length}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenNewCar}
                className={navItemClass('add-car')}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className={iconClass('add-car')} />
                  <span>Add New Car</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={navItemClass('categories')}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={iconClass('categories')} />
                  <span>Car Categories</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('maintenance')}
                className={navItemClass('maintenance')}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className={iconClass('maintenance')} />
                  <span>Maintenance</span>
                </div>
                {maintenanceCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    {maintenanceCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fleet-docs')}
                className={navItemClass('fleet-docs')}
              >
                <div className="flex items-center gap-2.5">
                  <FolderCheck className={iconClass('fleet-docs')} />
                  <span>Vehicle Documents</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Customer Management */}
        <div>
          <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Customer Management
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={navItemClass('customers')}
            >
              <div className="flex items-center gap-2.5">
                <Users className={iconClass('customers')} />
                <span>All Customers</span>
              </div>
            </button>
          </div>
        </div>

        {/* Booking & Rental Operations */}
        <div>
          <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Booking & Rentals
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={navItemClass('bookings')}
            >
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className={iconClass('bookings')} />
                <span>All Bookings</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenNewBooking}
              className={navItemClass('new-booking')}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className={iconClass('new-booking')} />
                <span>New Booking Wizard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rentals')}
              className={navItemClass('rentals')}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className={iconClass('rentals')} />
                <span>Active Rentals & Lifecycle</span>
              </div>
              {activeRentalsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {activeRentalsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={navItemClass('calendar')}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={iconClass('calendar')} />
                <span>Availability Calendar</span>
              </div>
            </button>
          </div>
        </div>

        {/* Pricing & Promotions */}
        <div>
          <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Pricing & Discounts
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={navItemClass('pricing')}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className={iconClass('pricing')} />
                <span>Pricing Plans & Rules</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promos')}
              className={navItemClass('promos')}
            >
              <div className="flex items-center gap-2.5">
                <Tag className={iconClass('promos')} />
                <span>Promo Codes & Offers</span>
              </div>
            </button>
          </div>
        </div>

        {/* Financial Management */}
        {canManageFinance && (
          <div>
            <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Financial Management
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={navItemClass('payments')}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className={iconClass('payments')} />
                  <span>Payments Ledger</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={navItemClass('invoices')}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className={iconClass('invoices')} />
                  <span>Invoices</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deposits')}
                className={navItemClass('deposits')}
              >
                <div className="flex items-center gap-2.5">
                  <PiggyBank className={iconClass('deposits')} />
                  <span>Security Deposits</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className={navItemClass('expenses')}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingDown className={iconClass('expenses')} />
                  <span>Expenses</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Reports & Analytics */}
        {canViewReports && (
          <div>
            <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Reports & Analytics
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={navItemClass('reports')}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={iconClass('reports')} />
                  <span>Business Reports (14)</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* User Management & Settings */}
        <div>
          <div className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Administration
          </div>
          <div className="space-y-0.5">
            {canManageUsers && (
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={navItemClass('staff')}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={iconClass('staff')} />
                  <span>Staff & Roles</span>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={navItemClass('settings')}
            >
              <div className="flex items-center gap-2.5">
                <Settings className={iconClass('settings')} />
                <span>System Settings</span>
              </div>
            </button>
          </div>
        </div>

      </div>

    </aside>
  );
};
