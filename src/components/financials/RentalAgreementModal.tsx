import React from 'react';
import { Rental, Vehicle, Customer, Booking } from '../../types';
import { useRentora } from '../../context/RentoraContext';
import { 
  X, 
  Printer, 
  Car, 
  FileText, 
  Shield, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Building
} from 'lucide-react';

interface RentalAgreementModalProps {
  rental: Rental;
  onClose: () => void;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  rental,
  onClose
}) => {
  const { vehicles, customers, bookings, branches, settings, formatCurrency } = useRentora();

  const vehicle = vehicles.find(v => v.id === rental.vehicleId);
  const customer = customers.find(c => c.id === rental.customerId);
  const booking = bookings.find(b => b.id === rental.bookingId);
  const branch = branches.find(br => br.id === vehicle?.branchId);

  if (!vehicle || !customer || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Action Header (Excluded in print mode) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Rental Agreement Contract #{rental.rentalAgreementNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document Body */}
        <div className="p-8 overflow-y-auto flex-1 text-slate-800 text-xs leading-relaxed space-y-6 bg-white printable-area">
          
          {/* Company Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 font-display flex items-center gap-2">
                <Car className="w-7 h-7 text-blue-600" />
                <span>Rent<span className="text-blue-600">ora</span> Fleet Systems</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {settings.business.companyName} • Tax ID: {settings.business.taxNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                {settings.business.address} • Hotline: {settings.business.phone} • Email: {settings.business.email}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black font-display text-slate-900 uppercase">
                Rental Agreement
              </div>
              <div className="text-xs font-mono font-bold text-blue-700">{rental.rentalAgreementNumber}</div>
              <div className="text-[11px] text-slate-500 mt-1">Date: {rental.actualPickupDate}</div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                Status: {rental.status}
              </span>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900 mb-2 border-b border-slate-200 pb-1">
                1. Renter / Authorized Driver
              </h4>
              <div className="space-y-1 text-xs">
                <div>Name: <strong>{customer.firstName} {customer.lastName}</strong></div>
                <div>Driving License: <strong className="font-mono">{customer.drivingLicenseNumber}</strong> (Exp: {customer.licenseExpiryDate})</div>
                <div>NIC / Passport: <strong className="font-mono">{customer.passportOrIdNumber}</strong></div>
                <div>Phone: <strong>{customer.phone}</strong></div>
                <div>Email: <strong>{customer.email}</strong></div>
                <div>Address: <strong>{customer.address}, {customer.city}</strong></div>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900 mb-2 border-b border-slate-200 pb-1">
                2. Assigned Vehicle Particulars
              </h4>
              <div className="space-y-1 text-xs">
                <div>Vehicle: <strong>{vehicle.make} {vehicle.model} ({vehicle.year})</strong></div>
                <div>License Plate: <strong className="font-mono text-blue-700">{vehicle.regNumber}</strong></div>
                <div>VIN: <strong className="font-mono">{vehicle.vin}</strong></div>
                <div>Color & Fuel: <strong>{vehicle.color} • {vehicle.fuelType}</strong></div>
                <div>Start Odometer: <strong>{rental.pickupInspection?.mileage?.toLocaleString() || vehicle.mileage.toLocaleString()} km</strong></div>
                <div>Start Fuel Level: <strong>{rental.pickupInspection?.fuelLevel || 100}%</strong></div>
              </div>
            </div>
          </div>

          {/* Rental Duration & Financials */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">
              3. Rental Terms & Schedule
            </h4>
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Pickup Date & Time:</span>
                <strong>{rental.actualPickupDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Scheduled Return:</span>
                <strong>{rental.scheduledReturnDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Total Contract Duration:</span>
                <strong>{booking.durationDays} Days</strong>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">
              4. Financial Charges & Deposit
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-center">Unit Rate</th>
                  <th className="p-2.5 text-center">Duration</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-semibold">Standard Vehicle Rental Rate</td>
                  <td className="p-2.5 text-center">{formatCurrency(booking.dailyRate)}/day</td>
                  <td className="p-2.5 text-center">{booking.durationDays} Days</td>
                  <td className="p-2.5 text-right font-bold">{formatCurrency(booking.baseRentalTotal)}</td>
                </tr>
                {booking.extraServices.map(ext => (
                  <tr key={ext.serviceId}>
                    <td className="p-2.5">{ext.name}</td>
                    <td className="p-2.5 text-center">{formatCurrency(ext.price)}/{ext.isPerDay ? 'day' : 'total'}</td>
                    <td className="p-2.5 text-center">{ext.isPerDay ? `${booking.durationDays} Days` : '1'}</td>
                    <td className="p-2.5 text-right font-bold">{formatCurrency(ext.total)}</td>
                  </tr>
                ))}
                {booking.discountAmount > 0 && (
                  <tr>
                    <td colSpan={3} className="p-2.5 font-bold text-emerald-700">Promotional Discount Applied ({booking.discountCode || 'PROMO'})</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">-{formatCurrency(booking.discountAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="p-2.5 text-slate-600">Government Tax / VAT ({booking.taxRate}%)</td>
                  <td className="p-2.5 text-right font-bold">{formatCurrency(booking.taxAmount)}</td>
                </tr>
                <tr className="bg-blue-50/50 font-black text-slate-900">
                  <td colSpan={3} className="p-2.5">Total Rental Value</td>
                  <td className="p-2.5 text-right text-blue-700">{formatCurrency(booking.totalAmount)}</td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold text-slate-800">
                  <td colSpan={3} className="p-2.5">Refundable Security Deposit Held</td>
                  <td className="p-2.5 text-right text-emerald-800">{formatCurrency(rental.depositCollected)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal Terms & Conditions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[10px] space-y-1 text-slate-600 leading-relaxed">
            <h5 className="font-extrabold uppercase text-slate-800">5. Summary Conditions of Rental:</h5>
            <p>1. The Renter agrees to return the vehicle in the same condition as received, ordinary wear and tear excepted, on the date and time specified.</p>
            <p>2. Vehicle is to be operated exclusively by authorized verified drivers with valid driver licenses.</p>
            <p>3. Renter acknowledges fuel policy: return with identical fuel level or fuel refill surcharges apply.</p>
            <p>4. Security deposit is refundable within 24 hours of return inspection settlement minus any damage or excess mileage.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t-2 border-slate-900">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-8">Authorized Officer Signature</div>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-bold font-mono text-slate-800">Rentora Central Branch Dispatch</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Authorized Representative</div>
            </div>

            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-8">Customer / Driver Signature</div>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-bold font-mono text-blue-700">{customer.firstName} {customer.lastName}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">I have read, understood, and agreed to all terms.</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
