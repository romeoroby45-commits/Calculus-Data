import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileText,
  Printer,
  Download,
  Search,
  Calendar,
  Filter,
  Factory,
  Hotel,
  DollarSign,
  Users,
  Package,
  Home,
  CheckCircle,
} from 'lucide-react';
import { exportToCSV, printDocument } from '../../utils/export';

type ReportType =
  | 'company_comprehensive'
  | 'profit_loss'
  | 'factory_employees'
  | 'hotel_employees'
  | 'payroll_deductions'
  | 'inventory_assets'
  | 'hotel_apartments'
  | 'hotel_bookings'
  | 'revenues_expenses'
  | 'capital_withdrawals';

export const ReportsSection: React.FC = () => {
  const {
    employees,
    deductionLogs,
    inventoryItems,
    apartments,
    bookings,
    financialTransactions,
    metrics,
    currentUser,
    settings,
  } = useData();

  const cur = settings.currency || 'ج.م';
  const [reportType, setReportType] = useState<ReportType>('company_comprehensive');
  const [branchFilter, setBranchFilter] = useState<'all' | 'factory' | 'hotel'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Title Mapping
  const reportTitles: Record<ReportType, string> = {
    company_comprehensive: 'التقرير المالي الشامل للشركة',
    profit_loss: 'تقرير الأرباح والخسائر المقارن',
    factory_employees: 'تقرير موظفي وعمال المصنع',
    hotel_employees: 'تقرير موظفي الفندق',
    payroll_deductions: 'تقرير مسير الرواتب والخصومات',
    inventory_assets: 'تقرير جرد ممتلكات ومخزون المصنع',
    hotel_apartments: 'تقرير الشقق الفندقية ومحتوياتها',
    hotel_bookings: 'تقرير حجوزات الشقق والنزلاء',
    revenues_expenses: 'تقرير تفصيلي بالإيرادات والمصروفات',
    capital_withdrawals: 'تقرير حركة رأس المال والسحوبات',
  };

  // Build Table Headers and Rows based on selected Report Type
  const reportData = useMemo(() => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    switch (reportType) {
      case 'company_comprehensive':
      case 'profit_loss': {
        headers = ['البند المالي', 'المصنع', 'الفندق', 'الشركة عامة', 'الإجمالي'];
        rows = [
          [
            'إجمالي الإيرادات',
            `${metrics.factoryRevenues.toLocaleString()} ${cur}`,
            `${metrics.hotelRevenues.toLocaleString()} ${cur}`,
            '—',
            `${metrics.totalCompanyRevenues.toLocaleString()} ${cur}`,
          ],
          [
            'إجمالي المصروفات',
            `${metrics.factoryExpenses.toLocaleString()} ${cur}`,
            `${metrics.hotelExpenses.toLocaleString()} ${cur}`,
            '—',
            `${metrics.totalCompanyExpenses.toLocaleString()} ${cur}`,
          ],
          [
            'صافي الأرباح / الخسائر',
            `${metrics.factoryNetProfit.toLocaleString()} ${cur}`,
            `${metrics.hotelNetProfit.toLocaleString()} ${cur}`,
            '—',
            `${metrics.netCompanyProfit.toLocaleString()} ${cur}`,
          ],
          [
            'التزام الرواتب الشهري',
            `${metrics.factorySalariesCommitment.toLocaleString()} ${cur}`,
            `${employees.filter((e) => e.branch === 'hotel').reduce((s, e) => s + e.monthlySalary, 0).toLocaleString()} ${cur}`,
            '—',
            `${employees.reduce((s, e) => s + e.monthlySalary, 0).toLocaleString()} ${cur}`,
          ],
          [
            'أصول المخزون التقديرية',
            `${metrics.factoryInventoryValue.toLocaleString()} ${cur}`,
            '—',
            '—',
            `${metrics.factoryInventoryValue.toLocaleString()} ${cur}`,
          ],
          [
            'مستحقات معلقة من النزلاء',
            '—',
            `${metrics.hotelPendingGuestBalances.toLocaleString()} ${cur}`,
            '—',
            `${metrics.hotelPendingGuestBalances.toLocaleString()} ${cur}`,
          ],
          [
            'رأس المال الأساسي المسجل',
            '—',
            '—',
            `${metrics.baseCapital.toLocaleString()} ${cur}`,
            `${metrics.baseCapital.toLocaleString()} ${cur}`,
          ],
          [
            'إجمالي الأموال والسيولة الحالية',
            '—',
            '—',
            '—',
            `${metrics.currentLiquidFunds.toLocaleString()} ${cur}`,
          ],
        ];
        break;
      }

      case 'factory_employees': {
        headers = ['اسم الموظف', 'الوظيفة', 'الهاتف', 'الراتب الأساسي', 'تاريخ التعيين', 'الحالة', 'الرقم القومي'];
        const list = employees.filter(
          (e) =>
            e.branch === 'factory' &&
            (!searchQuery || e.name.includes(searchQuery) || e.jobTitle.includes(searchQuery))
        );
        rows = list.map((e) => [
          e.name,
          e.jobTitle,
          `${e.countryCode} ${e.phone}`,
          `${e.monthlySalary.toLocaleString()} ${cur}`,
          e.hireDate,
          e.status === 'active' ? 'نشط' : 'غير نشط',
          e.nationalId || '—',
        ]);
        break;
      }

      case 'hotel_employees': {
        headers = ['اسم الموظف', 'الوظيفة', 'الهاتف', 'الراتب الأساسي', 'تاريخ التعيين', 'الحالة', 'الرقم القومي'];
        const list = employees.filter(
          (e) =>
            e.branch === 'hotel' &&
            (!searchQuery || e.name.includes(searchQuery) || e.jobTitle.includes(searchQuery))
        );
        rows = list.map((e) => [
          e.name,
          e.jobTitle,
          `${e.countryCode} ${e.phone}`,
          `${e.monthlySalary.toLocaleString()} ${cur}`,
          e.hireDate,
          e.status === 'active' ? 'نشط' : 'غير نشط',
          e.nationalId || '—',
        ]);
        break;
      }

      case 'payroll_deductions': {
        headers = ['الموظف', 'القسم', 'نوع الحركة', 'المبلغ', 'السبب', 'التاريخ', 'المسؤول', 'الصافي'];
        const list = deductionLogs.filter((d) => {
          if (branchFilter !== 'all' && d.branch !== branchFilter) return false;
          if (searchQuery && !d.employeeName.includes(searchQuery)) return false;
          if (startDate && d.date < startDate) return false;
          if (endDate && d.date > endDate) return false;
          return true;
        });
        rows = list.map((d) => [
          d.employeeName,
          d.branch === 'factory' ? 'المصنع' : 'الفندق',
          d.type === 'deduction' ? 'خصم' : 'مكافأة',
          `${d.type === 'deduction' ? '-' : '+'}${d.amount.toLocaleString()} ${cur}`,
          d.reason,
          d.date,
          d.authorizedBy,
          `${d.netSalaryRemaining.toLocaleString()} ${cur}`,
        ]);
        break;
      }

      case 'inventory_assets': {
        headers = ['الصنف', 'الكود', 'التصنيف', 'الكمية', 'الوحدة', 'سعر الوحدة', 'إجمالي القيمة', 'المورد', 'الحالة'];
        const list = inventoryItems.filter((i) => {
          if (searchQuery && !i.name.includes(searchQuery) && !i.code.includes(searchQuery)) return false;
          return true;
        });
        rows = list.map((i) => [
          i.name,
          i.code,
          i.category,
          i.quantity,
          i.unit,
          `${i.unitPrice.toLocaleString()} ${cur}`,
          `${i.totalValue.toLocaleString()} ${cur}`,
          i.supplier || '—',
          i.condition,
        ]);
        break;
      }

      case 'hotel_apartments': {
        headers = ['رقم الشقة', 'اسم / نوع الشقة', 'سعر الإيجار اليومي', 'السعة (أفراد)', 'الحالة'];
        const list = apartments.filter((a) => {
          if (searchQuery && !a.apartmentNumber.includes(searchQuery) && !a.nameOrType.includes(searchQuery)) return false;
          return true;
        });
        rows = list.map((a) => [
          `#${a.apartmentNumber}`,
          a.nameOrType,
          `${a.dailyRentPrice.toLocaleString()} ${cur}`,
          a.maxGuests,
          a.status === 'available'
            ? 'متاحة'
            : a.status === 'occupied'
            ? 'مشغولة'
            : a.status === 'reserved'
            ? 'محجوزة'
            : a.status === 'maintenance'
            ? 'صيانة'
            : 'غير متاحة',
        ]);
        break;
      }

      case 'hotel_bookings': {
        headers = ['رقم الشقة', 'اسم النزيل', 'الهاتف', 'تاريخ الوصول', 'تاريخ المغادرة', 'المدة (أيام)', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'];
        const list = bookings.filter((b) => {
          if (searchQuery && !b.guestName.includes(searchQuery) && !b.apartmentNumber.includes(searchQuery)) return false;
          if (startDate && b.startDate < startDate) return false;
          if (endDate && b.endDate > endDate) return false;
          return true;
        });
        rows = list.map((b) => [
          `#${b.apartmentNumber}`,
          b.guestName,
          `${b.countryCode} ${b.phone}`,
          b.startDate,
          b.endDate,
          b.durationDays,
          `${b.totalAmount.toLocaleString()} ${cur}`,
          `${b.paidAmount.toLocaleString()} ${cur}`,
          `${b.remainingAmount.toLocaleString()} ${cur}`,
          b.status,
        ]);
        break;
      }

      case 'revenues_expenses': {
        headers = ['التاريخ', 'القسم', 'النوع', 'البيان', 'المبلغ', 'المسؤول'];
        const list = financialTransactions.filter((t) => {
          if (t.type !== 'revenue' && t.type !== 'expense') return false;
          if (branchFilter !== 'all' && t.branch !== branchFilter) return false;
          if (searchQuery && !t.reason.includes(searchQuery)) return false;
          if (startDate && t.date < startDate) return false;
          if (endDate && t.date > endDate) return false;
          return true;
        });
        rows = list.map((t) => [
          t.date,
          t.branch === 'factory' ? 'المصنع' : t.branch === 'hotel' ? 'الفندق' : 'الشركة',
          t.type === 'revenue' ? 'إيراد' : 'مصروف',
          t.reason,
          `${t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()} ${cur}`,
          t.authorizedBy,
        ]);
        break;
      }

      case 'capital_withdrawals': {
        headers = ['التاريخ', 'نوع القيد', 'البيان', 'المبلغ', 'المسؤول'];
        const list = financialTransactions.filter((t) => t.type.startsWith('capital_'));
        rows = list.map((t) => [
          t.date,
          t.type === 'capital_initial'
            ? 'رأس مال أساسي'
            : t.type === 'capital_injection'
            ? 'زيادة رأس مال (+)'
            : 'سحب من رأس المال (-)',
          t.reason,
          `${t.amount.toLocaleString()} ${cur}`,
          t.authorizedBy,
        ]);
        break;
      }
    }

    return { headers, rows };
  }, [
    reportType,
    branchFilter,
    startDate,
    endDate,
    searchQuery,
    employees,
    deductionLogs,
    inventoryItems,
    apartments,
    bookings,
    financialTransactions,
    metrics,
    cur,
  ]);

  const handleExportCSV = () => {
    exportToCSV(`CalculusData_${reportType}`, reportData.headers, reportData.rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>التقارير التفصيلية والطباعة</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إعداد واستخراج تقارير احترافية لكافة عمليات المصنع والفندق مع خيارات الطباعة وتصدير Excel.
          </p>
        </div>

        {/* Print & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={printDocument}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Options Toolbar (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 no-print shadow-2xs text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">نوع التقرير *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
            >
              <option value="company_comprehensive">تقرير مالي شامل للشركة</option>
              <option value="profit_loss">تقرير الأرباح والخسائر</option>
              <option value="factory_employees">تقرير موظفي المصنع</option>
              <option value="hotel_employees">تقرير موظفي الفندق</option>
              <option value="payroll_deductions">تقرير الرواتب والخصومات</option>
              <option value="inventory_assets">تقرير المعدات والمخزون</option>
              <option value="hotel_apartments">تقرير الشقق ومحتوياتها</option>
              <option value="hotel_bookings">تقرير الحجوزات والنزلاء</option>
              <option value="revenues_expenses">تقرير الإيرادات والمصروفات</option>
              <option value="capital_withdrawals">تقرير رأس المال والسحوبات</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">القسم المستهدف</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="all">الشركة بالكامل (المصنع + الفندق)</option>
              <option value="factory">قسم المصنع فقط</option>
              <option value="hotel">قسم الفندق فقط</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تصفية حسب الاسم، الصنف، أو البيان..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-slate-400">عدد السجلات: {reportData.rows.length}</span>
        </div>
      </div>

      {/* Official Report Container (Styled for both Screen and Clean Print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs print:border-0 print:p-0">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Calculus Data
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                تقرير رسمي
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">نظام إدارة المصنع والفندق المتكامل</p>
          </div>

          <div className="text-left text-xs text-slate-600 font-mono space-y-1">
            <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</div>
            <div>المسؤول: {currentUser.name} ({currentUser.role})</div>
            <div>القسم: {branchFilter === 'all' ? 'شامل' : branchFilter === 'factory' ? 'المصنع' : 'الفندق'}</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">{reportTitles[reportType]}</h2>
          {(startDate || endDate) && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              الفترة الزمنية: {startDate || 'البداية'} إلى {endDate || 'اليوم'}
            </p>
          )}
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-y border-slate-300">
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-12 text-center text-slate-400">
                    لا توجد بيانات مسجلة لعرضها في هذا التقرير.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3 font-medium text-slate-800">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Report Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Calculus Data Management System • تقرير تم إنشاؤه محلياً من قاعدة البيانات المعتمدة</div>
          <div className="font-mono">توقيع المسؤول المعتمد: _________________</div>
        </div>
      </div>
    </div>
  );
};
