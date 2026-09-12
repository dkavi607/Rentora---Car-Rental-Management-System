import React, { useState } from 'react';
import { RentoraProvider, useRentora } from './context/RentoraContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { CarList } from './components/fleet/CarList';
import { AddCarModal } from './components/fleet/AddCarModal';
import { CarCategories } from './components/fleet/CarCategories';
import { FleetDocuments } from './components/fleet/FleetDocuments';
import { CustomerList } from './components/customers/CustomerList';
import { BookingList } from './components/bookings/BookingList';
import { BookingWizardModal } from './components/bookings/BookingWizardModal';
import { ActiveRentalsList } from './components/rentals/ActiveRentalsList';
import { PickupHandoverModal } from './components/rentals/PickupHandoverModal';
import { AvailabilityCalendar } from './components/pricing/AvailabilityCalendar';
import { PricingPlansView } from './components/pricing/PricingPlansView';
import { PromoCodesView } from './components/pricing/PromoCodesView';
import { InvoicesPaymentsView } from './components/financials/InvoicesPaymentsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { StaffRolesView } from './components/users/StaffRolesView';
import { SettingsView } from './components/settings/SettingsView';
import { CustomerPortalView } from './components/customer-portal/CustomerPortalView';

const MainAppContent: React.FC = () => {
  const { currentRole } = useRentora();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(false);

  // Global Modals
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [handoverBookingId, setHandoverBookingId] = useState<string | null>(null);

  const handleStartHandover = (bookingId: string) => {
    setHandoverBookingId(bookingId);
  };

  const renderActiveView = () => {
    if (isCustomerMode || activeTab.startsWith('customer-')) {
      return <CustomerPortalView />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewBooking={() => setIsNewBookingModalOpen(true)}
            onOpenNewCar={() => setIsAddCarModalOpen(true)}
            onStartHandover={handleStartHandover}
          />
        );

      case 'cars':
        return <CarList onOpenAddCar={() => setIsAddCarModalOpen(true)} />;

      case 'categories':
        return <CarCategories />;

      case 'fleet-docs':
        return <FleetDocuments />;

      case 'customers':
        return <CustomerList />;

      case 'bookings':
        return (
          <BookingList
            onStartHandover={handleStartHandover}
            onOpenNewBooking={() => setIsNewBookingModalOpen(true)}
          />
        );

      case 'rentals':
        return <ActiveRentalsList />;

      case 'calendar':
        return (
          <AvailabilityCalendar
            onSelectSlot={(vehId, date) => {
              setIsNewBookingModalOpen(true);
            }}
          />
        );

      case 'pricing':
        return <PricingPlansView />;

      case 'promos':
        return <PromoCodesView />;

      case 'invoices':
      case 'payments':
      case 'deposits':
      case 'expenses':
        return <InvoicesPaymentsView />;

      case 'maintenance':
        return <MaintenanceView />;

      case 'reports':
        return <ReportsAnalyticsView />;

      case 'staff':
        return <StaffRolesView />;

      case 'settings':
        return <SettingsView />;

      default:
        return (
          <AdminDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewBooking={() => setIsNewBookingModalOpen(true)}
            onOpenNewCar={() => setIsAddCarModalOpen(true)}
            onStartHandover={handleStartHandover}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewBooking={() => setIsNewBookingModalOpen(true)}
        onOpenNewCar={() => setIsAddCarModalOpen(true)}
        isCustomerMode={isCustomerMode}
        setIsCustomerMode={setIsCustomerMode}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex">
        {/* Left Modular Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewBooking={() => setIsNewBookingModalOpen(true)}
          onOpenNewCar={() => setIsAddCarModalOpen(true)}
          isCustomerMode={isCustomerMode}
          setIsCustomerMode={setIsCustomerMode}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Add New Car Modal */}
      {isAddCarModalOpen && (
        <AddCarModal
          onClose={() => setIsAddCarModalOpen(false)}
        />
      )}

      {/* New Booking Wizard Modal */}
      {isNewBookingModalOpen && (
        <BookingWizardModal
          onClose={() => setIsNewBookingModalOpen(false)}
        />
      )}

      {/* Handover Modal */}
      {handoverBookingId && (
        <PickupHandoverModal
          bookingId={handoverBookingId}
          onClose={() => setHandoverBookingId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <RentoraProvider>
      <MainAppContent />
    </RentoraProvider>
  );
}
