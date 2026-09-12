import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Customer } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  FileCheck, 
  Eye, 
  Edit, 
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CustomerDetailModal } from './CustomerDetailModal';
import { AddCustomerModal } from './AddCustomerModal';

export const CustomerList: React.FC = () => {
  const { customers, bookings } = useRentora();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    if (selectedType !== 'all' && c.customerType !== selectedType) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = `${c.firstName} ${c.lastName}`.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchId = c.customerId.toLowerCase().includes(q);
      const matchLicense = c.drivingLicenseNumber.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchId || matchLicense;
    }
    return true;
  });

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Suspended':
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
            <Users className="w-6 h-6 text-blue-600" />
            Customer Relationship Directory ({filteredCustomers.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified driver licenses, passports, KYC records, rental history, and loyalty tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, license #, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Customer Types</option>
              <option value="Individual">Individual Drivers</option>
              <option value="Corporate">Corporate / B2B Clients</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active & Verified</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Customer Profile</th>
                <th className="px-4 py-3">Contact & City</th>
                <th className="px-4 py-3">Driving License / KYC</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Total Bookings</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const custBookings = bookings.filter(b => b.customerId === cust.id);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={cust.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={cust.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {cust.firstName} {cust.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{cust.customerId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{cust.email}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {cust.phone} • {cust.city}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-800">
                          {cust.drivingLicenseNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Expires: {cust.licenseExpiryDate}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {cust.customerType === 'Corporate' ? (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200 flex items-center gap-1">
                              <Building className="w-3 h-3" /> Corporate
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              Individual
                            </span>
                          )}
                          {cust.companyName && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[100px]">({cust.companyName})</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-800">
                        {custBookings.length} reservations
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(cust.status)}`}>
                          {cust.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingCustomer(cust)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="View Customer Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCustomer(cust)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
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

      {/* Customer Detail Modal */}
      {viewingCustomer && (
        <CustomerDetailModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => {
            setEditingCustomer(viewingCustomer);
            setViewingCustomer(null);
          }}
        />
      )}

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <AddCustomerModal
          customerToEdit={editingCustomer || undefined}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}

    </div>
  );
};
