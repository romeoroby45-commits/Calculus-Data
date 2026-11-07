import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Wallet,
  TrendingUp,
  Factory,
  Hotel,
  DollarSign,
  Package,
  Home,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Users,
  CheckCircle2,
} from 'lucide-react';
import {
  createBookingExpiringSoonMessage,
  createBookingExpiredNoticeMessage,
} from '../../utils/whatsapp';

export const DashboardOverview: React.FC = () => {
  const {
    metrics,
    setActiveSection,
    openWhatsAppModal,
    extendBooking,
    checkoutBooking,
    settings,
  } = useData();

  const [renewBookingId, setRenewBookingId] = useState<string | null>(null);
  const [renewDays, setRenewDays] = useState(1);
  const [renewAmount, setRenewAmount] = useState(0);

  const cur = settings.currency || 'ج.م';

  const handleRenewSubmit = async (bookingId: string) => {
    if (renewDays <= 0) return;
    await extendBooking({
      bookingId,
      addedDays: Number(renewDays),
      additionalAmount: Number(renewAmount),
    });
    setRenewBookingId(null);
    setRenewDays(1);
    setRenewAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            لوحة التحكم والمؤشرات المالية
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة شاملة وفورية لحركة رأس المال، المصنع، الفندق، المخزون، والحجوزات.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection('finance')}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل حركة مالية</span>
          </button>
          <button
            onClick={() => setActiveSection('hotel')}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>حجز شقة جديد</span>
          </button>
          <button
            onClick={() => setActiveSection('factory')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>صنف مخزون جديد</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Cards (Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Liquid Funds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الأموال الحالية (السيولة)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {metrics.currentLiquidFunds.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">{cur}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>رأس المال الأساسي:</span>
            <span className="font-mono font-semibold text-slate-700">
              {metrics.baseCapital.toLocaleString()} {cur}
            </span>
          </div>
        </div>

        {/* Card 2: Net Profit / Loss */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">صافي الأرباح والخسائر للشركة</span>
            <div
              className={`p-2 rounded-xl ${
                metrics.netCompanyProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                metrics.netCompanyProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {metrics.netCompanyProfit.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">{cur}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>إيرادات: {metrics.totalCompanyRevenues.toLocaleString()}</span>
            <span>مصروفات: {metrics.totalCompanyExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 3: Factory Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">أداء قسم المصنع</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tracking-tight text-blue-700">
              {metrics.factoryNetProfit.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">{cur} (صافي)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>قيمة المخزون: {metrics.factoryInventoryValue.toLocaleString()} {cur}</span>
            <span>عمال: {metrics.factoryEmployeesCount}</span>
          </div>
        </div>

        {/* Card 4: Hotel Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">أداء قسم الفندق</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Hotel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tracking-tight text-purple-700">
              {metrics.hotelNetProfit.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">{cur} (صافي)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>حجوزات نشطة: {metrics.hotelActiveBookingsCount}</span>
            <span>مستحق نزلاء: {metrics.hotelPendingGuestBalances.toLocaleString()} {cur}</span>
          </div>
        </div>
      </div>

      {/* Urgent Booking Expiry and Low Stock Action Alerts */}
      {(metrics.expiringBookings.length > 0 || metrics.lowStockAlerts.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>تنبيهات عاجلة تتطلب اتخاذ إجراء</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Booking Expiry Alerts */}
            {metrics.expiringBookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <span className="font-bold text-sm text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    حجوزات قاربت على الانتهاء أو انتهت ({metrics.expiringBookings.length})
                  </span>
                  <span className="text-xs text-amber-700">فندق Calculus Data</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {metrics.expiringBookings.map(({ booking, daysLeft, isExpired }) => (
                    <div
                      key={booking.id}
                      className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          شقة رقم {booking.apartmentNumber} - العميل: {booking.guestName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            isExpired ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isExpired ? 'انتهت مدة الإقامة اليوم' : `متبقي ${daysLeft} يوم`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                        <span>الهاتف: {booking.countryCode} {booking.phone}</span>
                        <span>تاريخ المغادرة: {booking.endDate}</span>
                        {booking.remainingAmount > 0 && (
                          <span className="font-semibold text-rose-600 font-mono">
                            المتبقي: {booking.remainingAmount.toLocaleString()} {cur}
                          </span>
                        )}
                      </div>

                      {/* Renewal Input Form if active */}
                      {renewBookingId === booking.id ? (
                        <div className="bg-white p-3 rounded-lg border border-indigo-200 space-y-2 mt-2">
                          <p className="font-bold text-indigo-900">تجديد وتمديد فترة الإقامة:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">أيام التمديد</label>
                              <input
                                type="number"
                                min="1"
                                value={renewDays}
                                onChange={(e) => {
                                  const d = Number(e.target.value);
                                  setRenewDays(d);
                                  setRenewAmount(d * booking.dailyRate);
                                }}
                                className="w-full text-xs p-1.5 border border-slate-200 rounded-md font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">المبلغ الإضافي ({cur})</label>
                              <input
                                type="number"
                                min="0"
                                value={renewAmount}
                                onChange={(e) => setRenewAmount(Number(e.target.value))}
                                className="w-full text-xs p-1.5 border border-slate-200 rounded-md font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setRenewBookingId(null)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-700"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewSubmit(booking.id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700"
                            >
                              تأكيد التمديد
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-amber-200/50">
                          {/* WhatsApp Reminder Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const msg = isExpired
                                ? createBookingExpiredNoticeMessage({
                                    guestName: booking.guestName,
                                    apartmentNumber: booking.apartmentNumber,
                                    endDate: booking.endDate,
                                    remainingAmount: booking.remainingAmount,
                                    currency: cur,
                                  })
                                : createBookingExpiringSoonMessage({
                                    guestName: booking.guestName,
                                    apartmentNumber: booking.apartmentNumber,
                                    endDate: booking.endDate,
                                    remainingAmount: booking.remainingAmount,
                                    currency: cur,
                                  });

                              openWhatsAppModal({
                                phone: booking.phone,
                                countryCode: booking.countryCode,
                                recipientName: booking.guestName,
                                message: msg,
                                title: isExpired ? 'إشعار انتهاء الحجز للنزيل' : 'تذكير باقتراب انتهاء الحجز',
                              });
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 font-semibold transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>واتساب للعميل</span>
                          </button>

                          {/* Renew / Extend Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRenewBookingId(booking.id);
                              setRenewDays(1);
                              setRenewAmount(booking.dailyRate);
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            تجديد الحجز
                          </button>

                          {/* Checkout Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من تسجيل خروج العميل ${booking.guestName}؟`)) {
                                checkoutBooking(booking.id, 'available');
                              }
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-colors"
                          >
                            تسجيل خروج
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Alerts */}
            {metrics.lowStockAlerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-orange-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <span className="font-bold text-sm text-orange-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-600" />
                    أصناف المخزون التي قاربت على النفاد ({metrics.lowStockAlerts.length})
                  </span>
                  <span className="text-xs text-orange-700">مخزن المصنع</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {metrics.lowStockAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/80 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.name} <span className="font-mono text-slate-500">({item.code})</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          المورد: {item.supplier || 'غير محدد'} • الحد الأدنى: {item.minAlertQuantity} {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left font-mono">
                          <span className="font-bold text-rose-600 text-sm">{item.quantity}</span>
                          <span className="text-[11px] text-slate-500 mr-1">{item.unit}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection('factory')}
                          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
                        >
                          توريد
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operational Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotel Apartments Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-600" />
              <span>حالة الشقق الفندقية ({metrics.hotelApartmentsCount} إجمالي)</span>
            </h3>
            <button
              onClick={() => setActiveSection('hotel')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              عرض الشقق
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-800">متاحة للحجز</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {metrics.hotelAvailableCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-xs font-semibold text-purple-800">مشغولة حالياً</span>
              <p className="text-2xl font-black font-mono text-purple-700 mt-1">
                {metrics.hotelOccupiedCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-xs font-semibold text-blue-800">محجوزة مسبقاً</span>
              <p className="text-2xl font-black font-mono text-blue-700 mt-1">
                {metrics.hotelReservedCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-xs font-semibold text-amber-800">تحت الصيانة</span>
              <p className="text-2xl font-black font-mono text-amber-700 mt-1">
                {metrics.hotelMaintenanceCount}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>الحجوزات النشطة: {metrics.hotelActiveBookingsCount}</span>
            <span className="font-mono font-semibold text-slate-800">
              المبالغ المستحقة: {metrics.hotelPendingGuestBalances.toLocaleString()} {cur}
            </span>
          </div>
        </div>

        {/* Factory Inventory Valuation & Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>مخزون وممتلكات المصنع</span>
            </h3>
            <button
              onClick={() => setActiveSection('factory')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              عرض المخزون
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-xs font-medium text-slate-500">إجمالي القيمة المقدرة للمخزون</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-slate-900">
                {metrics.factoryInventoryValue.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">{cur}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span>عمال وفنيو المصنع النشطين</span>
              <span className="font-bold font-mono text-slate-800">{metrics.factoryEmployeesCount} موظف</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span>التزام الرواتب الشهري للمصنع</span>
              <span className="font-bold font-mono text-slate-800">
                {metrics.factorySalariesCommitment.toLocaleString()} {cur}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span>أصناف وصلت للحد الأدنى</span>
              <span className="font-bold font-mono text-orange-600">
                {metrics.factoryLowStockItems.length} صنف
              </span>
            </div>
          </div>
        </div>

        {/* Financial Flow & Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>توزيع الإيرادات والمصروفات</span>
            </h3>
            <button
              onClick={() => setActiveSection('finance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              كشف الحسابات
            </button>
          </div>

          {/* Clean Visual Progress / Ratio Bar */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">إيرادات المصنع</span>
                <span className="font-mono text-blue-700">{metrics.factoryRevenues.toLocaleString()} {cur}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics.totalCompanyRevenues > 0
                        ? Math.min(100, Math.round((metrics.factoryRevenues / metrics.totalCompanyRevenues) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">إيرادات الفندق</span>
                <span className="font-mono text-purple-700">{metrics.hotelRevenues.toLocaleString()} {cur}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics.totalCompanyRevenues > 0
                        ? Math.min(100, Math.round((metrics.hotelRevenues / metrics.totalCompanyRevenues) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">إجمالي المصروفات</span>
                <span className="font-mono text-rose-700">{metrics.totalCompanyExpenses.toLocaleString()} {cur}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{
                    width: `${
                      metrics.totalCompanyRevenues > 0
                        ? Math.min(100, Math.round((metrics.totalCompanyExpenses / metrics.totalCompanyRevenues) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
            <span className="font-medium">رصيد أرباح النشاط الكلي:</span>
            <span className="font-bold font-mono text-indigo-700">
              {metrics.netCompanyProfit.toLocaleString()} {cur}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
