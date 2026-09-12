import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Vehicle } from '../../types';
import { 
  Car, 
  Search, 
  Users, 
  Fuel, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MapPin,
  Star
} from 'lucide-react';
import { BookingWizardModal } from '../bookings/BookingWizardModal';

export const CustomerPortalView: React.FC = () => {
  const { vehicles, categories, bookings, currentUser, formatCurrency } = useRentora();

  const [activeTab, setActiveTab] = useState<'catalog' | 'my-bookings'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<string | null>(null);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (v.status === 'Maintenance' || v.status === 'Unavailable' || v.status === 'Inactive') return false;
    if (selectedCategory !== 'all' && v.categoryId !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return `${v.make} ${v.model}`.toLowerCase().includes(q) || v.transmission.toLowerCase().includes(q);
    }
    return true;
  });

  // Current customer bookings
  const myBookings = bookings.filter(b => b.customerId === currentUser.id || b.customerId === 'cust-1');

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Premium Rental Experience
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
            Reserve Your Journey with <span className="text-blue-500">Rentora</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Transparent pricing, sanitized pristine fleet, 24/7 roadside assistance, and instant digital agreement sign-off.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Explore Available Fleet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-bookings')}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                activeTab === 'my-bookings' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              My Reservations ({myBookings.length})
            </button>
          </div>
        </div>

        {/* Decorative ambient glow */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* TAB 1: FLEET CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by make, model (e.g. Toyota, Benz, Prius)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Classes
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(veh => {
              const cat = categories.find(c => c.id === veh.categoryId);

              return (
                <div
                  key={veh.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img
                        src={veh.mainImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-black backdrop-blur-xs">
                        {formatCurrency(veh.dailyRate)} <span className="text-[10px] font-normal text-slate-300">/day</span>
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                          {cat?.name || 'Class'}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 font-display">
                          {veh.make} {veh.model} ({veh.year})
                        </h3>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {veh.seats} Seats
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-400" /> {veh.transmission}
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" /> {veh.fuelType}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 200 km / day included
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 24/7 Roadside Assistance
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForBooking(veh.id)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Book This Vehicle</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: MY RESERVATIONS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Booking History</h2>
          
          {myBookings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              You do not have any active or past reservations yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myBookings.map(b => {
                const veh = vehicles.find(v => v.id === b.vehicleId);

                return (
                  <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-600 text-xs">{b.bookingRef}</span>
                        <h4 className="text-base font-black text-slate-900 font-display mt-0.5">
                          {veh?.make} {veh?.model}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                      <div>Period: <strong>{b.pickupDate} → {b.returnDate} ({b.durationDays} Days)</strong></div>
                      <div>Total Value: <strong className="text-slate-900">{formatCurrency(b.totalAmount)}</strong></div>
                      <div>Deposit Paid: <strong className="text-emerald-700">{formatCurrency(b.paidAmount)}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Wizard Modal */}
      {selectedVehicleForBooking && (
        <BookingWizardModal
          initialVehicleId={selectedVehicleForBooking}
          onClose={() => setSelectedVehicleForBooking(null)}
        />
      )}

    </div>
  );
};
