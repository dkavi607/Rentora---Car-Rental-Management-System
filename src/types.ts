export type UserRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Rental Manager'
  | 'Staff'
  | 'Accountant'
  | 'Maintenance Manager'
  | 'Customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branchId?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  operatingHours: string;
  status: 'Active' | 'Inactive';
}

export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  defaultDailyRate: number;
  defaultWeeklyRate: number;
  defaultMonthlyRate: number;
  passengerCapacity: number;
  luggageCapacity: number;
  status: 'Active' | 'Inactive';
}

export type VehicleStatus = 
  | 'Available'
  | 'Reserved'
  | 'Rented'
  | 'Maintenance'
  | 'Unavailable'
  | 'Inactive';

export interface VehicleDocument {
  id: string;
  name: string;
  type: 'Registration' | 'Insurance' | 'Revenue License' | 'Inspection Certificate' | 'Other';
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface Vehicle {
  id: string;
  vehicleId: string; // e.g. "CAR-101"
  regNumber: string; // e.g. "WP CAB-8821"
  make: string;
  model: string;
  year: number;
  categoryId: string;
  color: string;
  vin: string;
  engineNumber: string;
  branchId: string;
  status: VehicleStatus;
  
  // Specifications
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  doors: number;
  mileage: number; // Current odometer in km
  engineCapacity: string;
  features: {
    airConditioning: boolean;
    gps: boolean;
    bluetooth: boolean;
    usb: boolean;
    childSeat: boolean;
    backupCamera: boolean;
    cruiseControl: boolean;
    sunroof: boolean;
  };
  
  // Pricing
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  securityDeposit: number;
  extraKmRate: number;
  extraHourRate: number;
  lateReturnRate: number;
  
  // Images
  mainImage: string;
  images: string[];
  
  // Documents
  documents: VehicleDocument[];
  
  // Maintenance & Service
  purchaseDate: string;
  maintenanceIntervalKm: number;
  lastServiceMileage: number;
  nextServiceDate: string;
  notes?: string;
}

export interface CustomerDocument {
  id: string;
  type: 'Driving License' | 'Passport' | 'National ID' | 'Utility Bill' | 'Other';
  documentNumber: string;
  issueCountry: string;
  expiryDate: string;
  fileUrl?: string;
  verified: boolean;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. "CUST-0042"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: string;
  city: string;
  country: string;
  dob: string;
  gender?: 'Male' | 'Female' | 'Other';
  profileImage?: string;
  
  // Driving License info
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  licenseCountry: string;
  licenseImage?: string;
  passportOrIdNumber: string;
  idImage?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  
  // Customer classification
  customerType: 'Individual' | 'Corporate';
  companyName?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  createdAt: string;
  
  // Aggregate metadata for quick display
  totalBookings?: number;
  totalSpent?: number;
}

export type BookingStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Awaiting Payment'
  | 'Ready for Pickup'
  | 'Active'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type PaymentStatus = 
  | 'Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Refunded'
  | 'Failed';

export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number; // daily rate or fixed
  isPerDay: boolean;
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. "BK-2026-891"
  customerId: string;
  vehicleId: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  returnDate: string; // YYYY-MM-DD
  returnTime: string; // HH:mm
  pickupBranchId: string;
  returnBranchId: string;
  durationDays: number;
  
  // Pricing breakdown
  dailyRate: number;
  baseRentalTotal: number;
  extraServices: {
    serviceId: string;
    name: string;
    price: number;
    isPerDay: boolean;
    total: number;
  }[];
  discountCode?: string;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  securityDeposit: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  rentalId?: string;
}

export interface DamagePoint {
  id: string;
  view: 'top' | 'front' | 'rear' | 'left' | 'right';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  type: 'scratch' | 'dent' | 'crack' | 'chip' | 'stain' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  estimatedCost: number;
  status: 'Existing' | 'New' | 'Under Review' | 'Customer Responsible' | 'Company Responsible' | 'Resolved';
  photoUrl?: string;
}

export interface PickupInspection {
  mileage: number;
  fuelLevel: number; // percentage 0 - 100 (e.g. 100% full tank)
  exteriorCondition: 'Clean' | 'Minor Dust' | 'Dirty';
  interiorCondition: 'Clean' | 'Moderate' | 'Needs Cleaning';
  tireCondition: 'Good' | 'Fair' | 'Poor';
  lightsCondition: 'Working' | 'Faulty';
  glassCondition: 'Intact' | 'Chipped' | 'Cracked';
  existingDamages: DamagePoint[];
  photos: string[];
  notes?: string;
  inspectorName: string;
  signedByCustomer: boolean;
  customerSignature?: string; // data url or name
  inspectionDate: string;
}

export interface ReturnInspection {
  actualReturnDate: string;
  actualReturnTime: string;
  returnMileage: number;
  fuelLevel: number; // 0 - 100
  exteriorCondition: 'Clean' | 'Minor Dust' | 'Dirty';
  interiorCondition: 'Clean' | 'Moderate' | 'Needs Cleaning';
  tireCondition: 'Good' | 'Fair' | 'Poor';
  lightsCondition: 'Working' | 'Faulty';
  glassCondition: 'Intact' | 'Chipped' | 'Cracked';
  newDamages: DamagePoint[];
  photos: string[];
  
  // Extra calculations
  extraKmDriven: number;
  extraKmCharge: number;
  fuelDifferenceCharge: number;
  lateHours: number;
  lateFee: number;
  damageCharges: number;
  cleaningFee: number;
  totalAdditionalCharges: number;
  
  // Deposit settlement
  depositAmount: number;
  retainedFromDeposit: number;
  refundedDeposit: number;
  additionalDueAfterDeposit: number;
  
  notes?: string;
  inspectorName: string;
  signedByCustomer: boolean;
  customerSignature?: string;
  inspectionDate: string;
}

export interface Rental {
  id: string;
  rentalAgreementNumber: string; // e.g. "RA-2026-0042"
  bookingId: string;
  vehicleId: string;
  customerId: string;
  pickupBranchId: string;
  returnBranchId: string;
  scheduledPickupDate: string;
  scheduledReturnDate: string;
  actualPickupDate: string;
  actualReturnDate?: string;
  status: 'Active' | 'Completed' | 'Overdue';
  
  pickupInspection: PickupInspection;
  returnInspection?: ReturnInspection;
  
  depositCollected: number;
  depositStatus: 'Held' | 'Partially Retained' | 'Fully Retained' | 'Refunded';
  finalTotalAmount?: number;
  settled: boolean;
  createdAt: string;
}

export type PaymentType = 
  | 'Booking Advance'
  | 'Security Deposit'
  | 'Rental Payment'
  | 'Final Settlement'
  | 'Extra Charges'
  | 'Damage Charge'
  | 'Refund'
  | 'Cancellation Fee';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment' | 'Deposit Deduction';

export interface Payment {
  id: string;
  paymentRef: string; // e.g. "PAY-2026-904"
  bookingId?: string;
  rentalId?: string;
  customerId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string;
  notes?: string;
  recordedBy: string;
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-008"
  bookingId: string;
  rentalId?: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  depositAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Void';
  termsAndConditions?: string;
}

export type MaintenanceType = 
  | 'Routine Service'
  | 'Oil Change'
  | 'Tire Replacement'
  | 'Brake Service'
  | 'Engine Repair'
  | 'Accident Repair'
  | 'Cleaning'
  | 'Inspection'
  | 'Other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceType: MaintenanceType;
  description: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  cost: number;
  mileageAtService: number;
  serviceProvider: string;
  invoiceNumber?: string;
  notes?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  documentUrl?: string;
}

export type ExpenseCategory = 
  | 'Maintenance'
  | 'Fuel'
  | 'Insurance'
  | 'Vehicle Registration'
  | 'Staff'
  | 'Office'
  | 'Marketing'
  | 'Cleaning'
  | 'Repairs'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vehicleId?: string;
  branchId?: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  notes?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  categoryId?: string;
  vehicleId?: string;
  pricingType: 'Standard' | 'Weekend' | 'Seasonal' | 'Long Term';
  baseDailyRate: number;
  weeklyDiscountPercent: number; // e.g. 10%
  monthlyDiscountPercent: number; // e.g. 20%
  includedKmPerDay: number; // e.g. 100 km/day
  extraKmRate: number; // e.g. $0.35/km or LKR 90/km
  extraHourRate: number;
  lateReturnFeePerHour: number;
  securityDeposit: number;
  seasonalMultiplier: number; // e.g. 1.25x in peak season
  weekendMultiplier: number; // e.g. 1.15x on Sat/Sun
  status: 'Active' | 'Inactive';
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // 15 for 15% or 50 for $50
  minDays: number;
  validUntil: string;
  maxDiscount?: number;
  usageCount: number;
  status: 'Active' | 'Expired';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface SystemSettings {
  business: {
    companyName: string;
    tagline: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    registrationNumber: string;
    taxNumber: string;
  };
  rentalRules: {
    defaultCurrency: string;
    currencySymbol: string;
    defaultRentalDays: number;
    minRentalAge: number;
    requiredDocs: string[];
    fuelPolicy: 'Full to Full' | 'Same to Same' | 'Pre-purchase';
    mileagePolicy: 'Unlimited' | 'Limited (100km/day)' | 'Limited (150km/day)';
    lateReturnGraceHours: number;
    lateReturnFeePerHour: number;
    fuelPenaltyPerQuarter: number;
    cancellationPolicy: string;
    defaultDepositAmount: number;
  };
  tax: {
    taxRate: number; // percentage, e.g., 8
    taxName: string;
    invoicePrefix: string;
    currencyFormat: 'USD' | 'LKR' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'AED' | 'INR';
  };
  system: {
    dateFormat: string;
    timeFormat: string;
    timeZone: string;
    theme: 'light' | 'dark' | 'system';
  };
}
