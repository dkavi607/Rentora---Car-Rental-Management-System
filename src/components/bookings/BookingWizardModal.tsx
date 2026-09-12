import React, { useState, useMemo } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Vehicle, Customer, Booking, ExtraService, PaymentStatus } from '../../types';
import { 
  X, 
  Calendar, 
  Car, 
  Users, 
  Plus, 
  Check, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  Clock, 
  FileCheck, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingWizardModalProps {
  initialVehicleId?: string;
  onClose: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  initialVehicleId,
  onClose
}) => {
  const { 
    vehicles, 
    categories, 
    customers, 
    branches, 
    extraServices, 
    promoCodes, 
    calculateRentalQuote, 
    checkVehicleAvailability, 
    createBooking, 
    formatCurrency 
  } = useRentora();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Dates & Location State
  const [pickupDate, setPickupDate] = useState('2026-09-15');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState('2026-09-19');
  const [returnTime, setReturnTime] = useState('10:00');
  const [pickupBranchId, setPickupBranchId] = useState(branches[0]?.id || 'br-1');
  const [returnBranchId, setReturnBranchId] = useState(branches[0]?.id || 'br-1');

  // Step 2: Vehicle Selection State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Step 3: Customer Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerSearch, setCustomerSearch] = useState('');

  // Step 4: Extra Addons State
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);

  // Step 5: Promo Code & Pricing State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [promoError, setPromoError] = useState('');

  // Step 6: Payment Info State
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Bank Transfer' | 'Online Payment'>('Card');
  const [depositAmountToPay, setDepositAmountToPay] = useState<number>(100);

  // Available Vehicles evaluated strictly with checkVehicleAvailability
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (filterCategory !== 'all' && v.categoryId !== filterCategory) return false;
      const res = checkVehicleAvailability(v.id, pickupDate, returnDate);
      return res.available;
    });
  }, [vehicles, filterCategory, pickupDate, returnDate, checkVehicleAvailability]);

  // Selected Vehicle Object
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Live Quote calculation using Rentora pricing engine
  const quote = useMemo(() => {
    if (!selectedVehicleId) return null;
    return calculateRentalQuote(selectedVehicleId, pickupDate, returnDate, selectedExtraIds, appliedPromo);
  }, [selectedVehicleId, pickupDate, returnDate, selectedExtraIds, appliedPromo, calculateRentalQuote]);

  // Handle Promo Code Apply
  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) return;

    const code = promoCodeInput.trim().toUpperCase();
    const match = promoCodes.find(p => p.code === code && p.status === 'Active');

    if (!match) {
      setPromoError('Invalid or expired coupon code.');
      return;
    }

    setAppliedPromo(code);
  };

  // Toggle Extra Service
  const handleToggleExtra = (extraId: string) => {
    if (selectedExtraIds.includes(extraId)) {
      setSelectedExtraIds(selectedExtraIds.filter(id => id !== extraId));
    } else {
      setSelectedExtraIds([...selectedExtraIds, extraId]);
    }
  };

  // Handle Final Submission
  const handleFinishBooking = () => {
    if (!selectedVehicle || !selectedCustomer || !quote) return;

    const durationDays = quote.days;

    const bookingExtras = selectedExtraIds.map(extraId => {
      const def = extraServices.find(s => s.id === extraId);
      const isPerDay = def?.isPerDay ?? false;
      const price = def?.price || 0;
      const total = isPerDay ? price * durationDays : price;
      return {
        serviceId: extraId,
        name: def?.name || 'Extra Service',
        price,
        isPerDay,
        total
      };
    });

    const paidAmt = Math.min(depositAmountToPay, quote.totalAmount);
    const balanceDue = Math.max(0, quote.totalAmount - paidAmt);
    
    let paymentStatus: PaymentStatus = 'Pending';
    if (paidAmt >= quote.totalAmount && quote.totalAmount > 0) {
      paymentStatus = 'Paid';
    } else if (paidAmt > 0) {
      paymentStatus = 'Partially Paid';
    }

    const bookingPayload: Omit<Booking, 'id' | 'bookingRef' | 'createdAt'> = {
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      pickupBranchId,
      returnBranchId,
      durationDays,
      dailyRate: quote.dailyRate,
      baseRentalTotal: quote.baseRentalTotal,
      extraServices: bookingExtras,
      discountCode: appliedPromo,
      discountAmount: quote.discountAmount,
      taxRate: 15,
      taxAmount: quote.taxAmount,
      subtotal: quote.subtotal,
      securityDeposit: quote.securityDeposit,
      totalAmount: quote.totalAmount,
      paidAmount: paidAmt,
      balanceDue,
      status: paidAmt > 0 ? 'Confirmed' : 'Pending',
      paymentStatus,
      notes: 'Created via Reservation Wizard'
    };

    createBooking(bookingPayload);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Wizard Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-display">
                New Reservation Wizard
              </h2>
              <p className="text-xs text-slate-400">
                Step {currentStep} of 6 — Complete reservation lifecycle
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

        {/* Step Progress Bar */}
        <div className="grid grid-cols-6 border-b border-slate-200 text-[11px] font-bold text-center bg-slate-50">
          {[
            { step: 1, label: '1. Dates & Station' },
            { step: 2, label: '2. Vehicle Selection' },
            { step: 3, label: '3. Customer' },
            { step: 4, label: '4. Add-on Extras' },
            { step: 5, label: '5. Price Breakdown' },
            { step: 6, label: '6. Payment & Confirm' }
          ].map(item => (
            <div
              key={item.step}
              className={`py-2.5 px-1 border-b-2 transition-all ${
                currentStep === item.step
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : currentStep > item.step
                  ? 'border-emerald-500 text-emerald-700 bg-slate-50/50'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* STEP 1: DATES & LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Rental Schedule & Pickup Station</h3>
                <p className="text-slate-500 text-xs">Specify reservation window to check fleet availability and branch logistics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                    <Calendar className="w-4 h-4 text-blue-600" /> Pickup Details
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Pickup Branch Location</label>
                    <select
                      value={pickupBranchId}
                      onChange={e => setPickupBranchId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Return Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                    <Clock className="w-4 h-4 text-blue-600" /> Return Details
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Return Date</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Return Time</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={e => setReturnTime(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Return Branch Location</label>
                    <select
                      value={returnBranchId}
                      onChange={e => setReturnBranchId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary of Days */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900 font-bold">
                <span>Calculated Rental Duration:</span>
                <span className="text-sm">{quote?.days || 4} Days</span>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">Select an Available Vehicle</h3>
                  <p className="text-slate-500 text-xs">Filtered by schedule collision prevention and maintenance logs.</p>
                </div>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 text-xs"
                >
                  <option value="all">All Vehicle Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {availableVehicles.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-slate-400">
                    No available vehicles found for the selected dates.
                  </div>
                ) : (
                  availableVehicles.map(veh => {
                    const isSelected = selectedVehicleId === veh.id;
                    const cat = categories.find(c => c.id === veh.categoryId);

                    return (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedVehicleId(veh.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs scale-[1.01]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={veh.mainImage}
                          alt=""
                          className="w-20 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                            {cat?.name}
                          </span>
                          <h4 className="font-extrabold text-slate-900 truncate text-sm">
                            {veh.make} {veh.model}
                          </h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{veh.regNumber}</span>
                            <span>•</span>
                            <span>{veh.fuelType}</span>
                            <span>•</span>
                            <span>{veh.transmission}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-slate-900 text-sm">
                            {formatCurrency(veh.dailyRate)}
                          </div>
                          <span className="text-[10px] text-slate-400 block">/ day</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOMER SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">Assign Renter / Customer Profile</h3>
                  <p className="text-slate-500 text-xs">Verify driving license, contact records, and identity documents.</p>
                </div>

                <input
                  type="text"
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs w-full sm:w-64"
                />
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {customers
                  .filter(c => {
                    if (!customerSearch.trim()) return true;
                    const q = customerSearch.toLowerCase();
                    return (
                      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      c.phone.toLowerCase().includes(q)
                    );
                  })
                  .map(cust => {
                    const isSelected = selectedCustomerId === cust.id;

                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={cust.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{cust.firstName} {cust.lastName}</div>
                            <div className="text-[11px] text-slate-500">{cust.email} • {cust.phone}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">License: {cust.drivingLicenseNumber}</div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 4: ADD-ON EXTRAS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Optional Add-ons & Equipment</h3>
                <p className="text-slate-500 text-xs">Select accessories, insurance upgrades, and driver assistance options.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extraServices.map(extra => {
                  const isSelected = selectedExtraIds.includes(extra.id);
                  return (
                    <div
                      key={extra.id}
                      onClick={() => handleToggleExtra(extra.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">{extra.name}</div>
                        <p className="text-[11px] text-slate-500">{extra.description}</p>
                        <div className="text-xs font-extrabold text-blue-600 pt-1">
                          {formatCurrency(extra.price)} <span className="text-[10px] text-slate-400 font-normal">/{extra.isPerDay ? 'day' : 'fixed'}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-1 shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: COST BREAKDOWN & PROMO */}
          {currentStep === 5 && quote && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Transparent Price Calculation</h3>
                <p className="text-slate-500 text-xs">Comprehensive fee computation using tiered dynamic pricing.</p>
              </div>

              {/* Promo Code Input */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Coupon / Promo Code (e.g. WELCOME10, SUMMER20)"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg uppercase font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                >
                  Apply Code
                </button>
              </div>

              {appliedPromo && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Promo Code "{appliedPromo}" successfully applied!
                </div>
              )}

              {promoError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {promoError}
                </div>
              )}

              {/* Summary Table */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rate Tier ({quote.days} days @ {formatCurrency(quote.dailyRate)}/day):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(quote.baseRentalTotal)}</span>
                </div>

                {quote.extrasTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Optional Add-on Extras:</span>
                    <span className="font-bold text-slate-800">+{formatCurrency(quote.extrasTotal)}</span>
                  </div>
                )}

                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Promotional Discount:</span>
                    <span>-{formatCurrency(quote.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>VAT / Government Tax (15%):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(quote.taxAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(quote.securityDeposit)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 text-lg">{formatCurrency(quote.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRM & DEPOSIT */}
          {currentStep === 6 && quote && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Finalize Reservation & Payment</h3>
                <p className="text-slate-500 text-xs">Choose deposit payment method to secure the vehicle.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">Payment Channel</span>
                  {(['Card', 'Cash', 'Bank Transfer', 'Online Payment'] as const).map(method => (
                    <label key={method} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">{method}</span>
                    </label>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">Initial Advance Collection ($)</span>
                  <div>
                    <label className="block text-slate-600 mb-1">Amount to collect now:</label>
                    <input
                      type="number"
                      min="0"
                      max={quote.totalAmount}
                      value={depositAmountToPay}
                      onChange={e => setDepositAmountToPay(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Remaining balance of <strong>{formatCurrency(Math.max(0, quote.totalAmount - depositAmountToPay))}</strong> will be collected at handover.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              disabled={currentStep === 2 && !selectedVehicleId}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishBooking}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Generate Reservation</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
