import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Employee,
  InventoryItem,
  InventoryCategory,
} from '../../types';
import {
  Factory,
  Users,
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Boxes,
  CheckCircle,
  XCircle,
  Wrench,
  Layers,
  Archive,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { CountrySelect } from '../common/CountrySelect';
import { DEFAULT_COUNTRY } from '../../utils/whatsapp';
import {
  createDeductionMessage,
  createBonusMessage,
  generateWhatsAppUrl,
} from '../../utils/whatsapp';

const INVENTORY_CATEGORIES: { id: InventoryCategory; label: string }[] = [
  { id: 'equipment', label: 'المعدات' },
  { id: 'machinery', label: 'الماكينات والمكن' },
  { id: 'raw_materials', label: 'الخامات' },
  { id: 'supplies', label: 'المستلزمات' },
  { id: 'accessories', label: 'الإكسسوارات' },
  { id: 'paints', label: 'الدهانات' },
  { id: 'finishes', label: 'التشطيبات' },
  { id: 'wip', label: 'المنتجات تحت التشغيل' },
  { id: 'finished_goods', label: 'المنتجات التامة' },
  { id: 'tools', label: 'الأدوات' },
];

export const FactorySection: React.FC = () => {
  const {
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
    openWhatsAppModal,
    currentUser,
    settings,
  } = useData();

  const cur = settings.currency || 'ج.م';
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'inventory'>('employees');

  // Search & Filter States
  const [empSearch, setEmpSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [selectedEmployeeForDeduction, setSelectedEmployeeForDeduction] = useState<Employee | null>(null);
  const [deductionType, setDeductionType] = useState<'deduction' | 'bonus'>('deduction');
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('');
  const [deductionDate, setDeductionDate] = useState(new Date().toISOString().slice(0, 10));

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<InventoryItem | null>(null);
  const [stockOpType, setStockOpType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [stockOpQuantity, setStockOpQuantity] = useState<number>(1);
  const [stockOpReason, setStockOpReason] = useState('');

  // Factory Employees Filter
  const factoryEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        e.branch === 'factory' &&
        (e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
          e.jobTitle.toLowerCase().includes(empSearch.toLowerCase()) ||
          e.phone.includes(empSearch))
    );
  }, [employees, empSearch]);

  // Factory Inventory Filter
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(invSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(invSearch.toLowerCase()) ||
        item.supplier.toLowerCase().includes(invSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [inventoryItems, selectedCategory, invSearch]);

  const totalInventoryValuation = useMemo(() => {
    return inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  }, [inventoryItems]);

  // Employee Form State
  const [empForm, setEmpForm] = useState<Partial<Employee>>({
    name: '',
    countryCode: DEFAULT_COUNTRY.dialCode,
    countryFlag: DEFAULT_COUNTRY.flag,
    phone: '',
    nationalId: '',
    jobTitle: '',
    monthlySalary: 0,
    hireDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    notes: '',
  });

  const openAddEmployee = () => {
    setEditingEmployee(null);
    setEmpForm({
      name: '',
      countryCode: DEFAULT_COUNTRY.dialCode,
      countryFlag: DEFAULT_COUNTRY.flag,
      phone: '',
      nationalId: '',
      jobTitle: '',
      monthlySalary: 0,
      hireDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      notes: '',
    });
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.phone || empForm.monthlySalary === undefined) return;

    const emp: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp_fac_${Date.now()}`,
      branch: 'factory',
      name: empForm.name,
      countryCode: empForm.countryCode || DEFAULT_COUNTRY.dialCode,
      countryFlag: empForm.countryFlag || DEFAULT_COUNTRY.flag,
      phone: empForm.phone,
      nationalId: empForm.nationalId || '',
      jobTitle: empForm.jobTitle || 'عامل',
      monthlySalary: Number(empForm.monthlySalary),
      hireDate: empForm.hireDate || new Date().toISOString().slice(0, 10),
      status: empForm.status || 'active',
      notes: empForm.notes || '',
      createdAt: editingEmployee ? editingEmployee.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveEmployee(emp);
    setIsEmployeeModalOpen(false);
  };

  // Deduction / Bonus Submission
  const handleDeductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForDeduction || deductionAmount <= 0) return;

    const log = await addDeductionOrBonus({
      employeeId: selectedEmployeeForDeduction.id,
      type: deductionType,
      amount: Number(deductionAmount),
      reason: deductionReason || (deductionType === 'deduction' ? 'خصم إداري' : 'مكافأة تشجيعية'),
      authorizedBy: currentUser.name,
      date: deductionDate,
    });

    setIsDeductionModalOpen(false);

    // Prompt WhatsApp notification with editable message
    if (deductionType === 'deduction') {
      const msg = createDeductionMessage({
        employeeName: selectedEmployeeForDeduction.name,
        deductionAmount: Number(deductionAmount),
        reason: deductionReason,
        date: deductionDate,
        baseSalary: selectedEmployeeForDeduction.monthlySalary,
        totalDeductions: log.totalDeductionsAtTime,
        netSalaryRemaining: log.netSalaryRemaining,
        currency: cur,
      });

      openWhatsAppModal({
        phone: selectedEmployeeForDeduction.phone,
        countryCode: selectedEmployeeForDeduction.countryCode,
        recipientName: selectedEmployeeForDeduction.name,
        message: msg,
        title: 'إرسال إشعار الخصم عبر واتساب',
      });
    } else {
      const msg = createBonusMessage({
        employeeName: selectedEmployeeForDeduction.name,
        bonusAmount: Number(deductionAmount),
        reason: deductionReason,
        date: deductionDate,
        baseSalary: selectedEmployeeForDeduction.monthlySalary,
        netSalary: log.netSalaryRemaining,
        currency: cur,
      });

      openWhatsAppModal({
        phone: selectedEmployeeForDeduction.phone,
        countryCode: selectedEmployeeForDeduction.countryCode,
        recipientName: selectedEmployeeForDeduction.name,
        message: msg,
        title: 'إرسال إشعار المكافأة عبر واتساب',
      });
    }
  };

  // Inventory Item Form State
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    category: 'equipment',
    name: '',
    code: '',
    quantity: 0,
    unit: 'قطعة',
    unitPrice: 0,
    dateAdded: new Date().toISOString().slice(0, 10),
    supplier: '',
    condition: 'جديد',
    minAlertQuantity: 5,
    notes: '',
  });

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({
      category: 'equipment',
      name: '',
      code: `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: 0,
      unit: 'قطعة',
      unitPrice: 0,
      dateAdded: new Date().toISOString().slice(0, 10),
      supplier: '',
      condition: 'جديد',
      minAlertQuantity: 5,
      notes: '',
    });
    setIsItemModalOpen(true);
  };

  const openEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.code) return;

    const qty = Number(itemForm.quantity) || 0;
    const price = Number(itemForm.unitPrice) || 0;

    const item: InventoryItem = {
      id: editingItem ? editingItem.id : `inv_${Date.now()}`,
      category: (itemForm.category as InventoryCategory) || 'equipment',
      name: itemForm.name,
      code: itemForm.code,
      quantity: qty,
      unit: itemForm.unit || 'قطعة',
      unitPrice: price,
      totalValue: qty * price,
      dateAdded: itemForm.dateAdded || new Date().toISOString().slice(0, 10),
      supplier: itemForm.supplier || '',
      condition: itemForm.condition || 'جديد',
      minAlertQuantity: Number(itemForm.minAlertQuantity) || 5,
      notes: itemForm.notes || '',
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveInventoryItem(item);
    setIsItemModalOpen(false);
  };

  // Stock Adjustment Submit
  const handleStockOpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockItem || stockOpQuantity <= 0) return;

    await adjustInventoryStock({
      itemId: selectedStockItem.id,
      type: stockOpType,
      quantityChange: Number(stockOpQuantity),
      reason: stockOpReason || (stockOpType === 'stock_in' ? 'توريد مخزني جديد' : 'صرف لخط الإنتاج'),
      authorizedBy: currentUser.name,
    });

    setIsStockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Factory className="w-6 h-6 text-indigo-600" />
            <span>إدارة قسم المصنع</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة موظفي وعمال المصنع، الرواتب والخصومات التلقائية، والمخزون والمعدات بـ 10 تصنيفات مع تنبيهات النواقص.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'employees'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            موظفو المصنع ({factoryEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'payroll'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الرواتب والخصومات
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المخزون والمعدات ({inventoryItems.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FACTORY EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="ابحث بالاسم، الوظيفة، أو الهاتف..."
                className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={openAddEmployee}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف للمصنع</span>
            </button>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">الوظيفة / المهنة</th>
                    <th className="py-3 px-4">رقم الهاتف</th>
                    <th className="py-3 px-4">الراتب الأساسي</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">تاريخ التعيين</th>
                    <th className="py-3 px-4 text-center">واتساب</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {factoryEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        لا يوجد موظفون مسجلون بالمصنع حالياً. اضغط "إضافة موظف" لبدء التسجيل.
                      </td>
                    </tr>
                  ) : (
                    factoryEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          {emp.nationalId && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              بطاقة: {emp.nationalId}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {emp.jobTitle}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800" dir="ltr">
                          <span className="mr-1">{emp.countryFlag}</span>
                          <span>{emp.countryCode} {emp.phone}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {emp.monthlySalary.toLocaleString()} {cur}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
                              emp.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {emp.status === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                نشط
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-400" />
                                غير نشط
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {emp.hireDate}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              openWhatsAppModal({
                                phone: emp.phone,
                                countryCode: emp.countryCode,
                                recipientName: emp.name,
                                message: `مرحباً أستاذ/ة ${emp.name}، تواصل مباشر من إدارة مصنع Calculus Data.`,
                                title: `مراسلة الموظف: ${emp.name}`,
                              });
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
                            title="مراسلة عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Record deduction/bonus button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployeeForDeduction(emp);
                                setDeductionType('deduction');
                                setDeductionAmount(0);
                                setDeductionReason('');
                                setIsDeductionModalOpen(true);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold text-[11px] transition-colors"
                              title="تسجيل خصم أو مكافأة"
                            >
                              خصم/مكافأة
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditEmployee(emp)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف الموظف ${emp.name}؟`)) {
                                  deleteEmployee(emp.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYROLL & DEDUCTIONS LEDGER */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
            <div>
              <span className="font-bold text-sm block">معادلة حساب الرواتب التلقائية:</span>
              <span className="text-slate-600">
                صافي الراتب المستحق = الراتب الأساسي + المكافآت - الخصومات المسجلة خلال الشهر.
              </span>
            </div>
            <span className="font-bold font-mono text-base text-indigo-700">
              إجمالي التزام الرواتب: {factoryEmployees.reduce((s, e) => s + e.monthlySalary, 0).toLocaleString()} {cur}
            </span>
          </div>

          {/* Full Deduction & Bonus Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                سجل الخصومات والمكافآت لموظفي المصنع ({deductionLogs.filter((d) => d.branch === 'factory').length})
              </span>
              <span className="text-xs text-slate-500">يتم إرسال إشعار واتساب تلقائي عند كل خصم</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">الموظف</th>
                    <th className="py-3 px-4">نوع الحركة</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">السبب</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المسؤول</th>
                    <th className="py-3 px-4">الصافي المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deductionLogs.filter((d) => d.branch === 'factory').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        لا توجد خصومات أو مكافآت مسجلة بعد لموظفي المصنع.
                      </td>
                    </tr>
                  ) : (
                    deductionLogs
                      .filter((d) => d.branch === 'factory')
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{log.employeeName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                log.type === 'deduction'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {log.type === 'deduction' ? 'خصم من الراتب' : 'مكافأة إضافية'}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 font-mono font-bold ${
                              log.type === 'deduction' ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {log.type === 'deduction' ? '-' : '+'}
                            {log.amount.toLocaleString()} {cur}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{log.reason}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{log.date}</td>
                          <td className="py-3 px-4 text-slate-600">{log.authorizedBy}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {log.netSalaryRemaining.toLocaleString()} {cur}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACTORY INVENTORY & ASSETS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Top Inventory Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                الكل ({inventoryItems.length})
              </button>
              {INVENTORY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label} ({inventoryItems.filter((i) => i.category === cat.id).length})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف مخزون</span>
              </button>
            </div>
          </div>

          {/* Search & Valuation KPI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="ابحث باسم الصنف، الكود، أو المورد..."
                className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div>
                إجمالي قيمة المخزون الحالي:{' '}
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {totalInventoryValuation.toLocaleString()} {cur}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">الصنف والكود</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">الكمية والوحدة</th>
                    <th className="py-3 px-4">سعر الوحدة</th>
                    <th className="py-3 px-4">إجمالي القيمة</th>
                    <th className="py-3 px-4">المورد والحالة</th>
                    <th className="py-3 px-4 text-center">حركة المخزون</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        لا توجد أصناف في هذا التصنيف. اضغط "إضافة صنف مخزون" للبدء.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLowStock = item.quantity <= item.minAlertQuantity;
                      const catLabel =
                        INVENTORY_CATEGORIES.find((c) => c.id === item.category)?.label || item.category;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{catLabel}</td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span className={isLowStock ? 'text-rose-600' : 'text-slate-900'}>
                              {item.quantity} {item.unit}
                            </span>
                            {isLowStock && (
                              <span className="block text-[10px] text-rose-500 font-normal">
                                نَفَذ أو قارب على النفاد!
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {item.unitPrice.toLocaleString()} {cur}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                            {item.totalValue.toLocaleString()} {cur}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{item.supplier || '—'}</div>
                            <div className="text-[10px] text-slate-400">{item.condition}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStockItem(item);
                                  setStockOpType('stock_in');
                                  setStockOpQuantity(1);
                                  setStockOpReason('توريد جديد');
                                  setIsStockModalOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                title="زيادة الكمية (توريد)"
                              >
                                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>توريد</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStockItem(item);
                                  setStockOpType('stock_out');
                                  setStockOpQuantity(1);
                                  setStockOpReason('صرف للتشغيل');
                                  setIsStockModalOpen(true);
                                }}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                title="صرف / سحب من المخزون"
                              >
                                <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>صرف</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditItem(item)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف الصنف ${item.name}؟`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT EMPLOYEE */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              {editingEmployee ? 'تعديل بيانات موظف المصنع' : 'إضافة موظف جديد للمصنع'}
            </div>
            <form onSubmit={handleSaveEmployee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الموظف *</label>
                <input
                  type="text"
                  required
                  value={empForm.name || ''}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="مثال: م. أحمد محمود"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدولة ومفتاح الاتصال *</label>
                  <CountrySelect
                    selectedDialCode={empForm.countryCode || '+20'}
                    onSelect={(country) =>
                      setEmpForm({
                        ...empForm,
                        countryCode: country.dialCode,
                        countryFlag: country.flag,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={empForm.phone || ''}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المهنة / الوظيفة *</label>
                  <input
                    type="text"
                    required
                    value={empForm.jobTitle || ''}
                    onChange={(e) => setEmpForm({ ...empForm, jobTitle: e.target.value })}
                    placeholder="مهندس، فني ميكانيكا، عامل إنتاج، محاسب..."
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الراتب الشهري الأساسي *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={empForm.monthlySalary ?? ''}
                    onChange={(e) => setEmpForm({ ...empForm, monthlySalary: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم البطاقة الشخصية (اختياري)</label>
                  <input
                    type="text"
                    value={empForm.nationalId || ''}
                    onChange={(e) => setEmpForm({ ...empForm, nationalId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ التعيين</label>
                  <input
                    type="date"
                    value={empForm.hireDate || ''}
                    onChange={(e) => setEmpForm({ ...empForm, hireDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">حالة الموظف</label>
                <select
                  value={empForm.status || 'active'}
                  onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="active">نشط على قوة العمل</option>
                  <option value="inactive">غير نشط / إجازة / متوقف</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={empForm.notes || ''}
                  onChange={(e) => setEmpForm({ ...empForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DEDUCTION / BONUS */}
      {isDeductionModalOpen && selectedEmployeeForDeduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              تسجيل حركة خصم أو مكافأة للموظف: {selectedEmployeeForDeduction.name}
            </div>
            <form onSubmit={handleDeductionSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع الحركة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeductionType('deduction')}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      deductionType === 'deduction'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    خصم من الراتب (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeductionType('bonus')}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      deductionType === 'bonus'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    مكافأة إضافية (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  المبلغ ({cur}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deductionAmount || ''}
                  onChange={(e) => setDeductionAmount(Number(e.target.value))}
                  placeholder="أدخل القيمة"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">سبب الخصم أو الاستحقاق *</label>
                <input
                  type="text"
                  required
                  value={deductionReason}
                  onChange={(e) => setDeductionReason(e.target.value)}
                  placeholder="تأخير، غياب، إتلاف عهدة، إنجاز متميز..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الحركة</label>
                  <input
                    type="date"
                    value={deductionDate}
                    onChange={(e) => setDeductionDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المسؤول</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>الراتب الأساسي:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedEmployeeForDeduction.monthlySalary.toLocaleString()} {cur}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الصافي التقديري بعد الحركة:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {(
                      selectedEmployeeForDeduction.monthlySalary +
                      (deductionType === 'bonus' ? Number(deductionAmount) : -Number(deductionAmount))
                    ).toLocaleString()}{' '}
                    {cur}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeductionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  تسجيل وتجهيز رسالة واتساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT INVENTORY ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              {editingItem ? 'تعديل صنف مخزون' : 'إضافة صنف مخزون جديد للمصنع'}
            </div>
            <form onSubmit={handleSaveItem} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التصنيف *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {INVENTORY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كود الصنف / SKU *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.code || ''}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  required
                  value={itemForm.name || ''}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="مثال: محرك سيرفو كهربائي، حديد تسليح، دهان إيبوكسي..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemForm.quantity ?? ''}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الوحدة *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.unit || ''}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="قطعة، كجم، متر..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سعر الوحدة ({cur})</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.unitPrice ?? ''}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المورد</label>
                  <input
                    type="text"
                    value={itemForm.supplier || ''}
                    onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                    placeholder="اسم الشركة أو التاجر"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">حالة الصنف</label>
                  <select
                    value={itemForm.condition || 'جديد'}
                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="جديد">جديد</option>
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد">جيد</option>
                    <option value="يحتاج صيانة">يحتاج صيانة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">حد التنبيه لنقص المخزون</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.minAlertQuantity ?? 5}
                    onChange={(e) => setItemForm({ ...itemForm, minAlertQuantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الإضافة</label>
                  <input
                    type="date"
                    value={itemForm.dateAdded || ''}
                    onChange={(e) => setItemForm({ ...itemForm, dateAdded: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={itemForm.notes || ''}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: STOCK IN / OUT ADJUSTMENT */}
      {isStockModalOpen && selectedStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              {stockOpType === 'stock_in' ? 'توريد كمية جديدة للمخزن' : 'صرف / سحب من المخزن'}
            </div>
            <form onSubmit={handleStockOpSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{selectedStockItem.name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  الرصيد الحالي: {selectedStockItem.quantity} {selectedStockItem.unit}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الكمية المراد {stockOpType === 'stock_in' ? 'إضافتها' : 'صرفها'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockOpQuantity || ''}
                  onChange={(e) => setStockOpQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">سبب الحركة *</label>
                <input
                  type="text"
                  required
                  value={stockOpReason}
                  onChange={(e) => setStockOpReason(e.target.value)}
                  placeholder={stockOpType === 'stock_in' ? 'فاتورة توريد من المورد' : 'طلب تشغيل للورشة رقم 2'}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex justify-between font-semibold text-indigo-900">
                <span>الرصيد المتوقع بعد العملية:</span>
                <span className="font-mono font-bold">
                  {stockOpType === 'stock_in'
                    ? selectedStockItem.quantity + Number(stockOpQuantity)
                    : Math.max(0, selectedStockItem.quantity - Number(stockOpQuantity))}{' '}
                  {selectedStockItem.unit}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg font-semibold shadow-2xs ${
                    stockOpType === 'stock_in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  تأكيد الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
