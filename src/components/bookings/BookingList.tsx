import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Booking, BookingStatus } from '../../types';
import { 
  BookmarkCheck, 
  Search, 
  Plus, 
  Car, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  KeyRound, 
  FileText, 
  Eye, 
  XCircle,
  MapPin
} from 'lucide-react';
import { BookingWizardModal } from './BookingWizardModal';

interface BookingListProps {
  onStartHandover?: (bookingId: string) => void;
  onOpenNewBooking?: () => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  onStartHandover,
  onOpenNewBooking
}) => {
  const { 
    bookings, 
    vehicles, 
    customers, 
    branches, 
    updateBookingStatus, 
    formatCurrency, 
    selectedBranchId 
  } = useRentora();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (selectedBranchId !== 'all' && b.pickupBranchId !== selectedBranchId) return false;
    if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = b.bookingRef.toLowerCase().includes(q);
      const cust = customers.find(c => c.id === b.customerId);
      const veh = vehicles.find(v => v.id === b.vehicleId);
      const matchCust = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(q) : false;
      const matchVeh = veh ? `${veh.make} ${veh.model} ${veh.regNumber}`.toLowerCase().includes(q) : false;
      return matchNum || matchCust || matchVeh;
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
      case 'Ready for Pickup':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
      case 'Awaiting Payment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
      case 'No Show':
        return 'bg-red-50 text-red-700 border-red-200';
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
            <BookmarkCheck className="w-6 h-6 text-blue-600" />
            Reservations & Booking Registry ({filteredBookings.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage advance reservations, dates, driver assignments, and initiate vehicle handovers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation Wizard</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search booking #, customer name, vehicle model, plate..."
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
              <option value="all">All Booking Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Active">Active On Road</option>
              <option value="Pending">Pending</option>
              <option value="Awaiting Payment">Awaiting Payment</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Booking #</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Dates & Duration</th>
                <th className="px-4 py-3">Total / Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => {
                  const veh = vehicles.find(v => v.id === b.vehicleId);
                  const cust = customers.find(c => c.id === b.customerId);
                  const pickupBranch = branches.find(br => br.id === b.pickupBranchId);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Booking # */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-black text-slate-900">{b.bookingRef}</div>
                        <div className="text-[10px] text-slate-400">{b.createdAt}</div>
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
                            <div className="text-[10px] text-slate-500 font-mono">{veh?.regNumber}</div>
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
                        <div className="font-semibold text-slate-800">
                          {b.pickupDate} → {b.returnDate}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{b.durationDays} Days ({pickupBranch?.city || 'Station'})</span>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="px-4 py-3">
                        <div className="font-black text-slate-900">{formatCurrency(b.totalAmount)}</div>
                        <div className="text-[10px] text-slate-500">
                          Paid: <strong className="text-emerald-700">{formatCurrency(b.paidAmount)}</strong> • Due: <strong className="text-amber-700">{formatCurrency(b.balanceDue)}</strong>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Handover Button if ready */}
                          {(b.status === 'Confirmed' || b.status === 'Ready for Pickup') && onStartHandover && (
                            <button
                              type="button"
                              onClick={() => onStartHandover(b.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Handover</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="View Booking Details"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Booking Summary Detail View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-display flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-blue-400" />
                  Reservation: {selectedBooking.bookingRef}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Created on {selectedBooking.createdAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rental Period</span>
                  <span className="font-bold text-slate-900">{selectedBooking.pickupDate} {selectedBooking.pickupTime} to {selectedBooking.returnDate} {selectedBooking.returnTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Duration</span>
                  <span className="font-bold text-slate-900">{selectedBooking.durationDays} Days</span>
                </div>
              </div>

              {/* Extra Addons */}
              {selectedBooking.extraServices.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Selected Extra Services</span>
                  <div className="space-y-1">
                    {selectedBooking.extraServices.map(ext => (
                      <div key={ext.serviceId} className="flex justify-between text-slate-700">
                        <span>{ext.name}</span>
                        <span className="font-bold">{formatCurrency(ext.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Summary Table */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rate ({selectedBooking.durationDays} days):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedBooking.baseRentalTotal)}</span>
                </div>
                {selectedBooking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Applied:</span>
                    <span className="font-bold">-{formatCurrency(selectedBooking.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({selectedBooking.taxRate}%):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedBooking.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedBooking.securityDeposit)}</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between text-sm font-extrabold text-blue-950">
                  <span>Total Amount Due:</span>
                  <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Wizard Modal */}
      {isWizardOpen && (
        <BookingWizardModal
          onClose={() => setIsWizardOpen(false)}
        />
      )}

    </div>
  );
};
