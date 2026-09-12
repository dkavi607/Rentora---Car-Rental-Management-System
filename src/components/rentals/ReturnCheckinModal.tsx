import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { DamagePoint, ReturnInspection, Payment } from '../../types';
import { 
  X, 
  RotateCcw, 
  Car, 
  Users, 
  Fuel, 
  Gauge, 
  Check, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Receipt,
  Sparkles
} from 'lucide-react';
import { DamageInspector } from './DamageInspector';
import confetti from 'canvas-confetti';

interface ReturnCheckinModalProps {
  rentalId: string;
  onClose: () => void;
}

export const ReturnCheckinModal: React.FC<ReturnCheckinModalProps> = ({
  rentalId,
  onClose
}) => {
  const { 
    rentals, 
    vehicles, 
    customers, 
    bookings,
    processRentalReturn, 
    formatCurrency,
    currentUser,
    settings
  } = useRentora();

  const rental = rentals.find(r => r.id === rentalId);
  const vehicle = vehicles.find(v => v.id === rental?.vehicleId);
  const customer = customers.find(c => c.id === rental?.customerId);
  const booking = bookings.find(b => b.id === rental?.bookingId);

  // Return inspection state
  const startKm = rental?.pickupInspection?.mileage || 15000;
  const [returnMileage, setReturnMileage] = useState<number>(startKm + 350);
  const [returnFuelLevel, setReturnFuelLevel] = useState<number>(100);
  const [exteriorCondition, setExteriorCondition] = useState<'Clean' | 'Minor Dust' | 'Dirty'>('Clean');
  const [interiorCondition, setInteriorCondition] = useState<'Clean' | 'Moderate' | 'Needs Cleaning'>('Clean');
  const [returnDamages, setReturnDamages] = useState<DamagePoint[]>(rental?.pickupInspection?.existingDamages || []);
  const [cleaningFee, setCleaningFee] = useState<number>(0);
  const [lateReturnHours, setLateReturnHours] = useState<number>(0);
  const [settlementNotes, setSettlementNotes] = useState('Vehicle returned in good order.');
  const [settlementPaymentMethod, setSettlementPaymentMethod] = useState<Payment['paymentMethod']>('Card');

  if (!rental || !vehicle || !customer || !booking) {
    return null;
  }

  // Mileage Calculations
  const totalKmDriven = Math.max(0, returnMileage - startKm);
  const allowedKm = 250 * booking.durationDays;
  const excessKm = Math.max(0, totalKmDriven - allowedKm);
  const extraKmRate = vehicle.extraKmRate || 0.35;
  const excessKmCharge = Math.round(excessKm * extraKmRate * 100) / 100;

  // Fuel Shortage Calculation
  const startFuel = rental.pickupInspection?.fuelLevel || 100;
  const fuelDeficit = Math.max(0, startFuel - returnFuelLevel);
  const fuelShortageCharge = Math.round((fuelDeficit / 100) * 80); // $80 full tank refuel basis

  // New Damages Cost
  const startDamageIds = new Set((rental.pickupInspection?.existingDamages || []).map(d => d.id));
  const newDamages = returnDamages.filter(d => !startDamageIds.has(d.id));
  const totalNewDamageCost = newDamages.reduce((sum, d) => sum + (d.estimatedCost || 0), 0);

  // Late Return Charges
  const lateReturnRate = vehicle.lateReturnRate || settings.rentalRules.lateReturnFeePerHour || 25;
  const lateFeeCharge = Math.round(lateReturnHours * lateReturnRate);

  // Net Settlement Math
  const totalExtraCharges = excessKmCharge + fuelShortageCharge + totalNewDamageCost + lateFeeCharge + cleaningFee;
  const depositHeld = rental.depositCollected;
  const retainedFromDeposit = Math.min(depositHeld, totalExtraCharges);
  const refundedDeposit = Math.max(0, depositHeld - totalExtraCharges);
  const additionalDueAfterDeposit = Math.max(0, totalExtraCharges - depositHeld);

  const handleFinishReturn = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const returnInspection: ReturnInspection = {
      actualReturnDate: todayStr,
      actualReturnTime: timeStr,
      returnMileage,
      fuelLevel: returnFuelLevel,
      exteriorCondition,
      interiorCondition,
      tireCondition: 'Good',
      lightsCondition: 'Working',
      glassCondition: 'Intact',
      newDamages,
      photos: [],
      notes: settlementNotes,
      inspectorName: currentUser.name,
      extraKmDriven: excessKm,
      extraKmCharge: excessKmCharge,
      fuelDifferenceCharge: fuelShortageCharge,
      damageCharges: totalNewDamageCost,
      cleaningFee,
      lateHours: lateReturnHours,
      lateFee: lateFeeCharge,
      totalAdditionalCharges: totalExtraCharges,
      depositAmount: depositHeld,
      retainedFromDeposit,
      refundedDeposit,
      additionalDueAfterDeposit,
      signedByCustomer: true,
      customerSignature: `${customer.firstName} ${customer.lastName}`,
      inspectionDate: new Date().toISOString()
    };

    const res = processRentalReturn(
      rental.id,
      returnInspection,
      settlementPaymentMethod
    );

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
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-display">
                Vehicle Return & Settlement Engine
              </h2>
              <p className="text-xs text-slate-400">
                Agreement: <span className="font-mono text-slate-200 font-bold">{rental.rentalAgreementNumber}</span> • Customer: <span className="text-slate-200">{customer.firstName} {customer.lastName}</span>
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

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Top Banner: Rental Baseline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Start Odometer</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{startKm.toLocaleString()} km</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Start Fuel Tank</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{startFuel}%</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Security Deposit Held</span>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">{formatCurrency(rental.depositCollected)}</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Scheduled Return</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{rental.scheduledReturnDate}</div>
            </div>
          </div>

          {/* Return Readings: Odometer & Fuel */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">
              1. Return Telemetry & Fuel Level
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Return Odometer (km) *</label>
                <input
                  type="number"
                  required
                  min={startKm}
                  value={returnMileage}
                  onChange={e => setReturnMileage(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Return Fuel Tank Level (%) *</label>
                <select
                  value={returnFuelLevel}
                  onChange={e => setReturnFuelLevel(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={100}>Full (100%)</option>
                  <option value={85}>85% (7/8 Tank)</option>
                  <option value={75}>75% (3/4 Tank)</option>
                  <option value={50}>50% (Half Tank)</option>
                  <option value={25}>25% (Quarter Tank)</option>
                  <option value={0}>Empty (0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Late Return (Hours)</label>
                <input
                  type="number"
                  min="0"
                  value={lateReturnHours}
                  onChange={e => setLateReturnHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sanitization / Deep Clean ($)</label>
                <input
                  type="number"
                  min="0"
                  value={cleaningFee}
                  onChange={e => setCleaningFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Mileage Stats */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px]">
              <div>Distance Driven: <strong>{totalKmDriven} km</strong></div>
              <div>Free Allowance: <strong>{allowedKm} km</strong></div>
              <div>Excess Distance: <strong className={excessKm > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>{excessKm} km ({formatCurrency(excessKmCharge)})</strong></div>
            </div>
          </div>

          {/* Interactive Damage Inspection for Return */}
          <div>
            <DamageInspector
              damages={returnDamages}
              onChange={setReturnDamages}
              readOnly={false}
              isReturnInspection={true}
              title="2. Return Physical Inspection & New Damage Discovery"
            />
          </div>

          {/* Deposit Settlement Calculation Breakdown */}
          <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
            <h4 className="font-bold text-blue-950 uppercase tracking-wide text-xs flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-blue-600" />
              3. Deposit Reconciliation & Settlement Balance
            </h4>

            <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Original Security Deposit Collected:</span>
                <span className="font-extrabold text-slate-900">{formatCurrency(depositHeld)}</span>
              </div>

              {excessKmCharge > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Excess Mileage Charge ({excessKm} km @ {formatCurrency(extraKmRate)}/km):</span>
                  <span className="font-bold">-{formatCurrency(excessKmCharge)}</span>
                </div>
              )}

              {fuelShortageCharge > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Fuel Tank Refill Shortage Fee ({fuelDeficit}%):</span>
                  <span className="font-bold">-{formatCurrency(fuelShortageCharge)}</span>
                </div>
              )}

              {totalNewDamageCost > 0 && (
                <div className="flex justify-between text-red-700 font-semibold">
                  <span>New Damage Repair Deduction ({newDamages.length} marks):</span>
                  <span className="font-bold">-{formatCurrency(totalNewDamageCost)}</span>
                </div>
              )}

              {lateFeeCharge > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Late Return Surcharge ({lateReturnHours} hrs @ {formatCurrency(lateReturnRate)}/hr):</span>
                  <span className="font-bold">-{formatCurrency(lateFeeCharge)}</span>
                </div>
              )}

              {cleaningFee > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Special Cleaning / Detailing Surcharge:</span>
                  <span className="font-bold">-{formatCurrency(cleaningFee)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                {refundedDeposit >= 0 && additionalDueAfterDeposit === 0 ? (
                  <>
                    <span className="text-emerald-800">Net Deposit Refund to Customer:</span>
                    <span className="text-emerald-600 text-lg">{formatCurrency(refundedDeposit)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-700">Net Outstanding Balance Due from Customer:</span>
                    <span className="text-red-600 text-lg">{formatCurrency(additionalDueAfterDeposit)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-slate-700 font-semibold mb-1">Settlement Payment Method</label>
              <select
                value={settlementPaymentMethod}
                onChange={e => setSettlementPaymentMethod(e.target.value as any)}
                className="w-full sm:w-64 p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none"
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
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
            onClick={handleFinishReturn}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Return & Settle Deposit</span>
          </button>
        </div>

      </div>
    </div>
  );
};
