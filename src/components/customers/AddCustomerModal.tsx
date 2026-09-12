import React, { useState } from 'react';
import { Customer } from '../../types';
import { useRentora } from '../../context/RentoraContext';
import { X, Users, User, Mail, Phone, MapPin, Building, FileCheck } from 'lucide-react';

interface AddCustomerModalProps {
  customerToEdit?: Customer;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  customerToEdit,
  onClose
}) => {
  const { addCustomer, updateCustomer } = useRentora();
  const isEditing = !!customerToEdit;

  const [firstName, setFirstName] = useState(customerToEdit?.firstName || '');
  const [lastName, setLastName] = useState(customerToEdit?.lastName || '');
  const [email, setEmail] = useState(customerToEdit?.email || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [altPhone, setAltPhone] = useState(customerToEdit?.altPhone || '');
  const [customerType, setCustomerType] = useState<'Individual' | 'Corporate'>(customerToEdit?.customerType || 'Individual');
  const [status, setStatus] = useState<'Active' | 'Suspended' | 'Inactive'>(customerToEdit?.status || 'Active');

  const [dob, setDob] = useState(customerToEdit?.dob || '1992-05-14');
  const [country, setCountry] = useState(customerToEdit?.country || 'Sri Lanka');
  const [passportOrIdNumber, setPassportOrIdNumber] = useState(customerToEdit?.passportOrIdNumber || '');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(customerToEdit?.drivingLicenseNumber || '');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(customerToEdit?.licenseExpiryDate || '2028-11-20');
  const [licenseCountry, setLicenseCountry] = useState(customerToEdit?.licenseCountry || 'Sri Lanka');
  const [verificationStatus, setVerificationStatus] = useState<'Verified' | 'Pending' | 'Rejected'>(customerToEdit?.verificationStatus || 'Verified');

  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [city, setCity] = useState(customerToEdit?.city || 'Colombo');

  const [companyName, setCompanyName] = useState(customerToEdit?.companyName || '');

  const [emergencyName, setEmergencyName] = useState(customerToEdit?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(customerToEdit?.emergencyContact?.phone || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(customerToEdit?.emergencyContact?.relationship || 'Spouse');

  const [notes, setNotes] = useState(customerToEdit?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !drivingLicenseNumber.trim()) {
      alert('Please fill all mandatory fields including driver license number.');
      return;
    }

    const customerData: Customer = {
      id: customerToEdit ? customerToEdit.id : `cust-${Date.now()}`,
      customerId: customerToEdit ? customerToEdit.customerId : `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      customerType,
      status,
      dob,
      passportOrIdNumber: passportOrIdNumber.trim(),
      drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
      licenseExpiryDate,
      licenseCountry,
      verificationStatus,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      companyName: customerType === 'Corporate' ? companyName.trim() : undefined,
      emergencyContact: emergencyName.trim() ? {
        name: emergencyName.trim(),
        relationship: emergencyRelationship.trim(),
        phone: emergencyPhone.trim()
      } : undefined,
      totalBookings: customerToEdit?.totalBookings || 0,
      totalSpent: customerToEdit?.totalSpent || 0,
      createdAt: customerToEdit?.createdAt || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      profileImage: customerToEdit?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };

    if (isEditing && customerToEdit) {
      updateCustomer(customerToEdit.id, customerData);
    } else {
      addCustomer(customerData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-display">
                {isEditing ? `Edit Customer: ${customerToEdit.firstName} ${customerToEdit.lastName}` : 'Register New Customer Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter driver credentials, verification documents, and contact details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            
            {/* Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Customer Classification</label>
                <select
                  value={customerType}
                  onChange={e => setCustomerType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                >
                  <option value="Individual">Individual Driver</option>
                  <option value="Corporate">Corporate / B2B Company</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Corporate Fields if selected */}
            {customerType === 'Corporate' && (
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                <label className="block text-purple-900 font-bold mb-1">Registered Corporate Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Global Logistics Ltd."
                  className="w-full p-2 bg-white border border-purple-300 rounded-lg focus:outline-none"
                />
              </div>
            )}

            {/* Driving License & KYC */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" /> Driving License & Identity Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Driving License # *</label>
                  <input
                    type="text"
                    required
                    value={drivingLicenseNumber}
                    onChange={e => setDrivingLicenseNumber(e.target.value)}
                    placeholder="e.g. B8923491"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiryDate}
                    onChange={e => setLicenseExpiryDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Passport / National ID</label>
                  <input
                    type="text"
                    value={passportOrIdNumber}
                    onChange={e => setPassportOrIdNumber(e.target.value)}
                    placeholder="e.g. N19928341"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 45 Galle Road, Kollupitiya"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  placeholder="Full name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="+94 71 987 6543"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={e => setEmergencyRelationship(e.target.value)}
                  placeholder="Spouse, Sibling, Manager"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Internal Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Driver preferences, special conditions..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20"
            >
              {isEditing ? 'Save Customer Changes' : 'Register Customer Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
