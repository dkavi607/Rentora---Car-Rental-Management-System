import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { DamagePoint, PickupInspection } from '../../types';
import { 
  KeyRound, 
  X, 
  Car, 
  Calendar, 
  ShieldCheck, 
  Gauge, 
  Check, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { DamageInspector } from './DamageInspector';
import confetti from 'canvas-confetti';

interface PickupHandoverModalProps {
  bookingId: string;
  onClose: () => void;
}

export const PickupHandoverModal: React.FC<PickupHandoverModalProps> = ({
  bookingId,
  onClose
}) => {
  const { 
    bookings, 
    vehicles, 
    customers, 
    startRentalHandover, 
    formatCurrency, 
    currentUser 
  } = useRentora();

  const booking = bookings.find(b => b.id === bookingId);
  const vehicle = vehicles.find(v => v.id === booking?.vehicleId);
  const customer = customers.find(c => c.id === booking?.customerId);

  // Handover state
  const [startMileage, setStartMileage] = useState<number>(vehicle?.mileage || 15000);
  const [fuelPercentage, setFuelPercentage] = useState<number>(100);
  const [exteriorCondition, setExteriorCondition] = useState<'Clean' | 'Minor Dust' | 'Dirty'>('Clean');
  const [interiorCondition, setInteriorCondition] = useState<'Clean' | 'Moderate' | 'Needs Cleaning'>('Clean');
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [handoverNotes, setHandoverNotes] = useState('Vehicle inspected with customer. All accessories verified.');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Bank Transfer'>('Card');
  
  // Checklist items
  const [checklist, setChecklist] = useState({
    licenseVerified: true,
    depositCollected: true,
    keysHanded: true,
    fuelTankVerified: true,
    accessoriesChecked: true,
    emergencyNumberProvided: true
  });

  if (!booking || !vehicle || !customer) {
    return null;
  }

  const handleConfirmHandover = () => {
    const inspection: PickupInspection = {
      mileage: startMileage,
      fuelLevel: fuelPercentage,
      exteriorCondition,
      interiorCondition,
      tireCondition: 'Good',
      lightsCondition: 'Working',
      glassCondition: 'Intact',
      existingDamages: damages,
      photos: [],
      notes: handoverNotes,
      inspectorName: currentUser.name,
      signedByCustomer: true,
      customerSignature: `${customer.firstName} ${customer.lastName}`,
      inspectionDate: new Date().toISOString()
    };

    const res = startRentalHandover(booking.id, inspection, booking.securityDeposit, paymentMethod);

    if (res.success) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-display">
                Vehicle Pickup Handover Protocol
              </h2>
              <p className="text-xs text-slate-400">
                Reservation: <span className="font-mono text-slate-200 font-bold">{booking.bookingRef}</span> • Vehicle: <span className="text-slate-200">{vehicle.make} {vehicle.model}</span>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Customer Driver</span>
              <div className="font-bold text-slate-900 text-sm">{customer.firstName} {customer.lastName}</div>
              <div className="text-slate-500 text-[11px]">License: {customer.drivingLicenseNumber}</div>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Assigned Vehicle</span>
              <div className="font-bold text-slate-900 text-sm">{vehicle.make} {vehicle.model}</div>
              <div className="text-slate-500 font-mono text-[11px]">Plate: {vehicle.regNumber}</div>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Deposit & Financials</span>
              <div className="font-bold text-emerald-700 text-sm">Deposit: {formatCurrency(booking.securityDeposit)}</div>
              <div className="text-slate-500 text-[11px]">Duration: {booking.durationDays} Days</div>
            </div>
          </div>

          {/* Odometer & Fuel Level Confirmation */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide text-xs">
              <Gauge className="w-4 h-4 text-blue-600" />
              1. Mileage & Fuel Verification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Starting Odometer Reading (km) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={startMileage}
                  onChange={e => setStartMileage(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fuel Tank Level (%) *</label>
                <select
                  value={fuelPercentage}
                  onChange={e => setFuelPercentage(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={100}>Full (100%)</option>
                  <option value={85}>85% (7/8 Tank)</option>
                  <option value={75}>75% (3/4 Tank)</option>
                  <option value={50}>50% (Half Tank)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deposit Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Card">Credit/Debit Card (Hold Auth)</option>
                  <option value="Cash">Cash Deposit</option>
                  <option value="Bank Transfer">Bank Wire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Damage & Condition Inspector */}
          <div>
            <DamageInspector
              damages={damages}
              onChange={setDamages}
              readOnly={false}
              title="2. Pre-Departure Vehicle Physical Inspection"
            />
          </div>

          {/* Handover Safety Checklist */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">
              3. Operational Handover Checklist
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'licenseVerified', label: 'Physical Driving License Checked & Verified' },
                { key: 'depositCollected', label: `Security Deposit (${formatCurrency(booking.securityDeposit)}) Secured` },
                { key: 'keysHanded', label: 'Original Vehicle Smart Key & Remote Handed' },
                { key: 'fuelTankVerified', label: 'Customer Acknowledged Fuel Policy' },
                { key: 'accessoriesChecked', label: 'Spare Tire, Jack & First Aid Kit Present' },
                { key: 'emergencyNumberProvided', label: '24/7 Roadside Assistance Card Provided' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={e => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Staff & Customer Signatures */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Dispatching Officer</span>
              <div className="font-bold text-slate-900">{currentUser.name} ({currentUser.role})</div>
              <div className="text-slate-400 text-[10px]">Date: {new Date().toLocaleDateString()}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Digital Acceptance</span>
              <div className="p-2.5 bg-white border border-slate-300 rounded-lg flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700">{customer.firstName} {customer.lastName}</span>
                <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> E-Signed
                </span>
              </div>
            </div>
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
            type="button"
            onClick={handleConfirmHandover}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Complete Handover & Dispatch Vehicle</span>
          </button>
        </div>

      </div>
    </div>
  );
};
