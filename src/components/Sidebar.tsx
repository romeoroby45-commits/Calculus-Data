import React from 'react';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Factory,
  Hotel,
  DollarSign,
  FileText,
  Settings,
  X,
  HardDriveDownload,
  AlertCircle,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeSection, setActiveSection, metrics } = useData();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      description: 'نظرة عامة ومؤشرات الأداء',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'factory',
      label: 'إدارة المصنع',
      description: 'الموظفين، الرواتب، والمخزون',
      icon: Factory,
      badge: metrics.factoryLowStockItems.length > 0 ? `${metrics.factoryLowStockItems.length} نواقص` : null,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'hotel',
      label: 'إدارة الفندق',
      description: 'الشقق، الحجوزات، والنزلاء',
      icon: Hotel,
      badge: metrics.expiringBookings.length > 0 ? `${metrics.expiringBookings.length} تنبيه` : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'finance',
      label: 'الحسابات المالية',
      description: 'رأس المال، الإيرادات والمصروفات',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'reports',
      label: 'التقارير والطباعة',
      description: 'تقارير تفصيلية وتصدير Excel',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings',
      label: 'الإعدادات والنسخ',
      description: 'النسخ الاحتياطي والصلاحيات',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-68 bg-white border-l border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static no-print ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800 text-base">القائمة الرئيسية</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-right group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`block font-bold text-sm leading-tight ${
                        isActive ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 leading-tight ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-indigo-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Local Storage & Backup Quick Card */}
        <div className="p-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <HardDriveDownload className="w-4 h-4 text-emerald-600" />
              <span>قاعدة بيانات محلية</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
              بياناتك تحفظ على هذا المتصفح فقط عبر IndexedDB. احرص على أخذ نسخة احتياطية دورياً.
            </p>
            <button
              onClick={() => handleSelect('settings')}
              className="w-full text-center text-xs font-semibold py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              نسخ احتياطي للبيانات
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
