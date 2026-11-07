import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Search, X, Users, Package, Home, Calendar, DollarSign, ArrowLeft } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    employees,
    inventoryItems,
    apartments,
    bookings,
    financialTransactions,
    setActiveSection,
  } = useData();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      icon: any;
      section: string;
      badgeColor: string;
    }> = [];

    // Search Employees
    employees.forEach((emp) => {
      if (
        emp.name.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.phone.includes(q) ||
        (emp.nationalId && emp.nationalId.includes(q))
      ) {
        items.push({
          id: `emp_${emp.id}`,
          title: emp.name,
          subtitle: `${emp.jobTitle} • ${emp.branch === 'factory' ? 'المصنع' : 'الفندق'} • ${emp.countryCode}${emp.phone}`,
          category: 'الموظفين',
          icon: Users,
          section: emp.branch === 'factory' ? 'factory' : 'hotel',
          badgeColor: 'bg-blue-50 text-blue-700',
        });
      }
    });

    // Search Inventory
    inventoryItems.forEach((inv) => {
      if (
        inv.name.toLowerCase().includes(q) ||
        inv.code.toLowerCase().includes(q) ||
        inv.supplier.toLowerCase().includes(q)
      ) {
        items.push({
          id: `inv_${inv.id}`,
          title: inv.name,
          subtitle: `كود: ${inv.code} • الكمية: ${inv.quantity} ${inv.unit} • القيمة: ${inv.totalValue.toLocaleString()} ج.م`,
          category: 'المخزون والمعدات',
          icon: Package,
          section: 'factory',
          badgeColor: 'bg-amber-50 text-amber-700',
        });
      }
    });

    // Search Apartments
    apartments.forEach((apt) => {
      if (
        apt.apartmentNumber.toLowerCase().includes(q) ||
        apt.nameOrType.toLowerCase().includes(q)
      ) {
        items.push({
          id: `apt_${apt.id}`,
          title: `شقة رقم ${apt.apartmentNumber} (${apt.nameOrType})`,
          subtitle: `الإيجار: ${apt.dailyRentPrice} ج.م/يوم • الحالة: ${apt.status} • السعة: ${apt.maxGuests} أفراد`,
          category: 'الشقق الفندقية',
          icon: Home,
          section: 'hotel',
          badgeColor: 'bg-emerald-50 text-emerald-700',
        });
      }
    });

    // Search Bookings & Guests
    bookings.forEach((bk) => {
      if (
        bk.guestName.toLowerCase().includes(q) ||
        bk.phone.includes(q) ||
        bk.apartmentNumber.includes(q) ||
        (bk.nationalId && bk.nationalId.includes(q))
      ) {
        items.push({
          id: `bk_${bk.id}`,
          title: `حجز العميل: ${bk.guestName}`,
          subtitle: `شقة رقم ${bk.apartmentNumber} • ${bk.startDate} إلى ${bk.endDate} • المتبقي: ${bk.remainingAmount.toLocaleString()} ج.م`,
          category: 'الحجوزات والنزلاء',
          icon: Calendar,
          section: 'hotel',
          badgeColor: 'bg-purple-50 text-purple-700',
        });
      }
    });

    // Search Finance
    financialTransactions.forEach((tx) => {
      if (
        tx.reason.toLowerCase().includes(q) ||
        tx.authorizedBy.toLowerCase().includes(q)
      ) {
        items.push({
          id: `tx_${tx.id}`,
          title: tx.reason,
          subtitle: `المبلغ: ${tx.amount.toLocaleString()} ج.م • التاريخ: ${tx.date} • المسؤول: ${tx.authorizedBy}`,
          category: 'الحسابات المالية',
          icon: DollarSign,
          section: 'finance',
          badgeColor: 'bg-rose-50 text-rose-700',
        });
      }
    });

    return items.slice(0, 15);
  }, [query, employees, inventoryItems, apartments, bookings, financialTransactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن موظف، شقة، نزيل، صنف مخزون، كود، أو حركة مالية..."
            className="w-full text-base bg-transparent border-0 focus:outline-hidden focus:ring-0 text-slate-800 placeholder-slate-400"
            dir="rtl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              اكتب كلمة البحث للوصول الفوري إلى أي سجل بالنظام
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              لم يتم العثور على أي نتائج مطابقة لـ "{query}"
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.section);
                    onClose();
                  }}
                  className="w-full text-right p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">
                          {item.title}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${item.badgeColor}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors group-hover:-translate-x-1" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
