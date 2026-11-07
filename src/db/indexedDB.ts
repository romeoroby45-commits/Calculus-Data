/**
 * Calculus Data - Local IndexedDB Storage Engine
 * Strictly client-side offline-first persistence without external cloud dependencies.
 */

import {
  Employee,
  DeductionLog,
  InventoryItem,
  InventoryLog,
  Apartment,
  ApartmentItem,
  Booking,
  FinancialTransaction,
  SystemUser,
  SystemSettings,
  FullBackupData
} from '../types';

const DB_NAME = 'CalculusDataDB';
const DB_VERSION = 1;

export const STORES = {
  EMPLOYEES: 'employees',
  DEDUCTION_LOGS: 'deduction_logs',
  INVENTORY_ITEMS: 'inventory_items',
  INVENTORY_LOGS: 'inventory_logs',
  APARTMENTS: 'apartments',
  APARTMENT_ITEMS: 'apartment_items',
  BOOKINGS: 'bookings',
  FINANCIAL_TRANSACTIONS: 'financial_transactions',
  SYSTEM_USERS: 'system_users',
  SETTINGS: 'settings',
} as const;

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they do not exist
      if (!db.objectStoreNames.contains(STORES.EMPLOYEES)) {
        const store = db.createObjectStore(STORES.EMPLOYEES, { keyPath: 'id' });
        store.createIndex('branch', 'branch', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DEDUCTION_LOGS)) {
        const store = db.createObjectStore(STORES.DEDUCTION_LOGS, { keyPath: 'id' });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('branch', 'branch', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.INVENTORY_ITEMS)) {
        const store = db.createObjectStore(STORES.INVENTORY_ITEMS, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('code', 'code', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.INVENTORY_LOGS)) {
        const store = db.createObjectStore(STORES.INVENTORY_LOGS, { keyPath: 'id' });
        store.createIndex('itemId', 'itemId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.APARTMENTS)) {
        const store = db.createObjectStore(STORES.APARTMENTS, { keyPath: 'id' });
        store.createIndex('apartmentNumber', 'apartmentNumber', { unique: true });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.APARTMENT_ITEMS)) {
        const store = db.createObjectStore(STORES.APARTMENT_ITEMS, { keyPath: 'id' });
        store.createIndex('apartmentId', 'apartmentId', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
        const store = db.createObjectStore(STORES.BOOKINGS, { keyPath: 'id' });
        store.createIndex('apartmentId', 'apartmentId', { unique: false });
        store.createIndex('apartmentNumber', 'apartmentNumber', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('endDate', 'endDate', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FINANCIAL_TRANSACTIONS)) {
        const store = db.createObjectStore(STORES.FINANCIAL_TRANSACTIONS, { keyPath: 'id' });
        store.createIndex('branch', 'branch', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYSTEM_USERS)) {
        db.createObjectStore(STORES.SYSTEM_USERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Generic Store Operations
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIdFromStore<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Default Seeding (Clean, without fake data)
export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'system_settings',
  companyName: 'Calculus Data',
  baseCapital: 0,
  currency: 'ج.م',
  bookingAlertDaysBefore: 1,
  lowStockAlertDefaultThreshold: 5,
  activeUserId: 'admin-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_ADMIN: SystemUser = {
  id: 'admin-1',
  name: 'المدير العام',
  role: 'admin',
  pin: '1234',
  allowedSections: ['dashboard', 'factory', 'hotel', 'finance', 'reports', 'settings'],
  createdAt: new Date().toISOString(),
};

export async function initializeDatabase(): Promise<{
  settings: SystemSettings;
  currentUser: SystemUser;
}> {
  await openDatabase();

  let settings = await getByIdFromStore<SystemSettings>(STORES.SETTINGS, 'system_settings');
  if (!settings) {
    settings = { ...DEFAULT_SETTINGS };
    await putToStore(STORES.SETTINGS, settings);
  }

  let users = await getAllFromStore<SystemUser>(STORES.SYSTEM_USERS);
  if (users.length === 0) {
    await putToStore(STORES.SYSTEM_USERS, DEFAULT_ADMIN);
    users = [DEFAULT_ADMIN];
  }

  const currentUser = users.find((u) => u.id === settings?.activeUserId) || users[0] || DEFAULT_ADMIN;

  return { settings, currentUser };
}

// Backup & Restore
export async function exportFullBackup(): Promise<string> {
  const [
    settings,
    users,
    employees,
    deductionLogs,
    inventoryItems,
    inventoryLogs,
    apartments,
    apartmentItems,
    bookings,
    financialTransactions,
  ] = await Promise.all([
    getByIdFromStore<SystemSettings>(STORES.SETTINGS, 'system_settings'),
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

  const backupData: FullBackupData = {
    version: 1,
    companyName: 'Calculus Data',
    exportDate: new Date().toISOString(),
    settings: settings || DEFAULT_SETTINGS,
    users,
    employees,
    deductionLogs,
    inventoryItems,
    inventoryLogs,
    apartments,
    apartmentItems,
    bookings,
    financialTransactions,
  };

  // Update last backup date in settings
  if (settings) {
    settings.lastBackupDate = new Date().toISOString();
    await putToStore(STORES.SETTINGS, settings);
  }

  return JSON.stringify(backupData, null, 2);
}

export async function importFullBackup(jsonContent: string): Promise<{ success: boolean; message: string }> {
  try {
    const data: FullBackupData = JSON.parse(jsonContent);

    if (!data || !data.version || !data.companyName) {
      throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف.');
    }

    const db = await openDatabase();

    // Clear all stores transactionally
    const storeNames = Object.values(STORES);
    const tx = db.transaction(storeNames, 'readwrite');

    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName);
      store.clear();
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Populate data
    const populateTx = db.transaction(storeNames, 'readwrite');

    if (data.settings) populateTx.objectStore(STORES.SETTINGS).put(data.settings);
    if (Array.isArray(data.users)) {
      data.users.forEach((u) => populateTx.objectStore(STORES.SYSTEM_USERS).put(u));
    }
    if (Array.isArray(data.employees)) {
      data.employees.forEach((e) => populateTx.objectStore(STORES.EMPLOYEES).put(e));
    }
    if (Array.isArray(data.deductionLogs)) {
      data.deductionLogs.forEach((d) => populateTx.objectStore(STORES.DEDUCTION_LOGS).put(d));
    }
    if (Array.isArray(data.inventoryItems)) {
      data.inventoryItems.forEach((i) => populateTx.objectStore(STORES.INVENTORY_ITEMS).put(i));
    }
    if (Array.isArray(data.inventoryLogs)) {
      data.inventoryLogs.forEach((l) => populateTx.objectStore(STORES.INVENTORY_LOGS).put(l));
    }
    if (Array.isArray(data.apartments)) {
      data.apartments.forEach((a) => populateTx.objectStore(STORES.APARTMENTS).put(a));
    }
    if (Array.isArray(data.apartmentItems)) {
      data.apartmentItems.forEach((ai) => populateTx.objectStore(STORES.APARTMENT_ITEMS).put(ai));
    }
    if (Array.isArray(data.bookings)) {
      data.bookings.forEach((b) => populateTx.objectStore(STORES.BOOKINGS).put(b));
    }
    if (Array.isArray(data.financialTransactions)) {
      data.financialTransactions.forEach((f) => populateTx.objectStore(STORES.FINANCIAL_TRANSACTIONS).put(f));
    }

    await new Promise<void>((resolve, reject) => {
      populateTx.oncomplete = () => resolve();
      populateTx.onerror = () => reject(populateTx.error);
    });

    return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح وتحديث كافة البيانات.' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'حدث خطأ أثناء استعادة البيانات.' };
  }
}

export async function resetDatabaseToClean(): Promise<void> {
  const db = await openDatabase();
  const storeNames = Object.values(STORES);
  const tx = db.transaction(storeNames, 'readwrite');
  for (const storeName of storeNames) {
    tx.objectStore(storeName).clear();
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await putToStore(STORES.SETTINGS, DEFAULT_SETTINGS);
  await putToStore(STORES.SYSTEM_USERS, DEFAULT_ADMIN);
}
