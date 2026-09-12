import React, { useState } from 'react';
import { Customer } from '../../types';
import { useRentora } from '../../context/RentoraContext';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Calendar, 
  CreditCard, 
  Edit, 
  CheckCircle2, 
  Building,
  FileCheck
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEdit
}) => {
  const { bookings, rentals, vehicles, formatCurrency } = useRentora();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'bookings' | 'notes'>('profile');

  const customerBookings = bookings.filter(b => b.customerId === customer.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={customer.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={customer.firstName}
              className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-display">
                  {customer.firstName} {customer.lastName}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                ID: <span className="font-mono text-slate-200 font-bold">{customer.customerId}</span> • Status: <span className="text-emerald-400 font-semibold">{customer.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-50 border-b border-slate-200 px-5 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'profile', label: 'Customer Overview' },
            { id: 'kyc', label: 'Driving License & KYC' },
            { id: 'bookings', label: `Rental History (${customerBookings.length})` },
            { id: 'notes', label: 'Risk Notes & Preferences' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 border-b-2 transition-all capitalize whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">{customer.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{customer.phone}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Type</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{customer.customerType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{customer.dob}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">City & Country</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{customer.city}, {customer.country}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Status</span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 block">{customer.verificationStatus}</span>
                </div>
              </div>

              {/* Residential Address */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Residential / Business Address</span>
                <span className="font-medium text-slate-800 text-xs">{customer.address}, {customer.city}, {customer.country}</span>
              </div>

              {/* Corporate Details if applicable */}
              {customer.customerType === 'Corporate' && (
                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-900 uppercase">Corporate Account Information</span>
                  </div>
                  <div className="text-xs mt-2">
                    Company: <strong className="text-slate-800">{customer.companyName}</strong>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {customer.emergencyContact && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Emergency Contact</span>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-800">
                    <span>Name: {customer.emergencyContact.name} ({customer.emergencyContact.relationship})</span>
                    <span>Phone: {customer.emergencyContact.phone}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KYC & LICENSE */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" /> Driving License Record
                  </span>
                  <div className="text-xs space-y-1">
                    <div>License #: <strong className="font-mono text-slate-900">{customer.drivingLicenseNumber}</strong></div>
                    <div>Issuing Country: <strong className="text-slate-900">{customer.licenseCountry}</strong></div>
                    <div>Expiry Date: <strong className="text-slate-900">{customer.licenseExpiryDate}</strong></div>
                    <div>Categories Allowed: <strong className="text-slate-900">Class B (Cars & Light Vans)</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity / Passport Record
                  </span>
                  <div className="text-xs space-y-1">
                    <div>Document #: <strong className="font-mono text-slate-900">{customer.passportOrIdNumber}</strong></div>
                    <div>Verification Status: <strong className="text-emerald-700">{customer.verificationStatus}</strong></div>
                    <div>Member Since: <strong className="text-slate-900">{customer.createdAt}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Past & Active Reservations</h4>
              {customerBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No bookings found for this customer.
                </div>
              ) : (
                <div className="space-y-2">
                  {customerBookings.map(b => {
                    const veh = vehicles.find(v => v.id === b.vehicleId);
                    return (
                      <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{b.bookingRef} • {veh?.make} {veh?.model}</div>
                          <div className="text-[11px] text-slate-500">{b.pickupDate} to {b.returnDate} ({b.durationDays} Days)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900">{formatCurrency(b.totalAmount)}</div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Administrative Notes</span>
                <p className="text-slate-700 text-xs leading-relaxed">{customer.notes || 'No administrative notes on file.'}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
