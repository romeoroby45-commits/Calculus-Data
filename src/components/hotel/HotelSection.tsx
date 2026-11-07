import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Apartment,
  ApartmentStatus,
  ApartmentItem,
  ApartmentItemCategory,
  Booking,
  Employee,
} from '../../types';
import {
  Hotel,
  Home,
  Calendar,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  LogOut,
  Tv,
  UtensilsCrossed,
  Armchair,
  Sparkles,
  Layers,
  ArrowRight,
  Send,
} from 'lucide-react';
import { CountrySelect } from '../common/CountrySelect';
import { DEFAULT_COUNTRY } from '../../utils/whatsapp';
import {
  createBookingConfirmationMessage,
  createBookingExpiringSoonMessage,
  createBookingExpiredNoticeMessage,
  createBookingRenewalMessage,
  createDeductionMessage,
  createBonusMessage,
} from '../../utils/whatsapp';

const APARTMENT_STATUSES: { id: ApartmentStatus; label: string; color: string }[] = [
  { id: 'available', label: 'متاحة', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'occupied', label: 'مشغولة', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'reserved', label: 'محجوزة', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'maintenance', label: 'تحتاج إلى صيانة', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'unavailable', label: 'غير متاحة', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const ITEM_CATEGORIES: { id: ApartmentItemCategory; label: string; icon: any }[] = [
  { id: 'electrical', label: 'الأجهزة الكهربائية', icon: Tv },
  { id: 'kitchen', label: 'أدوات المطبخ', icon: UtensilsCrossed },
  { id: 'furniture', label: 'الأثاث', icon: Armchair },
  { id: 'bedding', label: 'المفروشات', icon: Layers },
  { id: 'decor', label: 'الديكورات', icon: Sparkles },
  { id: 'other', label: 'محتويات أخرى', icon: Layers },
];

export const HotelSection: React.FC = () => {
  const {
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
    employees,
    saveEmployee,
    deleteEmployee,
    deductionLogs,
    addDeductionOrBonus,
    openWhatsAppModal,
    currentUser,
    settings,
  } = useData();

  const cur = settings.currency || 'ج.م';
  const [activeTab, setActiveTab] = useState<'apartments' | 'contents' | 'bookings' | 'employees'>('apartments');

  // Search States
  const [aptSearch, setAptSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedAptForContents, setSelectedAptForContents] = useState<Apartment | null>(null);

  // Modals
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApartmentItem | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [targetBookingForRenew, setTargetBookingForRenew] = useState<Booking | null>(null);
  const [renewDays, setRenewDays] = useState(1);
  const [renewAmount, setRenewAmount] = useState(0);

  // Hotel Employees
  const hotelEmployees = useMemo(() => {
    return employees.filter((e) => e.branch === 'hotel');
  }, [employees]);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Apartment Form State (Notice: apartmentNumber is strictly the first field as requested!)
  const [aptForm, setAptForm] = useState<Partial<Apartment>>({
    apartmentNumber: '',
    nameOrType: '',
    dailyRentPrice: 0,
    maxGuests: 2,
    status: 'available',
    description: '',
    notes: '',
  });

  const openAddApartment = () => {
    setEditingApt(null);
    setAptForm({
      apartmentNumber: '',
      nameOrType: '',
      dailyRentPrice: 0,
      maxGuests: 2,
      status: 'available',
      description: '',
      notes: '',
    });
    setIsAptModalOpen(true);
  };

  const openEditApartment = (apt: Apartment) => {
    setEditingApt(apt);
    setAptForm(apt);
    setIsAptModalOpen(true);
  };

  const handleSaveApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptForm.apartmentNumber || !aptForm.nameOrType) return;

    const apt: Apartment = {
      id: editingApt ? editingApt.id : `apt_${Date.now()}`,
      apartmentNumber: aptForm.apartmentNumber,
      nameOrType: aptForm.nameOrType,
      dailyRentPrice: Number(aptForm.dailyRentPrice) || 0,
      maxGuests: Number(aptForm.maxGuests) || 1,
      status: (aptForm.status as ApartmentStatus) || 'available',
      photos: editingApt ? editingApt.photos : [],
      description: aptForm.description || '',
      notes: aptForm.notes || '',
      createdAt: editingApt ? editingApt.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveApartment(apt);
    setIsAptModalOpen(false);
  };

  // Apartment Contents State
  const currentApartmentItems = useMemo(() => {
    if (!selectedAptForContents) return [];
    return apartmentItems.filter((i) => i.apartmentId === selectedAptForContents.id);
  }, [apartmentItems, selectedAptForContents]);

  const [itemForm, setItemForm] = useState<Partial<ApartmentItem>>({
    category: 'electrical',
    name: '',
    quantity: 1,
    price: 0,
    condition: 'ممتاز',
    notes: '',
  });

  const openAddItemToApt = () => {
    setEditingItem(null);
    setItemForm({
      category: 'electrical',
      name: '',
      quantity: 1,
      price: 0,
      condition: 'ممتاز',
      notes: '',
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItemToApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForContents || !itemForm.name) return;

    const item: ApartmentItem = {
      id: editingItem ? editingItem.id : `apt_item_${Date.now()}`,
      apartmentId: selectedAptForContents.id,
      apartmentNumber: selectedAptForContents.apartmentNumber,
      category: (itemForm.category as ApartmentItemCategory) || 'electrical',
      name: itemForm.name,
      quantity: Number(itemForm.quantity) || 1,
      price: Number(itemForm.price) || 0,
      condition: itemForm.condition || 'ممتاز',
      dateAdded: new Date().toISOString().slice(0, 10),
      notes: itemForm.notes || '',
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    await saveApartmentItem(item);
    setIsItemModalOpen(false);
  };

  // Booking Form State with Automatic Calculations
  const [bookingForm, setBookingForm] = useState<{
    apartmentId: string;
    guestName: string;
    countryCode: string;
    countryFlag: string;
    phone: string;
    nationalId: string;
    dailyRate: number;
    startDate: string;
    endDate: string;
    durationDays: number;
    totalAmount: number;
    paidAmount: number;
    guestCount: number;
    notes: string;
  }>({
    apartmentId: '',
    guestName: '',
    countryCode: DEFAULT_COUNTRY.dialCode,
    countryFlag: DEFAULT_COUNTRY.flag,
    phone: '',
    nationalId: '',
    dailyRate: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    durationDays: 2,
    totalAmount: 0,
    paidAmount: 0,
    guestCount: 1,
    notes: '',
  });

  // Calculate days difference
  const computeDurationDays = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return 1;
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  };

  const openNewBooking = (preselectedApt?: Apartment) => {
    const apt = preselectedApt || apartments.find((a) => a.status === 'available') || apartments[0];
    const sDate = new Date().toISOString().slice(0, 10);
    const eDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const days = 1;
    const rate = apt ? apt.dailyRentPrice : 0;
    const total = days * rate;

    setEditingBooking(null);
    setBookingForm({
      apartmentId: apt ? apt.id : '',
      guestName: '',
      countryCode: DEFAULT_COUNTRY.dialCode,
      countryFlag: DEFAULT_COUNTRY.flag,
      phone: '',
      nationalId: '',
      dailyRate: rate,
      startDate: sDate,
      endDate: eDate,
      durationDays: days,
      totalAmount: total,
      paidAmount: total, // Default paid full or deposit
      guestCount: 1,
      notes: '',
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apt = apartments.find((a) => a.id === bookingForm.apartmentId);
    if (!apt || !bookingForm.guestName || !bookingForm.phone) return;

    const remainingAmount = Math.max(0, bookingForm.totalAmount - bookingForm.paidAmount);

    const booking: Booking = {
      id: editingBooking ? editingBooking.id : `bk_${Date.now()}`,
      apartmentId: apt.id,
      apartmentNumber: apt.apartmentNumber,
      guestName: bookingForm.guestName,
      countryCode: bookingForm.countryCode,
      countryFlag: bookingForm.countryFlag,
      phone: bookingForm.phone,
      nationalId: bookingForm.nationalId,
      dailyRate: Number(bookingForm.dailyRate),
      durationDays: Number(bookingForm.durationDays),
      startDate: bookingForm.startDate,
      endDate: bookingForm.endDate,
      totalAmount: Number(bookingForm.totalAmount),
      paidAmount: Number(bookingForm.paidAmount),
      remainingAmount,
      guestCount: Number(bookingForm.guestCount),
      status: 'active',
      notes: bookingForm.notes,
      createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingBooking) {
      await updateBooking(booking);
    } else {
      await createBooking(booking);
    }

    setIsBookingModalOpen(false);

    // Prompt WhatsApp Confirmation Modal with editable message
    const confirmMsg = createBookingConfirmationMessage({
      guestName: booking.guestName,
      apartmentNumber: booking.apartmentNumber,
      startDate: booking.startDate,
      endDate: booking.endDate,
      durationDays: booking.durationDays,
      totalAmount: booking.totalAmount,
      paidAmount: booking.paidAmount,
      remainingAmount: booking.remainingAmount,
      currency: cur,
    });

    openWhatsAppModal({
      phone: booking.phone,
      countryCode: booking.countryCode,
      recipientName: booking.guestName,
      message: confirmMsg,
      title: 'إرسال تأكيد الحجز للعميل عبر واتساب',
    });
  };

  // Renewal Submit
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookingForRenew || renewDays <= 0) return;

    await extendBooking({
      bookingId: targetBookingForRenew.id,
      addedDays: Number(renewDays),
      additionalAmount: Number(renewAmount),
    });

    // Compute new end date for WhatsApp message
    const curEnd = new Date(targetBookingForRenew.endDate);
    curEnd.setDate(curEnd.getDate() + Number(renewDays));
    const newEndStr = curEnd.toISOString().slice(0, 10);

    setIsRenewModalOpen(false);

    const msg = createBookingRenewalMessage({
      guestName: targetBookingForRenew.guestName,
      apartmentNumber: targetBookingForRenew.apartmentNumber,
      addedDays: Number(renewDays),
      newEndDate: newEndStr,
      additionalAmount: Number(renewAmount),
      remainingAmount: targetBookingForRenew.remainingAmount + Number(renewAmount),
      currency: cur,
    });

    openWhatsAppModal({
      phone: targetBookingForRenew.phone,
      countryCode: targetBookingForRenew.countryCode,
      recipientName: targetBookingForRenew.guestName,
      message: msg,
      title: 'إرسال تأكيد تجديد الحجز عبر واتساب',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Hotel className="w-6 h-6 text-purple-600" />
            <span>إدارة قسم الفندق</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الشقق ومحتوياتها الكاملة، نظام حجز الشقق والنزلاء، متابعة انتهاء وتجديد الإقامة، ومراسلات واتساب.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('apartments')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'apartments'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الشقق ({apartments.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('contents');
              if (!selectedAptForContents && apartments.length > 0) {
                setSelectedAptForContents(apartments[0]);
              }
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'contents'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            محتويات الشقق
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bookings'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الحجوزات والنزلاء ({bookings.filter((b) => b.status === 'active' || b.status === 'extended').length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'employees'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            موظفو الفندق ({hotelEmployees.length})
          </button>
        </div>
      </div>

      {/* TAB 1: APARTMENTS */}
      {activeTab === 'apartments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={aptSearch}
                onChange={(e) => setAptSearch(e.target.value)}
                placeholder="ابحث برقم الشقة أو النوع..."
                className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openNewBooking()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل حجز جديد</span>
              </button>
              <button
                onClick={openAddApartment}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة شقة فندقية</span>
              </button>
            </div>
          </div>

          {/* Apartments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                لا توجد شقق مسجلة بعد. اضغط "إضافة شقة فندقية" لتسجيل الشقة الأولى.
              </div>
            ) : (
              apartments
                .filter(
                  (a) =>
                    a.apartmentNumber.includes(aptSearch) ||
                    a.nameOrType.toLowerCase().includes(aptSearch.toLowerCase())
                )
                .map((apt) => {
                  const statusInfo =
                    APARTMENT_STATUSES.find((s) => s.id === apt.status) || APARTMENT_STATUSES[0];

                  const itemsCount = apartmentItems.filter((i) => i.apartmentId === apt.id).length;
                  const currentActiveBooking = bookings.find(
                    (b) =>
                      (b.status === 'active' || b.status === 'extended') &&
                      (b.apartmentId === apt.id || b.apartmentNumber === apt.apartmentNumber)
                  );

                  return (
                    <div
                      key={apt.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Apt Number & Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black font-mono text-slate-900">
                              #{apt.apartmentNumber}
                            </span>
                            <span className="font-bold text-sm text-slate-700">{apt.nameOrType}</span>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-bold border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Price & Capacity */}
                        <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl">
                          <div>
                            <span className="text-slate-500">سعر الإيجار اليومي: </span>
                            <span className="font-mono font-bold text-slate-900">
                              {apt.dailyRentPrice.toLocaleString()} {cur}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            <span>السعة: </span>
                            <span className="font-bold">{apt.maxGuests} أفراد</span>
                          </div>
                        </div>

                        {/* Active guest info if occupied */}
                        {currentActiveBooking && (
                          <div className="mt-3 p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between font-bold text-purple-900">
                              <span>النزيل الحالي: {currentActiveBooking.guestName}</span>
                              <span className="font-mono">
                                مغادرة: {currentActiveBooking.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-[11px]">
                              <span>هاتف: {currentActiveBooking.countryCode} {currentActiveBooking.phone}</span>
                              {currentActiveBooking.remainingAmount > 0 && (
                                <span className="text-rose-600 font-semibold font-mono">
                                  متبقي: {currentActiveBooking.remainingAmount.toLocaleString()} {cur}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {apt.description && (
                          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2">
                            {apt.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAptForContents(apt);
                            setActiveTab('contents');
                          }}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <span>المحتويات ({itemsCount})</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>

                        <div className="flex items-center gap-1">
                          {apt.status === 'available' && (
                            <button
                              type="button"
                              onClick={() => openNewBooking(apt)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-semibold transition-colors"
                            >
                              حجز
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditApartment(apt)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-md transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الشقة رقم ${apt.apartmentNumber}؟`)) {
                                deleteApartment(apt.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APARTMENT CONTENTS (محتويات كل شقة مستقلة) */}
      {activeTab === 'contents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">اختر الشقة لعرض محتوياتها:</span>
              <select
                value={selectedAptForContents?.id || ''}
                onChange={(e) => {
                  const apt = apartments.find((a) => a.id === e.target.value);
                  if (apt) setSelectedAptForContents(apt);
                }}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    شقة #{a.apartmentNumber} ({a.nameOrType})
                  </option>
                ))}
              </select>
            </div>

            {selectedAptForContents && (
              <button
                onClick={openAddItemToApt}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عنصر جديد للشقة #{selectedAptForContents.apartmentNumber}</span>
              </button>
            )}
          </div>

          {selectedAptForContents ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    سجل ممتلكات وأثاث الشقة #{selectedAptForContents.apartmentNumber}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    إجمالي العناصر: {currentApartmentItems.length} عنصر
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-700">
                  القيمة التقديرية للأثاث:{' '}
                  <span className="font-mono text-purple-700">
                    {currentApartmentItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} {cur}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">اسم العنصر</th>
                      <th className="py-3 px-4">التصنيف</th>
                      <th className="py-3 px-4">العدد</th>
                      <th className="py-3 px-4">السعر التقديري</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">تاريخ الإضافة</th>
                      <th className="py-3 px-4">ملاحظات</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentApartmentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          لا توجد ممتلكات مسجلة لهذه الشقة بعد. اضغط "إضافة عنصر جديد" لتسجيل الأجهزة والأثاث.
                        </td>
                      </tr>
                    ) : (
                      currentApartmentItems.map((item) => {
                        const cat = ITEM_CATEGORIES.find((c) => c.id === item.category) || ITEM_CATEGORIES[0];
                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                            <td className="py-3 px-4 text-slate-600">{cat.label}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.quantity}</td>
                            <td className="py-3 px-4 font-mono text-slate-700">
                              {item.price > 0 ? `${item.price.toLocaleString()} ${cur}` : '—'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                {item.condition}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">{item.dateAdded}</td>
                            <td className="py-3 px-4 text-slate-500">{item.notes || '—'}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف ${item.name}؟`)) {
                                    deleteApartmentItem(item.id);
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
          ) : (
            <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              يرجى إضافة شقق أولاً لتتمكن من إدارة محتوياتها.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS & GUESTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="ابحث بالنزيل، رقم الشقة، أو الهاتف..."
                className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => openNewBooking()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل حجز جديد</span>
            </button>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">رقم الشقة</th>
                    <th className="py-3 px-4">اسم النزيل</th>
                    <th className="py-3 px-4">رقم الهاتف</th>
                    <th className="py-3 px-4">فترة الإقامة</th>
                    <th className="py-3 px-4">المدة</th>
                    <th className="py-3 px-4">إجمالي المبلغ</th>
                    <th className="py-3 px-4">المدفوع / العربون</th>
                    <th className="py-3 px-4">المتبقي</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">واتساب</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        لا توجد حجوزات مسجلة بعد. اضغط "تسجيل حجز جديد" لبدء الحجز.
                      </td>
                    </tr>
                  ) : (
                    bookings
                      .filter(
                        (b) =>
                          b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.apartmentNumber.includes(bookingSearch) ||
                          b.phone.includes(bookingSearch)
                      )
                      .map((bk) => {
                        const isOverdue =
                          (bk.status === 'active' || bk.status === 'extended') &&
                          new Date(bk.endDate).getTime() <= new Date().getTime();

                        return (
                          <tr key={bk.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              #{bk.apartmentNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{bk.guestName}</div>
                              {bk.nationalId && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  بطاقة: {bk.nationalId}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-800" dir="ltr">
                              <span className="mr-1">{bk.countryFlag}</span>
                              <span>{bk.countryCode} {bk.phone}</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              <div>من: {bk.startDate}</div>
                              <div>إلى: {bk.endDate}</div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {bk.durationDays} يوم
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-900 font-bold">
                              {bk.totalAmount.toLocaleString()} {cur}
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                              {bk.paidAmount.toLocaleString()} {cur}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {bk.remainingAmount > 0 ? (
                                <span className="text-rose-600">
                                  {bk.remainingAmount.toLocaleString()} {cur}
                                </span>
                              ) : (
                                <span className="text-emerald-700">مسدد بالكامل</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                  bk.status === 'active'
                                    ? isOverdue
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-50 text-emerald-700'
                                    : bk.status === 'extended'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : bk.status === 'completed'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-rose-50 text-rose-600'
                                }`}
                              >
                                {bk.status === 'active' && (isOverdue ? 'انتهى الحجز اليوم' : 'نشط')}
                                {bk.status === 'extended' && 'ممدد'}
                                {bk.status === 'completed' && 'مكتمل (خروج)'}
                                {bk.status === 'cancelled' && 'ملغي'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {/* WhatsApp Quick Menu */}
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmMsg = createBookingConfirmationMessage({
                                    guestName: bk.guestName,
                                    apartmentNumber: bk.apartmentNumber,
                                    startDate: bk.startDate,
                                    endDate: bk.endDate,
                                    durationDays: bk.durationDays,
                                    totalAmount: bk.totalAmount,
                                    paidAmount: bk.paidAmount,
                                    remainingAmount: bk.remainingAmount,
                                    currency: cur,
                                  });

                                  openWhatsAppModal({
                                    phone: bk.phone,
                                    countryCode: bk.countryCode,
                                    recipientName: bk.guestName,
                                    message: confirmMsg,
                                    title: `إشعار واتساب للنزيل: ${bk.guestName}`,
                                  });
                                }}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
                                title="مراسلة النزيل عبر واتساب"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {(bk.status === 'active' || bk.status === 'extended') && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTargetBookingForRenew(bk);
                                        setRenewDays(1);
                                        setRenewAmount(bk.dailyRate);
                                        setIsRenewModalOpen(true);
                                      }}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px] transition-colors"
                                      title="تجديد وتمديد الحجز"
                                    >
                                      تجديد
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`هل أنت متأكد من تسجيل خروج العميل ${bk.guestName} للشقة ${bk.apartmentNumber}؟`)) {
                                          checkoutBooking(bk.id, 'available');
                                        }
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors"
                                      title="تسجيل خروج"
                                    >
                                      خروج
                                    </button>
                                  </>
                                )}
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

      {/* TAB 4: HOTEL EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-800">
              قائمة موظفي قسم الفندق (مفصولين في الحسابات عن المصنع)
            </h3>
            <button
              onClick={() => {
                setEditingEmp(null);
                setAptForm({});
                setIsEmpModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف للفندق</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">الوظيفة</th>
                    <th className="py-3 px-4">رقم الهاتف</th>
                    <th className="py-3 px-4">الراتب الأساسي</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">واتساب</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotelEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        لا يوجد موظفون مسجلون بالفندق حالياً. اضغط "إضافة موظف للفندق" للبدء.
                      </td>
                    </tr>
                  ) : (
                    hotelEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.jobTitle}</td>
                        <td className="py-3 px-4 font-mono text-slate-800" dir="ltr">
                          <span className="mr-1">{emp.countryFlag}</span>
                          <span>{emp.countryCode} {emp.phone}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {emp.monthlySalary.toLocaleString()} {cur}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                              emp.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              openWhatsAppModal({
                                phone: emp.phone,
                                countryCode: emp.countryCode,
                                recipientName: emp.name,
                                message: `مرحباً أستاذ/ة ${emp.name}، تواصل مباشر من إدارة فندق Calculus Data.`,
                                title: `مراسلة موظف الفندق: ${emp.name}`,
                              });
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف ${emp.name}؟`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: ADD / EDIT APARTMENT (First field is apartmentNumber!) */}
      {isAptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              {editingApt ? 'تعديل بيانات الشقة الفندقية' : 'إضافة شقة فندقية جديدة'}
            </div>
            <form onSubmit={handleSaveApartment} className="p-5 space-y-3.5 text-xs">
              {/* Note: First field is strictly Apartment Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  رقم الشقة * (الحقل الأول)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={aptForm.apartmentNumber || ''}
                  onChange={(e) => setAptForm({ ...aptForm, apartmentNumber: e.target.value })}
                  placeholder="مثال: 101، 202، 305..."
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم أو نوع الشقة *</label>
                <input
                  type="text"
                  required
                  value={aptForm.nameOrType || ''}
                  onChange={(e) => setAptForm({ ...aptForm, nameOrType: e.target.value })}
                  placeholder="مثال: جناح ملكي، غرفة وصالة ديلوكس، استوديو تنفيذي..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سعر الإيجار اليومي ({cur}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={aptForm.dailyRentPrice ?? ''}
                    onChange={(e) => setAptForm({ ...aptForm, dailyRentPrice: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">عدد الأشخاص المسموح لهم *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={aptForm.maxGuests ?? 2}
                    onChange={(e) => setAptForm({ ...aptForm, maxGuests: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">حالة الشقة</label>
                <select
                  value={aptForm.status || 'available'}
                  onChange={(e) => setAptForm({ ...aptForm, status: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                >
                  {APARTMENT_STATUSES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">وصف الشقة</label>
                <textarea
                  rows={2}
                  value={aptForm.description || ''}
                  onChange={(e) => setAptForm({ ...aptForm, description: e.target.value })}
                  placeholder="الموقع، الإطلالة، عدد الغرف والحمامات..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={aptForm.notes || ''}
                  onChange={(e) => setAptForm({ ...aptForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAptModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ الشقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ITEM TO APARTMENT */}
      {isItemModalOpen && selectedAptForContents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              إضافة عنصر جديد للشقة #{selectedAptForContents.apartmentNumber}
            </div>
            <form onSubmit={handleSaveItemToApt} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">التصنيف *</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم العنصر *</label>
                <input
                  type="text"
                  required
                  value={itemForm.name || ''}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="مثال: شاشة سامسونج 55 بوصة، سرير كينج، ثلاجة..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">العدد *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.quantity ?? 1}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السعر التقديري ({cur})</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.price ?? ''}
                    onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الحالة</label>
                <select
                  value={itemForm.condition || 'ممتاز'}
                  onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد جداً">جيد جداً</option>
                  <option value="جيد">جيد</option>
                  <option value="يحتاج صيانة">يحتاج صيانة</option>
                  <option value="تالف">تالف</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ العنصر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOKING FORM (Auto calculates days and remaining balance) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              تسجيل حجز شقة فندقية جديدة
            </div>
            <form onSubmit={handleBookingSubmit} className="p-5 space-y-3.5 text-xs max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">الشقة المراد حجزها *</label>
                <select
                  required
                  value={bookingForm.apartmentId}
                  onChange={(e) => {
                    const found = apartments.find((a) => a.id === e.target.value);
                    if (found) {
                      const days = bookingForm.durationDays || 1;
                      setBookingForm({
                        ...bookingForm,
                        apartmentId: found.id,
                        dailyRate: found.dailyRentPrice,
                        totalAmount: days * found.dailyRentPrice,
                      });
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="">اختر الشقة...</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      شقة #{a.apartmentNumber} ({a.nameOrType}) - {a.dailyRentPrice} {cur}/يوم [{a.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم العميل (النزيل) *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                  placeholder="الاسم الثلاثي أو الرباعي للعميل"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدولة ومفتاح الاتصال *</label>
                  <CountrySelect
                    selectedDialCode={bookingForm.countryCode}
                    onSelect={(country) =>
                      setBookingForm({
                        ...bookingForm,
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
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم البطاقة الشخصية</label>
                  <input
                    type="text"
                    value={bookingForm.nationalId}
                    onChange={(e) => setBookingForm({ ...bookingForm, nationalId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">عدد النزلاء</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.guestCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestCount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Start & End Dates with auto duration calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ بداية الحجز (الوصول) *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const days = computeDurationDays(newStart, bookingForm.endDate);
                      setBookingForm({
                        ...bookingForm,
                        startDate: newStart,
                        durationDays: days,
                        totalAmount: days * bookingForm.dailyRate,
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ انتهاء الحجز (المغادرة) *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.endDate}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const days = computeDurationDays(bookingForm.startDate, newEnd);
                      setBookingForm({
                        ...bookingForm,
                        endDate: newEnd,
                        durationDays: days,
                        totalAmount: days * bookingForm.dailyRate,
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Automatic Financial Breakdown */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span>مدة الإقامة المحسوبة تلقائياً:</span>
                  <span className="font-mono font-bold text-purple-900">{bookingForm.durationDays} يوم</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">إجمالي مبلغ الحجز ({cur}) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={bookingForm.totalAmount}
                      onChange={(e) => setBookingForm({ ...bookingForm, totalAmount: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">المدفوع / العربون ({cur}) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={bookingForm.paidAmount}
                      onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-purple-200/60 font-bold">
                  <span>المبلغ المتبقي المستحق:</span>
                  <span className="font-mono text-rose-600 text-sm">
                    {Math.max(0, bookingForm.totalAmount - bookingForm.paidAmount).toLocaleString()} {cur}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  تأكيد الحجز وتجهيز رسالة واتساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RENEW / EXTEND BOOKING */}
      {isRenewModalOpen && targetBookingForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              تجديد وتمديد حجز الشقة #{targetBookingForRenew.apartmentNumber}
            </div>
            <form onSubmit={handleRenewSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">النزيل: {targetBookingForRenew.guestName}</div>
                <div className="text-slate-500 font-mono">
                  تاريخ الانتهاء الحالي: {targetBookingForRenew.endDate}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">عدد الأيام الإضافية *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={renewDays}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    setRenewDays(days);
                    setRenewAmount(days * targetBookingForRenew.dailyRate);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المبلغ الإضافي للتجديد ({cur}) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={renewAmount}
                  onChange={(e) => setRenewAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-900 font-semibold space-y-1">
                <div className="flex justify-between">
                  <span>تاريخ المغادرة الجديد:</span>
                  <span className="font-mono font-bold">
                    {(() => {
                      const d = new Date(targetBookingForRenew.endDate);
                      d.setDate(d.getDate() + Number(renewDays || 1));
                      return d.toISOString().slice(0, 10);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>المبلغ المتبقي الإجمالي:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {(targetBookingForRenew.remainingAmount + Number(renewAmount || 0)).toLocaleString()} {cur}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  تأكيد التجديد وإرسال واتساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT HOTEL EMPLOYEE */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              إضافة موظف جديد لقسم الفندق
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const fd = new FormData(formEl);
                const emp: Employee = {
                  id: `emp_hot_${Date.now()}`,
                  branch: 'hotel',
                  name: fd.get('name') as string,
                  countryCode: fd.get('countryCode') as string || DEFAULT_COUNTRY.dialCode,
                  countryFlag: DEFAULT_COUNTRY.flag,
                  phone: fd.get('phone') as string,
                  nationalId: (fd.get('nationalId') as string) || '',
                  jobTitle: (fd.get('jobTitle') as string) || 'موظف استقبال',
                  monthlySalary: Number(fd.get('monthlySalary')) || 0,
                  hireDate: (fd.get('hireDate') as string) || new Date().toISOString().slice(0, 10),
                  status: 'active',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await saveEmployee(emp);
                setIsEmpModalOpen(false);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الموظف *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="مثال: سارة محمد"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">مفتاح الاتصال</label>
                  <input
                    name="countryCode"
                    defaultValue="+20"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الوظيفة *</label>
                  <input
                    name="jobTitle"
                    type="text"
                    required
                    defaultValue="موظف استقبال"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الراتب الشهري ({cur}) *</label>
                  <input
                    name="monthlySalary"
                    type="number"
                    required
                    defaultValue="4000"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  حفظ موظف الفندق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
