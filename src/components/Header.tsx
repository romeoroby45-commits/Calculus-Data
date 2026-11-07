import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Search,
  Bell,
  HardDrive,
  UserCheck,
  Menu,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onOpenSearch }) => {
  const { metrics, currentUser, setCurrentUser, users, setActiveSection } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalAlerts = metrics.expiringBookings.length + metrics.lowStockAlerts.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Right side (RTL Start): Mobile Hamburger + Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="القائمة الرئيسية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                  Calculus Data
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  مخزن محلياً
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                نظام إدارة المصنع والفندق المتكامل
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Search Bar trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm transition-colors cursor-pointer text-right"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>بحث سريع في الموظفين، الشقق، المخزون، الحجوزات...</span>
            </div>
            <kbd className="hidden lg:inline-block bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[11px] font-mono text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Left side (RTL End): Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
            title="بحث"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="التنبيهات والإشعارات"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">
                    التنبيهات والإشعارات ({totalAlerts})
                  </span>
                  <span className="text-xs text-slate-400">تحديث فوري</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 p-2">
                  {totalAlerts === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      لا توجد أي تنبيهات حالية، كافة العمليات مستقرة!
                    </div>
                  ) : (
                    <>
                      {/* Expiring Bookings */}
                      {metrics.expiringBookings.map(({ booking, daysLeft, isExpired }) => (
                        <div
                          key={`alert_bk_${booking.id}`}
                          className={`p-2.5 rounded-xl text-xs mb-1 ${
                            isExpired ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {isExpired ? 'انتهت مدة الحجز' : `ينتهي الحجز خلال ${daysLeft} يوم`}
                            </span>
                            <span className="font-mono">شقة {booking.apartmentNumber}</span>
                          </div>
                          <p className="mt-1 text-slate-600">
                            العميل: <span className="font-medium text-slate-800">{booking.guestName}</span>
                            {booking.remainingAmount > 0 && (
                              <span className="mr-2 text-rose-600 font-medium">
                                (متبقي: {booking.remainingAmount.toLocaleString()} ج.م)
                              </span>
                            )}
                          </p>
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => {
                                setActiveSection('hotel');
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>إدارة الحجز والتجديد</span>
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Low Stock Alerts */}
                      {metrics.lowStockAlerts.map((item) => (
                        <div
                          key={`alert_inv_${item.id}`}
                          className="p-2.5 rounded-xl text-xs bg-orange-50 text-orange-900 mb-1"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                              نقص في رصيد المخزون
                            </span>
                            <span className="font-mono text-orange-700">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">
                            الصنف: <span className="font-medium text-slate-800">{item.name}</span> (كود: {item.code})
                          </p>
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => {
                                setActiveSection('factory');
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>طلب توريد بالمصنع</span>
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-right"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {currentUser.name.slice(0, 1)}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {currentUser.role === 'admin' && 'المدير العام'}
                  {currentUser.role === 'accountant' && 'المحاسب'}
                  {currentUser.role === 'receptionist' && 'موظف الاستقبال'}
                  {currentUser.role === 'factory_manager' && 'مسؤول المصنع'}
                  {currentUser.role === 'hotel_manager' && 'مسؤول الفندق'}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">تبديل المستخدم الحالي</p>
                  <p className="text-[11px] text-slate-500">اختر الحساب المناسب للصلاحيات</p>
                </div>
                <div className="p-1 space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-right ${
                        u.id === currentUser.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <div>
                          <p>{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {u.role === 'admin' && 'كامل الصلاحيات'}
                            {u.role === 'accountant' && 'الحسابات والتقارير'}
                            {u.role === 'receptionist' && 'الفندق والحجوزات'}
                            {u.role === 'factory_manager' && 'المصنع والمخزون'}
                            {u.role === 'hotel_manager' && 'الفندق والشقق'}
                          </p>
                        </div>
                      </div>
                      {u.id === currentUser.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
                <div className="mt-1 pt-2 border-t border-slate-100 px-3">
                  <button
                    onClick={() => {
                      setActiveSection('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1"
                  >
                    إدارة المستخدمين والصلاحيات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
