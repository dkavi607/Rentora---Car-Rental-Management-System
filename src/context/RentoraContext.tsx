import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Branch, 
  VehicleCategory, 
  Vehicle, 
  Customer, 
  Booking, 
  Rental, 
  Payment, 
  Invoice, 
  MaintenanceRecord, 
  Expense, 
  PricingPlan, 
  PromoCode, 
  AppNotification, 
  SystemSettings, 
  User, 
  UserRole,
  PickupInspection,
  ReturnInspection,
  ExtraService
} from '../types';
import { 
  INITIAL_BRANCHES, 
  INITIAL_CATEGORIES, 
  INITIAL_VEHICLES, 
  INITIAL_CUSTOMERS, 
  INITIAL_EXTRA_SERVICES, 
  INITIAL_BOOKINGS, 
  INITIAL_RENTALS, 
  INITIAL_PAYMENTS, 
  INITIAL_INVOICES, 
  INITIAL_MAINTENANCE, 
  INITIAL_EXPENSES, 
  INITIAL_PRICING_PLANS, 
  INITIAL_PROMO_CODES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USERS, 
  DEFAULT_SETTINGS 
} from '../data/initialData';

interface PriceCalculationResult {
  days: number;
  dailyRate: number;
  baseRentalTotal: number;
  extrasTotal: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  securityDeposit: number;
  totalAmount: number;
  discountAppliedMessage?: string;
}

interface RentoraContextType {
  // Current session & active branch
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedBranchId: string; // 'all' or specific branchId
  setSelectedBranchId: (id: string) => void;
  
  // Data collections
  branches: Branch[];
  categories: VehicleCategory[];
  vehicles: Vehicle[];
  customers: Customer[];
  extraServices: ExtraService[];
  bookings: Booking[];
  rentals: Rental[];
  payments: Payment[];
  invoices: Invoice[];
  maintenanceRecords: MaintenanceRecord[];
  expenses: Expense[];
  pricingPlans: PricingPlan[];
  promoCodes: PromoCode[];
  notifications: AppNotification[];
  users: User[];
  settings: SystemSettings;
  
  // Helpers & Formatters
  formatCurrency: (amount: number) => string;
  
  // Core Business Operations
  checkVehicleAvailability: (
    vehicleId: string, 
    pickupDate: string, 
    returnDate: string, 
    excludeBookingId?: string
  ) => { available: boolean; reason?: string };
  
  calculateRentalQuote: (
    vehicleId: string,
    pickupDate: string,
    returnDate: string,
    selectedServiceIds: string[],
    promoCodeStr?: string
  ) => PriceCalculationResult;
  
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt'>) => { success: boolean; booking?: Booking; error?: string };
  updateBookingStatus: (bookingId: string, status: Booking['status'], notes?: string) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  
  startRentalHandover: (
    bookingId: string,
    pickupInspection: PickupInspection,
    depositCollected: number,
    paymentMethod: Payment['paymentMethod']
  ) => { success: boolean; rental?: Rental; error?: string };
  
  processRentalReturn: (
    rentalId: string,
    returnInspection: ReturnInspection,
    settlementPaymentMethod: Payment['paymentMethod']
  ) => { success: boolean; invoice?: Invoice; error?: string };
  
  // Entity CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'vehicleId'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addCategory: (cat: Omit<VehicleCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<VehicleCategory>) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'customerId' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentRef'>) => void;
  refundPayment: (paymentId: string, reason: string) => void;
  
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  completeMaintenanceRecord: (id: string, actualCost: number, notes?: string) => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  updateSettings: (newSettings: SystemSettings) => void;
  resetToDemoData: () => void;
}

const RentoraContext = createContext<RentoraContextType | undefined>(undefined);

const STORAGE_KEY = 'rentora_data_v1';

export const RentoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [categories, setCategories] = useState<VehicleCategory[]>(INITIAL_CATEGORIES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [extraServices, setExtraServices] = useState<ExtraService[]>(INITIAL_EXTRA_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [rentals, setRentals] = useState<Rental[]>(INITIAL_RENTALS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(INITIAL_PRICING_PLANS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.rentals) setRentals(parsed.rentals);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.maintenanceRecords) setMaintenanceRecords(parsed.maintenanceRecords);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.branches) setBranches(parsed.branches);
        if (parsed.promoCodes) setPromoCodes(parsed.promoCodes);
      }
    } catch (e) {
      console.warn('Could not load saved data from local storage:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        branches,
        categories,
        vehicles,
        customers,
        bookings,
        rentals,
        payments,
        invoices,
        maintenanceRecords,
        expenses,
        settings,
        promoCodes
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not persist data:', e);
    }
  }, [branches, categories, vehicles, customers, bookings, rentals, payments, invoices, maintenanceRecords, expenses, settings, promoCodes]);

  // Keep user role in sync when switching user
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    const symbol = settings.rentalRules.currencySymbol || '$';
    const formattedNum = Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (settings.tax.currencyFormat === 'LKR') {
      return `LKR ${formattedNum}`;
    }
    return `${symbol}${formattedNum}`;
  };

  // Availability Checker
  const checkVehicleAvailability = (
    vehicleId: string, 
    pickupDate: string, 
    returnDate: string, 
    excludeBookingId?: string
  ): { available: boolean; reason?: string } => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return { available: false, reason: 'Vehicle not found' };

    if (vehicle.status === 'Maintenance') {
      return { available: false, reason: 'Vehicle is currently scheduled in maintenance' };
    }
    if (vehicle.status === 'Inactive' || vehicle.status === 'Unavailable') {
      return { available: false, reason: 'Vehicle is currently inactive or decommissioned' };
    }

    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);

    if (pDate >= rDate) {
      return { available: false, reason: 'Return date must be strictly after pickup date' };
    }

    // Check overlapping maintenance records
    const conflictingMaint = maintenanceRecords.find(m => {
      if (m.vehicleId !== vehicleId || m.status === 'Completed' || m.status === 'Cancelled') return false;
      const mStart = new Date(m.startDate);
      const mEnd = new Date(m.expectedCompletionDate);
      return (pDate <= mEnd && rDate >= mStart);
    });

    if (conflictingMaint) {
      return { available: false, reason: `Vehicle has scheduled service from ${conflictingMaint.startDate} to ${conflictingMaint.expectedCompletionDate}` };
    }

    // Check overlapping bookings
    const activeBookingStatuses = ['Confirmed', 'Awaiting Payment', 'Ready for Pickup', 'Active'];
    const conflictingBooking = bookings.find(b => {
      if (b.id === excludeBookingId || b.vehicleId !== vehicleId) return false;
      if (!activeBookingStatuses.includes(b.status)) return false;

      const bPickup = new Date(b.pickupDate);
      const bReturn = new Date(b.returnDate);

      // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
      return (pDate <= bReturn && rDate >= bPickup);
    });

    if (conflictingBooking) {
      return { 
        available: false, 
        reason: `Reserved for Booking #${conflictingBooking.bookingRef} (${conflictingBooking.pickupDate} to ${conflictingBooking.returnDate})` 
      };
    }

    return { available: true };
  };

  // Pricing Engine
  const calculateRentalQuote = (
    vehicleId: string,
    pickupDate: string,
    returnDate: string,
    selectedServiceIds: string[],
    promoCodeStr?: string
  ): PriceCalculationResult => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const defaultRate = vehicle ? vehicle.dailyRate : 60;
    const securityDeposit = vehicle ? vehicle.securityDeposit : settings.rentalRules.defaultDepositAmount;

    const p = new Date(pickupDate);
    const r = new Date(returnDate);
    const diffTime = Math.abs(r.getTime() - p.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Tier pricing discounts
    let dailyRate = defaultRate;
    if (days >= 30) {
      dailyRate = Math.round(defaultRate * 0.80); // 20% off monthly
    } else if (days >= 7) {
      dailyRate = Math.round(defaultRate * 0.90); // 10% off weekly
    }

    const baseRentalTotal = dailyRate * days;

    // Calculate add-on services
    let extrasTotal = 0;
    extraServices.forEach(srv => {
      if (selectedServiceIds.includes(srv.id)) {
        extrasTotal += srv.isPerDay ? srv.price * days : srv.price;
      }
    });

    // Calculate Promo Code Discount
    let discountAmount = 0;
    let discountAppliedMessage = '';
    if (promoCodeStr) {
      const promo = promoCodes.find(p => p.code.toUpperCase() === promoCodeStr.trim().toUpperCase() && p.status === 'Active');
      if (promo) {
        if (days >= promo.minDays) {
          if (promo.discountType === 'percentage') {
            discountAmount = Math.round((baseRentalTotal * promo.value) / 100);
          } else {
            discountAmount = promo.value;
          }
          discountAppliedMessage = `Code '${promo.code}' applied: -${formatCurrency(discountAmount)}`;
        } else {
          discountAppliedMessage = `Code '${promo.code}' requires min. ${promo.minDays} days rental.`;
        }
      } else {
        discountAppliedMessage = 'Invalid or expired promo code';
      }
    }

    const subtotal = Math.max(0, baseRentalTotal + extrasTotal - discountAmount);
    const taxRate = settings.tax.taxRate;
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    return {
      days,
      dailyRate,
      baseRentalTotal,
      extrasTotal,
      discountAmount,
      subtotal,
      taxAmount,
      securityDeposit,
      totalAmount,
      discountAppliedMessage
    };
  };

  // Create Booking
  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt'>): { success: boolean; booking?: Booking; error?: string } => {
    // 1. Validate Customer
    const customer = customers.find(c => c.id === bookingData.customerId);
    if (!customer) return { success: false, error: 'Valid customer is required' };

    // 2. Validate Vehicle & Availability
    const check = checkVehicleAvailability(bookingData.vehicleId, bookingData.pickupDate, bookingData.returnDate);
    if (!check.available) {
      return { success: false, error: check.reason || 'Vehicle is not available for requested period' };
    }

    const newId = `book-${Date.now()}`;
    const bookingRef = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      bookingRef,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    // Update customer stats
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          totalBookings: (c.totalBookings || 0) + 1,
          totalSpent: (c.totalSpent || 0) + newBooking.paidAmount
        };
      }
      return c;
    }));

    // Update vehicle status if starting right now
    const todayStr = new Date().toISOString().split('T')[0];
    if (newBooking.pickupDate === todayStr) {
      setVehicles(prev => prev.map(v => v.id === newBooking.vehicleId ? { ...v, status: 'Reserved' } : v));
    }

    // Auto-generate invoice
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const invoiceItems = [
      {
        id: `item-${Date.now()}-1`,
        description: `Vehicle Rental (${newBooking.durationDays} Days @ ${formatCurrency(newBooking.dailyRate)}/day)`,
        quantity: newBooking.durationDays,
        unitPrice: newBooking.dailyRate,
        total: newBooking.baseRentalTotal
      },
      ...newBooking.extraServices.map((es, idx) => ({
        id: `item-${Date.now()}-extra-${idx}`,
        description: es.name,
        quantity: es.isPerDay ? newBooking.durationDays : 1,
        unitPrice: es.price,
        total: es.total
      }))
    ];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      bookingId: newId,
      customerId: newBooking.customerId,
      issueDate: todayStr,
      dueDate: newBooking.pickupDate,
      items: invoiceItems,
      subtotal: newBooking.subtotal,
      taxRate: newBooking.taxRate,
      taxAmount: newBooking.taxAmount,
      discountAmount: newBooking.discountAmount,
      depositAmount: newBooking.securityDeposit,
      paidAmount: newBooking.paidAmount,
      balanceDue: newBooking.balanceDue,
      status: newBooking.paidAmount >= newBooking.totalAmount ? 'Paid' : newBooking.paidAmount > 0 ? 'Partially Paid' : 'Unpaid'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // If advance was paid, record payment
    if (newBooking.paidAmount > 0) {
      const paymentRecord: Payment = {
        id: `pay-${Date.now()}`,
        paymentRef: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: newId,
        customerId: newBooking.customerId,
        amount: newBooking.paidAmount,
        paymentType: 'Booking Advance',
        paymentMethod: 'Card',
        paymentDate: `${todayStr} 12:00`,
        referenceNumber: `ADV-TXN-${Date.now().toString().slice(-6)}`,
        notes: `Initial advance collected upon booking #${bookingRef}`,
        recordedBy: currentUser.name,
        status: 'Paid'
      };
      setPayments(prev => [paymentRecord, ...prev]);
    }

    // Add notification
    addNotification({
      title: 'New Booking Created',
      message: `Booking #${bookingRef} created for ${customer.firstName} ${customer.lastName} (${newBooking.durationDays} days).`,
      type: 'success',
      linkTab: 'bookings'
    });

    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], notes?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          notes: notes ? `${b.notes ? b.notes + ' | ' : ''}${notes}` : b.notes
        };
      }
      return b;
    }));

    // If cancelled, free up vehicle
    if (status === 'Cancelled') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setVehicles(prev => prev.map(v => v.id === booking.vehicleId && v.status === 'Reserved' ? { ...v, status: 'Available' } : v));
      }
    }
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    updateBookingStatus(bookingId, 'Cancelled', reason ? `Cancellation reason: ${reason}` : 'Cancelled by staff');
    addNotification({
      title: 'Booking Cancelled',
      message: `Booking #${bookingId} was cancelled. Vehicle dates released.`,
      type: 'warning',
      linkTab: 'bookings'
    });
  };

  // Start Rental Handover
  const startRentalHandover = (
    bookingId: string,
    pickupInspection: PickupInspection,
    depositCollected: number,
    paymentMethod: Payment['paymentMethod']
  ): { success: boolean; rental?: Rental; error?: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    const rentalId = `rent-${Date.now()}`;
    const raNumber = `RA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRental: Rental = {
      id: rentalId,
      rentalAgreementNumber: raNumber,
      bookingId,
      vehicleId: booking.vehicleId,
      customerId: booking.customerId,
      pickupBranchId: booking.pickupBranchId,
      returnBranchId: booking.returnBranchId,
      scheduledPickupDate: booking.pickupDate,
      scheduledReturnDate: booking.returnDate,
      actualPickupDate: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Active',
      pickupInspection,
      depositCollected,
      depositStatus: 'Held',
      settled: false,
      createdAt: new Date().toISOString()
    };

    setRentals(prev => [newRental, ...prev]);

    // Update vehicle status & mileage
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicle.id) {
        return {
          ...v,
          status: 'Rented',
          mileage: Math.max(v.mileage, pickupInspection.mileage)
        };
      }
      return v;
    }));

    // Update booking status
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Active',
          rentalId
        };
      }
      return b;
    }));

    // Record Security Deposit Payment
    if (depositCollected > 0) {
      const depositPayment: Payment = {
        id: `pay-dep-${Date.now()}`,
        paymentRef: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId,
        rentalId,
        customerId: booking.customerId,
        amount: depositCollected,
        paymentType: 'Security Deposit',
        paymentMethod,
        paymentDate: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        referenceNumber: `DEP-AUTH-${Date.now().toString().slice(-6)}`,
        notes: `Security deposit held under Agreement #${raNumber}`,
        recordedBy: currentUser.name,
        status: 'Paid'
      };
      setPayments(prev => [depositPayment, ...prev]);
    }

    addNotification({
      title: 'Vehicle Handed Over',
      message: `Agreement #${raNumber} signed. ${vehicle.make} ${vehicle.model} (${vehicle.regNumber}) is now Active.`,
      type: 'success',
      linkTab: 'rentals'
    });

    return { success: true, rental: newRental };
  };

  // Process Rental Return
  const processRentalReturn = (
    rentalId: string,
    returnInspection: ReturnInspection,
    settlementPaymentMethod: Payment['paymentMethod']
  ): { success: boolean; invoice?: Invoice; error?: string } => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return { success: false, error: 'Rental record not found' };

    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
    const booking = bookings.find(b => b.id === rental.bookingId);
    if (!vehicle || !booking) return { success: false, error: 'Vehicle or booking details missing' };

    const todayStr = new Date().toISOString().split('T')[0];

    // Determine if vehicle needs maintenance due to damages
    const hasSevereDamage = returnInspection.newDamages.some(d => d.severity === 'severe' || d.severity === 'moderate');
    const newVehicleStatus = hasSevereDamage ? 'Maintenance' : 'Available';

    // Update rental record
    const updatedRental: Rental = {
      ...rental,
      actualReturnDate: `${returnInspection.actualReturnDate} ${returnInspection.actualReturnTime}`,
      status: 'Completed',
      returnInspection,
      depositStatus: returnInspection.retainedFromDeposit > 0 ? (returnInspection.refundedDeposit > 0 ? 'Partially Retained' : 'Fully Retained') : 'Refunded',
      finalTotalAmount: booking.totalAmount + returnInspection.totalAdditionalCharges,
      settled: true
    };

    setRentals(prev => prev.map(r => r.id === rentalId ? updatedRental : r));

    // Update vehicle status and odometer
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicle.id) {
        return {
          ...v,
          status: newVehicleStatus,
          mileage: Math.max(v.mileage, returnInspection.returnMileage)
        };
      }
      return v;
    }));

    // Update booking status
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Completed' } : b));

    // Create Final Settlement Invoice
    const finalInvNumber = `INV-${new Date().getFullYear()}-RET-${Math.floor(100 + Math.random() * 900)}`;
    const finalItems = [
      {
        id: `item-base-${Date.now()}`,
        description: `Base Rental: ${vehicle.make} ${vehicle.model} (${booking.durationDays} Days)`,
        quantity: booking.durationDays,
        unitPrice: booking.dailyRate,
        total: booking.baseRentalTotal
      },
      ...booking.extraServices.map((es, idx) => ({
        id: `item-extra-${Date.now()}-${idx}`,
        description: es.name,
        quantity: es.isPerDay ? booking.durationDays : 1,
        unitPrice: es.price,
        total: es.total
      }))
    ];

    if (returnInspection.extraKmCharge > 0) {
      finalItems.push({
        id: `item-km-${Date.now()}`,
        description: `Excess Mileage Charge (${returnInspection.extraKmDriven} km)`,
        quantity: returnInspection.extraKmDriven,
        unitPrice: vehicle.extraKmRate,
        total: returnInspection.extraKmCharge
      });
    }

    if (returnInspection.fuelDifferenceCharge > 0) {
      finalItems.push({
        id: `item-fuel-${Date.now()}`,
        description: 'Fuel Deficit & Refueling Service Fee',
        quantity: 1,
        unitPrice: returnInspection.fuelDifferenceCharge,
        total: returnInspection.fuelDifferenceCharge
      });
    }

    if (returnInspection.lateFee > 0) {
      finalItems.push({
        id: `item-late-${Date.now()}`,
        description: `Late Return Penalty (${returnInspection.lateHours} hours)`,
        quantity: returnInspection.lateHours,
        unitPrice: vehicle.lateReturnRate || settings.rentalRules.lateReturnFeePerHour,
        total: returnInspection.lateFee
      });
    }

    if (returnInspection.damageCharges > 0) {
      finalItems.push({
        id: `item-dmg-${Date.now()}`,
        description: 'Vehicle Damage Repair Assessment',
        quantity: 1,
        unitPrice: returnInspection.damageCharges,
        total: returnInspection.damageCharges
      });
    }

    if (returnInspection.cleaningFee > 0) {
      finalItems.push({
        id: `item-clean-${Date.now()}`,
        description: 'Special Interior Sanitization / Deep Cleaning Fee',
        quantity: 1,
        unitPrice: returnInspection.cleaningFee,
        total: returnInspection.cleaningFee
      });
    }

    const finalSubtotal = booking.subtotal + returnInspection.totalAdditionalCharges;
    const finalTax = Number(((finalSubtotal * booking.taxRate) / 100).toFixed(2));
    const grandTotal = Number((finalSubtotal + finalTax).toFixed(2));

    const finalInvoice: Invoice = {
      id: `inv-final-${Date.now()}`,
      invoiceNumber: finalInvNumber,
      bookingId: booking.id,
      rentalId,
      customerId: booking.customerId,
      issueDate: todayStr,
      dueDate: todayStr,
      items: finalItems,
      subtotal: finalSubtotal,
      taxRate: booking.taxRate,
      taxAmount: finalTax,
      discountAmount: booking.discountAmount,
      depositAmount: rental.depositCollected,
      paidAmount: grandTotal,
      balanceDue: 0,
      status: 'Paid',
      termsAndConditions: 'Rental finalized and vehicle checked in. Deposit settlements applied.'
    };

    setInvoices(prev => [finalInvoice, ...prev]);

    // Record Deposit Settlement Payments
    if (returnInspection.refundedDeposit > 0) {
      const refundPay: Payment = {
        id: `pay-ref-${Date.now()}`,
        paymentRef: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        rentalId,
        bookingId: booking.id,
        customerId: booking.customerId,
        amount: returnInspection.refundedDeposit,
        paymentType: 'Refund',
        paymentMethod: settlementPaymentMethod,
        paymentDate: `${todayStr} ${returnInspection.actualReturnTime}`,
        referenceNumber: `REF-DEP-${Date.now().toString().slice(-6)}`,
        notes: `Deposit refund processed for Rental Agreement #${rental.rentalAgreementNumber}`,
        recordedBy: currentUser.name,
        status: 'Paid'
      };
      setPayments(prev => [refundPay, ...prev]);
    }

    if (returnInspection.additionalDueAfterDeposit > 0) {
      const additionalPay: Payment = {
        id: `pay-settle-${Date.now()}`,
        paymentRef: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        rentalId,
        bookingId: booking.id,
        customerId: booking.customerId,
        amount: returnInspection.additionalDueAfterDeposit,
        paymentType: 'Final Settlement',
        paymentMethod: settlementPaymentMethod,
        paymentDate: `${todayStr} ${returnInspection.actualReturnTime}`,
        referenceNumber: `SETTLE-TXN-${Date.now().toString().slice(-6)}`,
        notes: `Additional charges payment upon return check-in`,
        recordedBy: currentUser.name,
        status: 'Paid'
      };
      setPayments(prev => [additionalPay, ...prev]);
    }

    addNotification({
      title: 'Vehicle Returned & Settled',
      message: `Rental Agreement #${rental.rentalAgreementNumber} completed. ${vehicle.make} ${vehicle.model} returned.`,
      type: 'success',
      linkTab: 'rentals'
    });

    return { success: true, invoice: finalInvoice };
  };

  // Vehicle CRUD
  const addVehicle = (vehData: Omit<Vehicle, 'id' | 'vehicleId'>) => {
    const newId = `veh-${Date.now()}`;
    const nextVehId = `CAR-${Math.floor(100 + vehicles.length + 1)}`;
    const newVehicle: Vehicle = {
      ...vehData,
      id: newId,
      vehicleId: nextVehId
    };
    setVehicles(prev => [newVehicle, ...prev]);
    addNotification({
      title: 'Vehicle Added',
      message: `${newVehicle.make} ${newVehicle.model} (${newVehicle.regNumber}) added to fleet.`,
      type: 'info',
      linkTab: 'cars'
    });
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Category CRUD
  const addCategory = (catData: Omit<VehicleCategory, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    setCategories(prev => [...prev, { ...catData, id: newId }]);
  };

  const updateCategory = (id: string, updated: Partial<VehicleCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  // Customer CRUD
  const addCustomer = (custData: Omit<Customer, 'id' | 'customerId' | 'createdAt'>): Customer => {
    const newId = `cust-${Date.now()}`;
    const nextCustId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...custData,
      id: newId,
      customerId: nextCustId,
      createdAt: new Date().toISOString().split('T')[0],
      totalBookings: 0,
      totalSpent: 0
    };
    setCustomers(prev => [newCustomer, ...prev]);
    addNotification({
      title: 'Customer Registered',
      message: `${newCustomer.firstName} ${newCustomer.lastName} registered successfully.`,
      type: 'info',
      linkTab: 'customers'
    });
    return newCustomer;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  // Payments
  const recordPayment = (payData: Omit<Payment, 'id' | 'paymentRef'>) => {
    const newId = `pay-${Date.now()}`;
    const ref = `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      ...payData,
      id: newId,
      paymentRef: ref
    };
    setPayments(prev => [newPayment, ...prev]);

    // Update corresponding booking / invoice paid balance
    if (payData.bookingId) {
      setBookings(prev => prev.map(b => {
        if (b.id === payData.bookingId) {
          const newPaid = b.paidAmount + payData.amount;
          const newBal = Math.max(0, b.totalAmount - newPaid);
          return {
            ...b,
            paidAmount: newPaid,
            balanceDue: newBal,
            paymentStatus: newBal <= 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending'
          };
        }
        return b;
      }));
    }
  };

  const refundPayment = (paymentId: string, reason: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'Refunded',
          notes: `${p.notes || ''} | Refunded: ${reason}`
        };
      }
      return p;
    }));
  };

  // Maintenance
  const addMaintenanceRecord = (maintData: Omit<MaintenanceRecord, 'id'>) => {
    const newId = `maint-${Date.now()}`;
    const newMaint: MaintenanceRecord = {
      ...maintData,
      id: newId
    };
    setMaintenanceRecords(prev => [newMaint, ...prev]);

    // Block vehicle status if scheduled or in progress
    if (maintData.status === 'In Progress' || maintData.status === 'Scheduled') {
      setVehicles(prev => prev.map(v => v.id === maintData.vehicleId ? { ...v, status: 'Maintenance' } : v));
    }

    addNotification({
      title: 'Maintenance Logged',
      message: `Vehicle placed in ${maintData.maintenanceType}.`,
      type: 'warning',
      linkTab: 'maintenance'
    });
  };

  const completeMaintenanceRecord = (id: string, actualCost: number, notes?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const maint = maintenanceRecords.find(m => m.id === id);
    if (!maint) return;

    setMaintenanceRecords(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          actualCompletionDate: todayStr,
          cost: actualCost,
          status: 'Completed',
          notes: notes || m.notes
        };
      }
      return m;
    }));

    // Free vehicle back to available
    setVehicles(prev => prev.map(v => v.id === maint.vehicleId ? { ...v, status: 'Available', nextServiceDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] } : v));

    // Also record expense
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: 'Maintenance',
      description: `${maint.maintenanceType} - ${maint.description}`,
      amount: actualCost,
      date: todayStr,
      vehicleId: maint.vehicleId,
      paymentMethod: 'Bank Transfer',
      notes: `Service Invoice #${maint.invoiceNumber || 'N/A'}`
    };
    setExpenses(prev => [newExp, ...prev]);

    addNotification({
      title: 'Maintenance Completed',
      message: `Vehicle serviced and released back to available fleet.`,
      type: 'success',
      linkTab: 'maintenance'
    });
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    setExpenses(prev => [{ ...expData, id: newId }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Notifications
  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Settings
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setBranches(INITIAL_BRANCHES);
    setCategories(INITIAL_CATEGORIES);
    setVehicles(INITIAL_VEHICLES);
    setCustomers(INITIAL_CUSTOMERS);
    setExtraServices(INITIAL_EXTRA_SERVICES);
    setBookings(INITIAL_BOOKINGS);
    setRentals(INITIAL_RENTALS);
    setPayments(INITIAL_PAYMENTS);
    setInvoices(INITIAL_INVOICES);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setExpenses(INITIAL_EXPENSES);
    setPricingPlans(INITIAL_PRICING_PLANS);
    setPromoCodes(INITIAL_PROMO_CODES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    addNotification({
      title: 'Database Reset',
      message: 'Rentora demo dataset restored successfully.',
      type: 'info'
    });
  };

  return (
    <RentoraContext.Provider value={{
      currentUser,
      setCurrentUser,
      currentRole,
      setCurrentRole,
      selectedBranchId,
      setSelectedBranchId,
      branches,
      categories,
      vehicles,
      customers,
      extraServices,
      bookings,
      rentals,
      payments,
      invoices,
      maintenanceRecords,
      expenses,
      pricingPlans,
      promoCodes,
      notifications,
      users,
      settings,
      formatCurrency,
      checkVehicleAvailability,
      calculateRentalQuote,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      startRentalHandover,
      processRentalReturn,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addCategory,
      updateCategory,
      addCustomer,
      updateCustomer,
      recordPayment,
      refundPayment,
      addMaintenanceRecord,
      completeMaintenanceRecord,
      addExpense,
      deleteExpense,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      updateSettings,
      resetToDemoData
    }}>
      {children}
    </RentoraContext.Provider>
  );
};

export const useRentora = (): RentoraContextType => {
  const context = useContext(RentoraContext);
  if (!context) {
    throw new Error('useRentora must be used within a RentoraProvider');
  }
  return context;
};
