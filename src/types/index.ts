/**
 * Calculus Data - Type Definitions
 * Enterprise Factory & Hotel Management System
 */

export type Branch = 'factory' | 'hotel' | 'company';

export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: string;
  branch: 'factory' | 'hotel';
  name: string;
  countryCode: string; // e.g. "+20"
  countryFlag: string; // e.g. "🇪🇬"
  phone: string; // Phone number without country code
  nationalId?: string; // Optional
  jobTitle: string; // مهندس، عامل، محاسب، مدير، فني، إلخ
  monthlySalary: number; // الراتب الشهري الأساسي
  hireDate: string; // YYYY-MM-DD
  status: EmployeeStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branch: 'factory' | 'hotel';
  monthYear: string; // YYYY-MM
  baseSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  netSalary: number; // baseSalary + totalBonuses - totalDeductions
  status: 'pending' | 'paid';
  paymentDate?: string;
  notes?: string;
}

export interface DeductionLog {
  id: string;
  employeeId: string;
  employeeName: string;
  branch: 'factory' | 'hotel';
  type: 'deduction' | 'bonus';
  amount: number;
  reason: string;
  date: string; // YYYY-MM-DD
  authorizedBy: string; // اسم المسؤول
  baseSalary: number;
  totalDeductionsAtTime: number;
  netSalaryRemaining: number;
  createdAt: string;
}

export type InventoryCategory =
  | 'equipment'       // المعدات
  | 'machinery'       // الماكينات والمكن
  | 'raw_materials'   // الخامات
  | 'supplies'        // المستلزمات
  | 'accessories'     // الإكسسوارات
  | 'paints'          // الدهانات
  | 'finishes'        // التشطيبات
  | 'wip'             // المنتجات تحت التشغيل
  | 'finished_goods'  // المنتجات التامة
  | 'tools';          // الأدوات

export interface InventoryItem {
  id: string;
  category: InventoryCategory;
  name: string;
  code: string; // رقم أو كود الصنف
  quantity: number;
  unit: string; // قطعة، متر، كجم، لتر، طن، علبة، إلخ
  unitPrice: number;
  totalValue: number; // quantity * unitPrice
  dateAdded: string; // YYYY-MM-DD
  supplier: string; // المورد
  condition: string; // جديد، ممتاز، جيد، يحتاج صيانة
  minAlertQuantity: number; // حد التنبيه لانخفاض الكمية
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  authorizedBy: string;
  date: string;
  createdAt: string;
}

export type ApartmentStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';

export interface Apartment {
  id: string;
  apartmentNumber: string; // رقم الشقة (الحقل الأول)
  nameOrType: string; // اسم أو نوع الشقة
  dailyRentPrice: number; // سعر الإيجار اليومي
  maxGuests: number; // عدد الأشخاص المسموح لهم بالإقامة
  status: ApartmentStatus;
  photos: string[];
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApartmentItemCategory =
  | 'electrical' // الأجهزة الكهربائية
  | 'kitchen'    // أدوات المطبخ
  | 'furniture'  // الأثاث
  | 'bedding'    // المفروشات
  | 'decor'      // الديكورات
  | 'other';     // محتويات أخرى

export interface ApartmentItem {
  id: string;
  apartmentId: string;
  apartmentNumber: string;
  category: ApartmentItemCategory;
  name: string;
  quantity: number;
  price: number;
  condition: string; // ممتاز، جيد، يحتاج صيانة، تالف
  dateAdded: string;
  notes?: string;
  createdAt: string;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled' | 'extended';

export interface BookingExtension {
  id: string;
  addedDays: number;
  additionalAmount: number;
  oldEndDate: string;
  newEndDate: string;
  date: string;
  notes?: string;
}

export interface Booking {
  id: string;
  apartmentId: string;
  apartmentNumber: string;
  guestName: string;
  countryCode: string;
  countryFlag: string;
  phone: string;
  nationalId?: string;
  dailyRate: number;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalAmount: number;
  paidAmount: number; // العربون أو المبلغ المدفوع
  remainingAmount: number; // totalAmount - paidAmount
  guestCount: number;
  status: BookingStatus;
  notes?: string;
  extensions?: BookingExtension[];
  createdAt: string;
  updatedAt: string;
}

export type FinancialTransactionType =
  | 'capital_initial'     // رأس مال أساسي
  | 'capital_injection'   // زيادة رأس مال
  | 'capital_withdrawal'  // سحب من رأس المال
  | 'revenue'             // إيراد
  | 'expense';            // مصروف

export type FinancialCategory =
  | 'capital'
  | 'booking_revenue'
  | 'factory_sales'
  | 'salaries'
  | 'raw_materials_purchase'
  | 'maintenance'
  | 'utilities'
  | 'equipment_purchase'
  | 'operating_expense'
  | 'withdrawal'
  | 'other';

export interface FinancialTransaction {
  id: string;
  type: FinancialTransactionType;
  branch: Branch; // factory, hotel, company
  category: FinancialCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  reason: string;
  authorizedBy: string;
  notes?: string;
  referenceId?: string; // id of booking, salary, inventory item if applicable
  createdAt: string;
}

export type UserRole = 'admin' | 'accountant' | 'receptionist' | 'factory_manager' | 'hotel_manager';

export interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  pin?: string;
  allowedSections: string[];
  createdAt: string;
}

export interface SystemSettings {
  id: 'system_settings';
  companyName: string;
  baseCapital: number;
  currency: string;
  bookingAlertDaysBefore: number; // Default 1 or 2
  lowStockAlertDefaultThreshold: number; // Default 5
  activeUserId: string;
  lastBackupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullBackupData {
  version: number;
  companyName: string;
  exportDate: string;
  settings: SystemSettings;
  users: SystemUser[];
  employees: Employee[];
  deductionLogs: DeductionLog[];
  inventoryItems: InventoryItem[];
  inventoryLogs: InventoryLog[];
  apartments: Apartment[];
  apartmentItems: ApartmentItem[];
  bookings: Booking[];
  financialTransactions: FinancialTransaction[];
}
