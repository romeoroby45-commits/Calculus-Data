import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  FinancialTransaction,
  FinancialTransactionType,
  FinancialCategory,
  Branch,
} from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building,
  Factory,
  Hotel,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
} from 'lucide-react';

const TRANSACTION_TYPES: { id: FinancialTransactionType; label: string; isCredit: boolean }[] = [
  { id: 'revenue', label: 'إيراد (+)', isCredit: true },
  { id: 'expense', label: 'مصروف (-)', isCredit: false },
  { id: 'capital_injection', label: 'زيادة رأس مال (+)', isCredit: true },
  { id: 'capital_withdrawal', label: 'سحب من رأس المال (-)', isCredit: false },
  { id: 'capital_initial', label: 'تحديد رأس المال الأساسي', isCredit: true },
];

export const FinanceSection: React.FC = () => {
  const {
    financialTransactions,
    addFinancialTransaction,
    deleteFinancialTransaction,
    metrics,
    currentUser,
    settings,
    updateSettings,
  } = useData();

  const cur = settings.currency || 'ج.م';
  const [activeTab, setActiveTab] = useState<'consolidated' | 'factory' | 'hotel' | 'capital'>('consolidated');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // New Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txForm, setTxForm] = useState<{
    type: FinancialTransactionType;
    branch: Branch;
    category: FinancialCategory;
    amount: number;
    date: string;
    reason: string;
    notes: string;
  }>({
    type: 'revenue',
    branch: 'company',
    category: 'other',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    notes: '',
  });

  // Base capital editor modal
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [newBaseCapital, setNewBaseCapital] = useState<number>(settings.baseCapital || 0);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter((tx) => {
      // Branch filter
      if (activeTab === 'factory' && tx.branch !== 'factory') return false;
      if (activeTab === 'hotel' && tx.branch !== 'hotel') return false;
      if (activeTab === 'capital' && !tx.type.startsWith('capital_')) return false;

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Search
      if (
        searchQuery &&
        !tx.reason.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tx.authorizedBy.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Dates
      if (startDateFilter && tx.date < startDateFilter) return false;
      if (endDateFilter && tx.date > endDateFilter) return false;

      return true;
    });
  }, [financialTransactions, activeTab, typeFilter, searchQuery, startDateFilter, endDateFilter]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txForm.amount <= 0 || !txForm.reason) return;

    const tx: FinancialTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: txForm.type,
      branch: txForm.branch,
      category: txForm.category,
      amount: Number(txForm.amount),
      date: txForm.date || new Date().toISOString().slice(0, 10),
      reason: txForm.reason,
      authorizedBy: currentUser.name,
      notes: txForm.notes,
      createdAt: new Date().toISOString(),
    };

    await addFinancialTransaction(tx);
    setIsModalOpen(false);
  };

  const handleSaveBaseCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ baseCapital: Number(newBaseCapital) });

    // Also record transaction in ledger
    const tx: FinancialTransaction = {
      id: `tx_cap_init_${Date.now()}`,
      type: 'capital_initial',
      branch: 'company',
      category: 'capital',
      amount: Number(newBaseCapital),
      date: new Date().toISOString().slice(0, 10),
      reason: 'تحديث وتثبيت رأس مال الشركة الأساسي',
      authorizedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    await addFinancialTransaction(tx);

    setIsCapitalModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>الحسابات المالية ورأس المال</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            دفتر الأستاذ المالي الشامل للشركة، فصل كامل بين المصنع والفندق، مع عرض الحسابات المجمعة ورأس المال.
          </p>
        </div>

        {/* Tab Controls & Add Transaction */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('consolidated')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'consolidated'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الحسابات المجمعة
            </button>
            <button
              onClick={() => setActiveTab('factory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'factory'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حساب المصنع
            </button>
            <button
              onClick={() => setActiveTab('hotel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'hotel'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حساب الفندق
            </button>
            <button
              onClick={() => setActiveTab('capital')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'capital'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              رأس المال
            </button>
          </div>

          <button
            onClick={() => {
              setTxForm({
                type: 'revenue',
                branch: activeTab === 'factory' ? 'factory' : activeTab === 'hotel' ? 'hotel' : 'company',
                category: 'other',
                amount: 0,
                date: new Date().toISOString().slice(0, 10),
                reason: '',
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل حركة مالية</span>
          </button>
        </div>
      </div>

      {/* KPI Cards based on Active Tab */}
      {activeTab === 'consolidated' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إجمالي الأموال الحالية (السيولة)</span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600">
              {metrics.currentLiquidFunds.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">رأس المال + صافي الأرباح التشغيلية</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إجمالي إيرادات الشركة</span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900">
              {metrics.totalCompanyRevenues.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">إيرادات المصنع والفندق معاً</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إجمالي مصروفات الشركة</span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-600">
              {metrics.totalCompanyExpenses.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">تشغيلية، رواتب، وصيانة</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">صافي الأرباح والخسائر</span>
            <div
              className={`mt-2 text-2xl font-black font-mono ${
                metrics.netCompanyProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {metrics.netCompanyProfit.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">الإيرادات - المصروفات</p>
          </div>
        </div>
      )}

      {activeTab === 'factory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إيرادات المصنع</span>
            <div className="mt-2 text-2xl font-black font-mono text-blue-600">
              {metrics.factoryRevenues.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">مبيعات وتشغيل</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">مصروفات المصنع</span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-600">
              {metrics.factoryExpenses.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">خامات، صيانة، وتشغيل</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">صافي أرباح المصنع</span>
            <div
              className={`mt-2 text-2xl font-black font-mono ${
                metrics.factoryNetProfit >= 0 ? 'text-blue-700' : 'text-rose-600'
              }`}
            >
              {metrics.factoryNetProfit.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">الرصيد التشغيلي للمصنع</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إجمالي قيمة المخزون الحالي</span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900">
              {metrics.factoryInventoryValue.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">أصول مخزنية مقدرة</p>
          </div>
        </div>
      )}

      {activeTab === 'hotel' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">إيرادات الفندق المحصلة</span>
            <div className="mt-2 text-2xl font-black font-mono text-purple-600">
              {metrics.hotelRevenues.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">عربونات وسداد حجوزات الشقق</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">المبالغ المتبقية المستحقة من النزلاء</span>
            <div className="mt-2 text-2xl font-black font-mono text-amber-600">
              {metrics.hotelPendingGuestBalances.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">مستحقات عند المغادرة</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">مصروفات الفندق</span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-600">
              {metrics.hotelExpenses.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">صيانة شقق، مستلزمات ونظافة</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">صافي أرباح الفندق</span>
            <div
              className={`mt-2 text-2xl font-black font-mono ${
                metrics.hotelNetProfit >= 0 ? 'text-purple-700' : 'text-rose-600'
              }`}
            >
              {metrics.hotelNetProfit.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">الرصيد التشغيلي للفندق</p>
          </div>
        </div>
      )}

      {activeTab === 'capital' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">رأس مال الشركة الأساسي</span>
              <button
                onClick={() => {
                  setNewBaseCapital(settings.baseCapital || 0);
                  setIsCapitalModalOpen(true);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                تعديل
              </button>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900">
              {metrics.baseCapital.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">المبلغ التأسيسي المسجل</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">زيادات رأس المال</span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600">
              +{metrics.capitalInjections.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">ضخ أموال إضافية</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">السحوبات من رأس المال</span>
            <div className="mt-2 text-2xl font-black font-mono text-rose-600">
              -{metrics.capitalWithdrawals.toLocaleString()} <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">سحوبات الشركاء والملاك</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">صافي رأس المال الحالي</span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900">
              {(metrics.baseCapital + metrics.capitalInjections - metrics.capitalWithdrawals).toLocaleString()}{' '}
              <span className="text-xs font-sans text-slate-500">{cur}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">رأس المال المعدل بعد السحوبات</p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-48">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالبيان أو المسؤول..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">كافة أنواع الحركات</option>
            <option value="revenue">إيرادات فقط (+)</option>
            <option value="expense">مصروفات فقط (-)</option>
            <option value="capital_injection">زيادات رأس المال</option>
            <option value="capital_withdrawal">السحوبات</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <span>من:</span>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
          />
          <span>إلى:</span>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            دفتر القيود والحركات المالية ({filteredTransactions.length} حركة)
          </h3>
          <span className="text-xs text-slate-400">سجل محاسبي مستقل لكل حركة بدون ازدواجية</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">القسم / المصدر</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">البيان / سبب الحركة</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">المسؤول</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا توجد قيود مالية مسجلة مطابقة للفلاتر. اضغط "تسجيل حركة مالية" لإضافة قيد.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit =
                    tx.type === 'revenue' ||
                    tx.type === 'capital_injection' ||
                    tx.type === 'capital_initial';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            tx.branch === 'factory'
                              ? 'bg-blue-50 text-blue-700'
                              : tx.branch === 'hotel'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.branch === 'factory' && 'المصنع'}
                          {tx.branch === 'hotel' && 'الفندق'}
                          {tx.branch === 'company' && 'الشركة عامة'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {tx.type === 'revenue' && <span className="text-emerald-700">إيراد</span>}
                        {tx.type === 'expense' && <span className="text-rose-700">مصروف</span>}
                        {tx.type === 'capital_injection' && (
                          <span className="text-indigo-700">زيادة رأس مال</span>
                        )}
                        {tx.type === 'capital_withdrawal' && (
                          <span className="text-orange-700">سحب من رأس المال</span>
                        )}
                        {tx.type === 'capital_initial' && (
                          <span className="text-slate-700">رأس مال أساسي</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.reason}</td>
                      <td
                        className={`py-3 px-4 font-mono font-bold ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {tx.amount.toLocaleString()} {cur}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{tx.authorizedBy}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذه الحركة المالية؟')) {
                              deleteFinancialTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD FINANCIAL TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              تسجيل حركة مالية جديدة في دفتر الحسابات
            </div>
            <form onSubmit={handleSaveTransaction} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نوع الحركة *</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="revenue">إيراد (+)</option>
                    <option value="expense">مصروف (-)</option>
                    <option value="capital_injection">زيادة رأس مال (+)</option>
                    <option value="capital_withdrawal">سحب من رأس المال (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القسم / المصدر *</label>
                  <select
                    value={txForm.branch}
                    onChange={(e) => setTxForm({ ...txForm, branch: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="factory">المصنع</option>
                    <option value="hotel">الفندق</option>
                    <option value="company">الشركة عامة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المبلغ ({cur}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={txForm.amount || ''}
                  onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                  placeholder="أدخل المبلغ"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">البيان / سبب الحركة المالية *</label>
                <input
                  type="text"
                  required
                  value={txForm.reason}
                  onChange={(e) => setTxForm({ ...txForm, reason: e.target.value })}
                  placeholder="مثال: فاتورة كهرباء الفندق، شراء خامات للمصنع، مبيعات منتجات تامة..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الحركة *</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  تسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE BASE CAPITAL */}
      {isCapitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              تحديد رأس مال الشركة الأساسي
            </div>
            <form onSubmit={handleSaveBaseCapital} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500 leading-relaxed">
                رأس مال الشركة الأساسي هو المبلغ التأسيسي المعتمد لحساب السيولة والأرباح والخسائر الإجمالية.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">رأس المال الأساسي ({cur}) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newBaseCapital}
                  onChange={(e) => setNewBaseCapital(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-base focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCapitalModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ رأس المال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
