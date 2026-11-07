/**
 * Calculus Data - Unified Data Context
 * Provides real-time reactivity over IndexedDB local-first storage.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Employee,
  DeductionLog,
  InventoryItem,
  InventoryLog,
  Apartment,
  ApartmentItem,
  Booking,
  BookingExtension,
  FinancialTransaction,
  SystemUser,
  SystemSettings,
} from '../types';
import {
  STORES,
  getAllFromStore,
  putToStore,
  deleteFromStore,
  initializeDatabase,
  DEFAULT_SETTINGS,
  DEFAULT_ADMIN,
  exportFullBackup,
  importFullBackup,
  resetDatabaseToClean,
} from '../db/indexedDB';

interface WhatsAppModalPayload {
  isOpen: boolean;
  phone: string;
  countryCode: string;
  recipientName: string;
  message: string;
  title: string;
}

interface DataContextType {
  // Loading & State
  loading: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  currentUser: SystemUser;
  setCurrentUser: (user: SystemUser) => void;
  users: SystemUser[];
  saveUser: (user: SystemUser) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Employees
  employees: Employee[];
  saveEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Payroll & Deductions
  deductionLogs: DeductionLog[];
  addDeductionOrBonus: (params: {
    employeeId: string;
    type: 'deduction' | 'bonus';
    amount: number;
    reason: string;
    authorizedBy: string;
    date: string;
  }) => Promise<DeductionLog>;

  // Factory Inventory
  inventoryItems: InventoryItem[];
  inventoryLogs: InventoryLog[];
  saveInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  adjustInventoryStock: (params: {
    itemId: string;
    type: 'stock_in' | 'stock_out' | 'adjustment';
    quantityChange: number;
    reason: string;
    authorizedBy: string;
  }) => Promise<void>;

  // Apartments & Hotel
  apartments: Apartment[];
  saveApartment: (apt: Apartment) => Promise<void>;
  deleteApartment: (id: string) => Promise<void>;
  apartmentItems: ApartmentItem[];
  saveApartmentItem: (item: ApartmentItem) => Promise<void>;
  deleteApartmentItem: (id: string) => Promise<void>;

  // Bookings
  bookings: Booking[];
  createBooking: (booking: Booking) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  extendBooking: (params: {
    bookingId: string;
    addedDays: number;
    additionalAmount: number;
    notes?: string;
  }) => Promise<void>;
  checkoutBooking: (bookingId: string, apartmentCondition: 'available' | 'maintenance') => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;

  // Financial Ledger
  financialTransactions: FinancialTransaction[];
  addFinancialTransaction: (tx: FinancialTransaction) => Promise<void>;
  deleteFinancialTransaction: (id: string) => Promise<void>;

  // Backup & Restore
  triggerExportBackup: () => Promise<string>;
  triggerImportBackup: (jsonContent: string) => Promise<{ success: boolean; message: string }>;
  triggerResetDatabase: () => Promise<void>;

  // WhatsApp Modal
  whatsAppModal: WhatsAppModalPayload;
  openWhatsAppModal: (payload: Omit<WhatsAppModalPayload, 'isOpen'>) => void;
  closeWhatsAppModal: () => void;

  // Calculated Metrics
  metrics: {
    // Company Total
    baseCapital: number;
    capitalInjections: number;
    capitalWithdrawals: number;
    totalCompanyRevenues: number;
    totalCompanyExpenses: number;
    netCompanyProfit: number;
    currentLiquidFunds: number;

    // Factory
    factoryRevenues: number;
    factoryExpenses: number;
    factoryInventoryValue: number;
    factoryEmployeesCount: number;
    factorySalariesCommitment: number;
    factoryLowStockItems: InventoryItem[];
    factoryNetProfit: number;
    factoryCurrentBalance: number;

    // Hotel
    hotelRevenues: number;
    hotelExpenses: number;
    hotelApartmentsCount: number;
    hotelAvailableCount: number;
    hotelOccupiedCount: number;
    hotelReservedCount: number;
    hotelMaintenanceCount: number;
    hotelActiveBookingsCount: number;
    hotelPendingGuestBalances: number;
    hotelEmployeesCount: number;
    hotelNetProfit: number;
    hotelCurrentBalance: number;

    // Alerts
    expiringBookings: { booking: Booking; daysLeft: number; isExpired: boolean }[];
    lowStockAlerts: InventoryItem[];
  };

  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<SystemUser>(DEFAULT_ADMIN);
  const [users, setUsers] = useState<SystemUser[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deductionLogs, setDeductionLogs] = useState<DeductionLog[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [apartmentItems, setApartmentItems] = useState<ApartmentItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);

  // WhatsApp Dialog State
  const [whatsAppModal, setWhatsAppModal] = useState<WhatsAppModalPayload>({
    isOpen: false,
    phone: '',
    countryCode: '+20',
    recipientName: '',
    message: '',
    title: 'إرسال رسالة واتساب',
  });

  const openWhatsAppModal = useCallback((payload: Omit<WhatsAppModalPayload, 'isOpen'>) => {
    setWhatsAppModal({ ...payload, isOpen: true });
  }, []);

  const closeWhatsAppModal = useCallback(() => {
    setWhatsAppModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Load all data from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const { settings: initSettings, currentUser: initUser } = await initializeDatabase();
      setSettings(initSettings);
      setCurrentUser(initUser);

      const [
        loadedUsers,
        loadedEmployees,
        loadedDeductions,
        loadedInventory,
        loadedInvLogs,
        loadedApartments,
        loadedAptItems,
        loadedBookings,
        loadedFinance,
      ] = await Promise.all([
        getAllFromStore<SystemUser>(STORES.SYSTEM_USERS),
        getAllFromStore<Employee>(STORES.EMPLOYEES),
        getAllFromStore<DeductionLog>(STORES.DEDUCTION_LOGS),
        getAllFromStore<InventoryItem>(STORES.INVENTORY_ITEMS),
        getAllFromStore<InventoryLog>(STORES.INVENTORY_LOGS),
        getAllFromStore<Apartment>(STORES.APARTMENTS),
        getAllFromStore<ApartmentItem>(STORES.APARTMENT_ITEMS),
        getAllFromStore<Booking>(STORES.BOOKINGS),
        getAllFromStore<FinancialTransaction>(STORES.FINANCIAL_TRANSACTIONS),
      ]);

      setUsers(loadedUsers);
      setEmployees(loadedEmployees);
      setDeductionLogs(loadedDeductions);
      setInventoryItems(loadedInventory);
      setInventoryLogs(loadedInvLogs);
      setApartments(loadedApartments);
      setApartmentItems(loadedAptItems);
      setBookings(loadedBookings);
      setFinancialTransactions(loadedFinance);
    } catch (err) {
      console.error('Error initializing IndexedDB data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Settings
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
    await putToStore(STORES.SETTINGS, updated);
    setSettings(updated);
  };

  // Users
  const saveUser = async (user: SystemUser) => {
    await putToStore(STORES.SYSTEM_USERS, user);
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [...prev, user];
    });
  };

  const deleteUser = async (userId: string) => {
    if (users.length <= 1) return; // Prevent deleting last user
    await deleteFromStore(STORES.SYSTEM_USERS, userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Employees
  const saveEmployee = async (emp: Employee) => {
    await putToStore(STORES.EMPLOYEES, emp);
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === emp.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = emp;
        return copy;
      }
      return [...prev, emp];
    });
  };

  const deleteEmployee = async (id: string) => {
    await deleteFromStore(STORES.EMPLOYEES, id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Deductions / Bonuses
  const addDeductionOrBonus = async (params: {
    employeeId: string;
    type: 'deduction' | 'bonus';
    amount: number;
    reason: string;
    authorizedBy: string;
    date: string;
  }): Promise<DeductionLog> => {
    const emp = employees.find((e) => e.id === params.employeeId);
    if (!emp) throw new Error('الموظف غير موجود');

    // Calculate current deductions total for this month
    const curMonth = params.date.slice(0, 7);
    const existingDeductions = deductionLogs
      .filter((d) => d.employeeId === emp.id && d.date.startsWith(curMonth) && d.type === 'deduction')
      .reduce((sum, d) => sum + d.amount, 0);

    const existingBonuses = deductionLogs
      .filter((d) => d.employeeId === emp.id && d.date.startsWith(curMonth) && d.type === 'bonus')
      .reduce((sum, d) => sum + d.amount, 0);

    const newTotalDeductions = params.type === 'deduction' ? existingDeductions + params.amount : existingDeductions;
    const newTotalBonuses = params.type === 'bonus' ? existingBonuses + params.amount : existingBonuses;
    const netSalaryRemaining = emp.monthlySalary + newTotalBonuses - newTotalDeductions;

    const log: DeductionLog = {
      id: `ded_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      branch: emp.branch,
      type: params.type,
      amount: params.amount,
      reason: params.reason,
      date: params.date,
      authorizedBy: params.authorizedBy,
      baseSalary: emp.monthlySalary,
      totalDeductionsAtTime: newTotalDeductions,
      netSalaryRemaining,
      createdAt: new Date().toISOString(),
    };

    await putToStore(STORES.DEDUCTION_LOGS, log);
    setDeductionLogs((prev) => [log, ...prev]);

    return log;
  };

  // Inventory
  const saveInventoryItem = async (item: InventoryItem) => {
    const totalValue = item.quantity * item.unitPrice;
    const finalItem = { ...item, totalValue, updatedAt: new Date().toISOString() };
    await putToStore(STORES.INVENTORY_ITEMS, finalItem);
    setInventoryItems((prev) => {
      const idx = prev.findIndex((i) => i.id === finalItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = finalItem;
        return copy;
      }
      return [...prev, finalItem];
    });
  };

  const deleteInventoryItem = async (id: string) => {
    await deleteFromStore(STORES.INVENTORY_ITEMS, id);
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const adjustInventoryStock = async (params: {
    itemId: string;
    type: 'stock_in' | 'stock_out' | 'adjustment';
    quantityChange: number;
    reason: string;
    authorizedBy: string;
  }) => {
    const item = inventoryItems.find((i) => i.id === params.itemId);
    if (!item) return;

    let newQuantity = item.quantity;
    if (params.type === 'stock_in') {
      newQuantity += params.quantityChange;
    } else if (params.type === 'stock_out') {
      newQuantity = Math.max(0, item.quantity - params.quantityChange);
    } else {
      newQuantity = Math.max(0, params.quantityChange);
    }

    const updatedItem: InventoryItem = {
      ...item,
      quantity: newQuantity,
      totalValue: newQuantity * item.unitPrice,
      updatedAt: new Date().toISOString(),
    };

    const log: InventoryLog = {
      id: `inv_log_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: params.type,
      quantity: params.quantityChange,
      previousQuantity: item.quantity,
      newQuantity,
      reason: params.reason,
      authorizedBy: params.authorizedBy,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    await putToStore(STORES.INVENTORY_ITEMS, updatedItem);
    await putToStore(STORES.INVENTORY_LOGS, log);

    setInventoryItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
    setInventoryLogs((prev) => [log, ...prev]);
  };

  // Apartments
  const saveApartment = async (apt: Apartment) => {
    const finalApt = { ...apt, updatedAt: new Date().toISOString() };
    await putToStore(STORES.APARTMENTS, finalApt);
    setApartments((prev) => {
      const idx = prev.findIndex((a) => a.id === finalApt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = finalApt;
        return copy;
      }
      return [...prev, finalApt];
    });
  };

  const deleteApartment = async (id: string) => {
    await deleteFromStore(STORES.APARTMENTS, id);
    setApartments((prev) => prev.filter((a) => a.id !== id));
  };

  const saveApartmentItem = async (item: ApartmentItem) => {
    await putToStore(STORES.APARTMENT_ITEMS, item);
    setApartmentItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
  };

  const deleteApartmentItem = async (id: string) => {
    await deleteFromStore(STORES.APARTMENT_ITEMS, id);
    setApartmentItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Bookings
  const createBooking = async (booking: Booking) => {
    await putToStore(STORES.BOOKINGS, booking);

    // Update apartment status to occupied or reserved
    const apt = apartments.find((a) => a.id === booking.apartmentId || a.apartmentNumber === booking.apartmentNumber);
    if (apt) {
      const updatedApt: Apartment = {
        ...apt,
        status: 'occupied',
        updatedAt: new Date().toISOString(),
      };
      await putToStore(STORES.APARTMENTS, updatedApt);
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? updatedApt : a)));
    }

    // Automatically record booking deposit/payment as hotel revenue if paidAmount > 0
    if (booking.paidAmount > 0) {
      const revenueTx: FinancialTransaction = {
        id: `fin_bk_${booking.id}_initial`,
        type: 'revenue',
        branch: 'hotel',
        category: 'booking_revenue',
        amount: booking.paidAmount,
        date: booking.startDate || new Date().toISOString().slice(0, 10),
        reason: `عربون / سداد حجز شقة ${booking.apartmentNumber} - العميل: ${booking.guestName}`,
        authorizedBy: currentUser.name,
        referenceId: booking.id,
        createdAt: new Date().toISOString(),
      };
      await putToStore(STORES.FINANCIAL_TRANSACTIONS, revenueTx);
      setFinancialTransactions((prev) => [revenueTx, ...prev]);
    }

    setBookings((prev) => [booking, ...prev]);
  };

  const updateBooking = async (booking: Booking) => {
    const finalBooking = { ...booking, updatedAt: new Date().toISOString() };
    await putToStore(STORES.BOOKINGS, finalBooking);
    setBookings((prev) => prev.map((b) => (b.id === finalBooking.id ? finalBooking : b)));
  };

  const extendBooking = async (params: {
    bookingId: string;
    addedDays: number;
    additionalAmount: number;
    notes?: string;
  }) => {
    const booking = bookings.find((b) => b.id === params.bookingId);
    if (!booking) return;

    // Calculate new end date
    const curEnd = new Date(booking.endDate);
    curEnd.setDate(curEnd.getDate() + params.addedDays);
    const newEndDateStr = curEnd.toISOString().slice(0, 10);

    const extension: BookingExtension = {
      id: `ext_${Date.now()}`,
      addedDays: params.addedDays,
      additionalAmount: params.additionalAmount,
      oldEndDate: booking.endDate,
      newEndDate: newEndDateStr,
      date: new Date().toISOString().slice(0, 10),
      notes: params.notes,
    };

    const newDuration = booking.durationDays + params.addedDays;
    const newTotalAmount = booking.totalAmount + params.additionalAmount;
    const newRemainingAmount = booking.remainingAmount + params.additionalAmount;

    const updatedBooking: Booking = {
      ...booking,
      durationDays: newDuration,
      endDate: newEndDateStr,
      totalAmount: newTotalAmount,
      remainingAmount: newRemainingAmount,
      status: 'extended',
      extensions: [...(booking.extensions || []), extension],
      updatedAt: new Date().toISOString(),
    };

    await putToStore(STORES.BOOKINGS, updatedBooking);
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updatedBooking : b)));
  };

  const checkoutBooking = async (bookingId: string, apartmentCondition: 'available' | 'maintenance') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };

    const apt = apartments.find((a) => a.id === booking.apartmentId || a.apartmentNumber === booking.apartmentNumber);
    if (apt) {
      const updatedApt: Apartment = {
        ...apt,
        status: apartmentCondition,
        updatedAt: new Date().toISOString(),
      };
      await putToStore(STORES.APARTMENTS, updatedApt);
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? updatedApt : a)));
    }

    await putToStore(STORES.BOOKINGS, updatedBooking);
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updatedBooking : b)));
  };

  const cancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    const apt = apartments.find((a) => a.id === booking.apartmentId || a.apartmentNumber === booking.apartmentNumber);
    if (apt) {
      const updatedApt: Apartment = {
        ...apt,
        status: 'available',
        updatedAt: new Date().toISOString(),
      };
      await putToStore(STORES.APARTMENTS, updatedApt);
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? updatedApt : a)));
    }

    await putToStore(STORES.BOOKINGS, updatedBooking);
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updatedBooking : b)));
  };

  // Finance
  const addFinancialTransaction = async (tx: FinancialTransaction) => {
    await putToStore(STORES.FINANCIAL_TRANSACTIONS, tx);
    setFinancialTransactions((prev) => [tx, ...prev]);

    // If transaction is capital adjustment, update system settings baseCapital directly
    if (tx.type === 'capital_initial') {
      await updateSettings({ baseCapital: tx.amount });
    }
  };

  const deleteFinancialTransaction = async (id: string) => {
    await deleteFromStore(STORES.FINANCIAL_TRANSACTIONS, id);
    setFinancialTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Backup & Restore
  const triggerExportBackup = async () => {
    const backupStr = await exportFullBackup();
    await refreshAllData();
    return backupStr;
  };

  const triggerImportBackup = async (jsonContent: string) => {
    const res = await importFullBackup(jsonContent);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const triggerResetDatabase = async () => {
    await resetDatabaseToClean();
    await refreshAllData();
  };

  // Comprehensive Metrics Calculation
  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const alertDays = settings.bookingAlertDaysBefore || 1;

    // Factory Calculations
    const factoryEmployees = employees.filter((e) => e.branch === 'factory');
    const factoryActiveEmps = factoryEmployees.filter((e) => e.status === 'active');
    const factorySalariesCommitment = factoryActiveEmps.reduce((s, e) => s + e.monthlySalary, 0);

    const factoryInventoryValue = inventoryItems.reduce((s, i) => s + i.totalValue, 0);
    const factoryLowStockItems = inventoryItems.filter(
      (i) => i.quantity <= (i.minAlertQuantity || settings.lowStockAlertDefaultThreshold)
    );

    const factoryTxs = financialTransactions.filter((t) => t.branch === 'factory');
    const factoryRevenues = factoryTxs.filter((t) => t.type === 'revenue').reduce((s, t) => s + t.amount, 0);
    const factoryExpenses = factoryTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const factoryNetProfit = factoryRevenues - factoryExpenses;
    const factoryCurrentBalance = factoryNetProfit;

    // Hotel Calculations
    const hotelEmployees = employees.filter((e) => e.branch === 'hotel');
    const hotelApartmentsCount = apartments.length;
    const hotelAvailableCount = apartments.filter((a) => a.status === 'available').length;
    const hotelOccupiedCount = apartments.filter((a) => a.status === 'occupied').length;
    const hotelReservedCount = apartments.filter((a) => a.status === 'reserved').length;
    const hotelMaintenanceCount = apartments.filter((a) => a.status === 'maintenance').length;

    const activeBookings = bookings.filter((b) => b.status === 'active' || b.status === 'extended');
    const hotelActiveBookingsCount = activeBookings.length;
    const hotelPendingGuestBalances = activeBookings.reduce((s, b) => s + (b.remainingAmount || 0), 0);

    const hotelTxs = financialTransactions.filter((t) => t.branch === 'hotel');
    const hotelRevenues = hotelTxs.filter((t) => t.type === 'revenue').reduce((s, t) => s + t.amount, 0);
    const hotelExpenses = hotelTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const hotelNetProfit = hotelRevenues - hotelExpenses;
    const hotelCurrentBalance = hotelNetProfit;

    // Company Consolidated
    const baseCapital = settings.baseCapital || 0;
    const capitalInjections = financialTransactions
      .filter((t) => t.type === 'capital_injection')
      .reduce((s, t) => s + t.amount, 0);
    const capitalWithdrawals = financialTransactions
      .filter((t) => t.type === 'capital_withdrawal')
      .reduce((s, t) => s + t.amount, 0);

    const totalCompanyRevenues = financialTransactions
      .filter((t) => t.type === 'revenue')
      .reduce((s, t) => s + t.amount, 0);

    const totalCompanyExpenses = financialTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const netCompanyProfit = totalCompanyRevenues - totalCompanyExpenses;

    const currentLiquidFunds =
      baseCapital + capitalInjections - capitalWithdrawals + netCompanyProfit;

    // Booking Alerts
    const expiringBookings: { booking: Booking; daysLeft: number; isExpired: boolean }[] = [];
    activeBookings.forEach((b) => {
      const end = new Date(b.endDate).getTime();
      const now = new Date(today).getTime();
      const diffDays = Math.round((end - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= alertDays) {
        expiringBookings.push({
          booking: b,
          daysLeft: diffDays,
          isExpired: diffDays <= 0,
        });
      }
    });

    return {
      baseCapital,
      capitalInjections,
      capitalWithdrawals,
      totalCompanyRevenues,
      totalCompanyExpenses,
      netCompanyProfit,
      currentLiquidFunds,

      factoryRevenues,
      factoryExpenses,
      factoryInventoryValue,
      factoryEmployeesCount: factoryActiveEmps.length,
      factorySalariesCommitment,
      factoryLowStockItems,
      factoryNetProfit,
      factoryCurrentBalance,

      hotelRevenues,
      hotelExpenses,
      hotelApartmentsCount,
      hotelAvailableCount,
      hotelOccupiedCount,
      hotelReservedCount,
      hotelMaintenanceCount,
      hotelActiveBookingsCount,
      hotelPendingGuestBalances,
      hotelEmployeesCount: hotelEmployees.length,
      hotelNetProfit,
      hotelCurrentBalance,

      expiringBookings,
      lowStockAlerts: factoryLowStockItems,
    };
  }, [
    employees,
    inventoryItems,
    apartments,
    bookings,
    financialTransactions,
    settings,
  ]);

  return (
    <DataContext.Provider
      value={{
        loading,
        activeSection,
        setActiveSection,
        settings,
        updateSettings,
        currentUser,
        setCurrentUser,
        users,
        saveUser,
        deleteUser,

        employees,
        saveEmployee,
        deleteEmployee,

        deductionLogs,
        addDeductionOrBonus,

        inventoryItems,
        inventoryLogs,
        saveInventoryItem,
        deleteInventoryItem,
        adjustInventoryStock,

        apartments,
        saveApartment,
        deleteApartment,
        apartmentItems,
        saveApartmentItem,
        deleteApartmentItem,

        bookings,
        createBooking,
        updateBooking,
        extendBooking,
        checkoutBooking,
        cancelBooking,

        financialTransactions,
        addFinancialTransaction,
        deleteFinancialTransaction,

        triggerExportBackup,
        triggerImportBackup,
        triggerResetDatabase,

        whatsAppModal,
        openWhatsAppModal,
        closeWhatsAppModal,

        metrics,
        refreshAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
