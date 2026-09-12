import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Rental } from '../../types';
import { 
  KeyRound, 
  Search, 
  RotateCcw, 
  FileText, 
  Printer, 
  Calendar, 
  Car, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Receipt,
  Eye,
  Plus
} from 'lucide-react';
import { ReturnCheckinModal } from './ReturnCheckinModal';
import { RentalAgreementModal } from '../financials/RentalAgreementModal';

export const ActiveRentalsList: React.FC = () => {
  const { 
    rentals, 
    vehicles, 
    customers, 
    bookings, 
    formatCurrency, 
    selectedBranchId 
  } = useRentora();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [returnRentalId, setReturnRentalId] = useState<string | null>(null);
  const [viewAgreementRental, setViewAgreementRental] = useState<Rental | null>(null);

  const filteredRentals = rentals.filter(r => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = r.rentalAgreementNumber.toLowerCase().includes(q);
      const cust = customers.find(c => c.id === r.customerId);
      const veh = vehicles.find(v => v.id === r.vehicleId);
      const matchCust = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(q) : false;
      const matchVeh = veh ? `${veh.make} ${veh.model} ${veh.regNumber}`.toLowerCase().includes(q) : false;
      return matchNum || matchCust || matchVeh;
    }
    return true;
  });

  const getStatusBadge = (status: Rental['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-blue-600" />
            Active Rentals & Vehicle Lifecycle ({filteredRentals.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of dispatched vehicles, odometer logs, deposit management, and returns.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agreement #, driver name, vehicle model, plate..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Lifecycle Statuses</option>
              <option value="Active">Active On Road</option>
              <option value="Overdue">Overdue for Return</option>
              <option value="Completed">Completed & Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Rental Agreement #</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Customer / Driver</th>
                <th className="px-4 py-3">Dispatched / Due Date</th>
                <th className="px-4 py-3">Start Odometer & Fuel</th>
                <th className="px-4 py-3">Deposit Held</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No active rentals found.
                  </td>
                </tr>
              ) : (
                filteredRentals.map(rental => {
                  const veh = vehicles.find(v => v.id === rental.vehicleId);
                  const cust = customers.find(c => c.id === rental.customerId);
                  const booking = bookings.find(b => b.id === rental.bookingId);

                  return (
                    <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Agreement # */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-black text-slate-900">{rental.rentalAgreementNumber}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Agreement Generated</div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={veh?.mainImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=80&q=80'}
                            alt=""
                            className="w-10 h-7 object-cover rounded border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{veh?.make} {veh?.model}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-semibold">{veh?.regNumber}</div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{cust?.firstName} {cust?.lastName}</div>
                        <div className="text-[10px] text-slate-400">{cust?.phone}</div>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {rental.actualPickupDate} → {rental.scheduledReturnDate}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {booking?.durationDays || 3} Rental Days
                        </div>
                      </td>

                      {/* Telemetry */}
                      <td className="px-4 py-3 font-medium text-slate-700">
                        <div>{rental.pickupInspection.mileage.toLocaleString()} km</div>
                        <div className="text-[10px] text-slate-400">Fuel: {rental.pickupInspection.fuelLevel}%</div>
                      </td>

                      {/* Deposit */}
                      <td className="px-4 py-3 font-extrabold text-slate-900">
                        {formatCurrency(rental.depositCollected)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Process Return Button if Active/Overdue */}
                          {(rental.status === 'Active' || rental.status === 'Overdue') && (
                            <button
                              type="button"
                              onClick={() => setReturnRentalId(rental.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return Check-in</span>
                            </button>
                          )}

                          {/* Print Agreement Contract */}
                          <button
                            type="button"
                            onClick={() => setViewAgreementRental(rental)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="View / Print Legal Agreement"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Checkin Modal */}
      {returnRentalId && (
        <ReturnCheckinModal
          rentalId={returnRentalId}
          onClose={() => setReturnRentalId(null)}
        />
      )}

      {/* Rental Agreement Print Modal */}
      {viewAgreementRental && (
        <RentalAgreementModal
          rental={viewAgreementRental}
          onClose={() => setViewAgreementRental(null)}
        />
      )}

    </div>
  );
};
