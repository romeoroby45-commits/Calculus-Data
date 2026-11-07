import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { SystemUser, UserRole } from '../../types';
import {
  Settings,
  HardDriveDownload,
  UploadCloud,
  ShieldCheck,
  Users,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileCheck,
  Lock,
  Plus,
  Trash2,
  DollarSign,
  BellRing,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    settings,
    updateSettings,
    users,
    saveUser,
    deleteUser,
    currentUser,
    setCurrentUser,
    triggerExportBackup,
    triggerImportBackup,
    triggerResetDatabase,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // General Settings Form
  const [companyName, setCompanyName] = useState(settings.companyName || 'Calculus Data');
  const [currency, setCurrency] = useState(settings.currency || 'ج.م');
  const [bookingAlertDays, setBookingAlertDays] = useState(settings.bookingAlertDaysBefore || 1);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockAlertDefaultThreshold || 5);
  const [savedNotice, setSavedNotice] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    role: UserRole;
    pin: string;
    allowedSections: string[];
  }>({
    name: '',
    role: 'accountant',
    pin: '',
    allowedSections: ['dashboard', 'finance', 'reports'],
  });

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      companyName,
      currency,
      bookingAlertDaysBefore: Number(bookingAlertDays),
      lowStockAlertDefaultThreshold: Number(lowStockThreshold),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Export Backup File Handler
  const handleDownloadBackup = async () => {
    try {
      const backupJson = await triggerExportBackup();
      const blob = new Blob([backupJson], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CalculusData_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup export failed:', err);
    }
  };

  // Import Backup File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'تحذير هام: استعادة النسخة الاحتياطية ستقوم باستبدال كافة البيانات الحالية بالبيانات الموجودة في الملف. هل تود المتابعة؟'
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await triggerImportBackup(content);
        setImportStatus(res);
      }
    };
    reader.readAsText(file);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name) return;

    const user: SystemUser = {
      id: `usr_${Date.now()}`,
      name: newUserForm.name,
      role: newUserForm.role,
      pin: newUserForm.pin,
      allowedSections: newUserForm.allowedSections,
      createdAt: new Date().toISOString(),
    };

    await saveUser(user);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      role: 'accountant',
      pin: '',
      allowedSections: ['dashboard', 'finance', 'reports'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>الإعدادات، الصلاحيات، والنسخ الاحتياطي</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          إدارة حفظ البيانات محلياً على الجهاز (IndexedDB)، إنشاء واستعادة النسخ الاحتياطية، وتحديد صلاحيات المستخدمين.
        </p>
      </div>

      {/* Critical Local Data Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>الخصوصية والأمان: حفظ البيانات محلياً على هذا الجهاز بنسبة 100%</span>
        </div>
        <p className="leading-relaxed text-emerald-800">
          وفقاً لشروط النظام، يتم حفظ كافة بيانات المصنع والفندق والموظفين والشقق والحجوزات والمخزون والحسابات المالية
          داخل قاعدة بيانات المتصفح المحلية <strong>(IndexedDB)</strong> على هذا الجهاز فقط، دون استخدام أي خوادم سحابية
          خارجية أو إرسال أي بيانات عبر الإنترنت.
        </p>
        <p className="font-semibold text-emerald-900">
          ⚠️ تنبيه: مسح بيانات المتصفح (Clear Cache/Storage) قد يؤدي إلى حذف البيانات المحلية، لذا ننصح بإنشاء نسخة احتياطية دورياً وحفظها على قرص التخزين الخارجي.
        </p>
      </div>

      {/* Section 1: Backup & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDriveDownload className="w-5 h-5 text-indigo-600" />
              <span>النسخ الاحتياطي واستعادة البيانات</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تصدير كافة بيانات الشركة إلى ملف JSON واحد للنسخ الاحتياطي أو النقل لجهاز آخر.
            </p>
          </div>
          {settings.lastBackupDate && (
            <span className="text-xs text-slate-500 font-mono">
              آخر نسخة احتياطية: {settings.lastBackupDate.slice(0, 10)}
            </span>
          )}
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Download Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-sm text-slate-900 block">نسخ احتياطي للبيانات</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                إنشاء وتنزيل ملف نسخة احتياطية فوري يحتوي على كافة الموظفين، الشقق، الحجوزات، المخزون، والحسابات المالية.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>تنزيل ملف النسخة الاحتياطية (JSON)</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-sm text-slate-900 block">استعادة البيانات من نسخة سابقة</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                استيراد ملف نسخة احتياطية (.json) محفوظ مسبقاً لاسترجاع كافة البيانات إلى النظام.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>اختيار ملف النسخة واستعادتها</span>
              </label>
            </div>
          </div>
        </div>

        {/* Database Wipe Reset */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800">إعادة تعيين قاعدة البيانات</span>
            <p className="text-slate-500">حذف كافة البيانات المسجلة والبدء من جديد بحساب مدير فارغ.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('تحذير نهائي: هل أنت متأكد من رغبتك في مسح كافة البيانات المسجلة والبدء من جديد؟ لا يمكن التراجع عن هذا الإجراء.')) {
                triggerResetDatabase();
              }
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
          >
            مسح كافة البيانات
          </button>
        </div>
      </div>

      {/* Section 2: General System Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-600" />
            <span>إعدادات النظام والتنبيهات</span>
          </h2>
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              تم حفظ التعديلات
            </span>
          )}
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المؤسسة أو الشركة *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">العملة الافتراضية *</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="ج.م، ر.س، د.إ..."
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                تنبيه قبل انتهاء الحجز الفندقي بـ (أيام)
              </label>
              <select
                value={bookingAlertDays}
                onChange={(e) => setBookingAlertDays(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value={1}>قبل يوم واحد (24 ساعة)</option>
                <option value={2}>قبل يومين (48 ساعة)</option>
                <option value={3}>قبل 3 أيام</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                الحد الافتراضي لتنبيه نقص مخزون المصنع
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-2xs transition-colors"
            >
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Users & Role Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>إدارة المستخدمين والصلاحيات</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تحديد صلاحيات المدير، المحاسب، موظف الاستقبال، ومسؤولي المصنع والفندق.
            </p>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستخدم</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">اسم المستخدم</th>
                <th className="py-3 px-4">الدور الوظيفي والصلاحية</th>
                <th className="py-3 px-4">رمز الدخول (PIN)</th>
                <th className="py-3 px-4">الحالة الحالية</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {u.role === 'admin' && 'المدير العام (كامل الصلاحيات)'}
                      {u.role === 'accountant' && 'المحاسب (المالية والتقارير)'}
                      {u.role === 'receptionist' && 'موظف الاستقبال (الشقق والحجوزات)'}
                      {u.role === 'factory_manager' && 'مسؤول المصنع (المخزون والعمال)'}
                      {u.role === 'hotel_manager' && 'مسؤول الفندق (الشقق والنزلاء)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.pin || 'بدون رمز'}</td>
                  <td className="py-3 px-4">
                    {u.id === currentUser.id ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        المستخدم النشط حالياً
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentUser(u)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        التبديل إلى هذا الحساب
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {users.length > 1 && u.id !== currentUser.id && (
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف المستخدم ${u.name}؟`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
              إضافة مستخدم جديد للنظام
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المستخدم *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="مثال: أحمد المحاسب، مروان الاستقبال"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الصلاحية / الدور *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="admin">المدير العام (كافة الأقسام)</option>
                  <option value="accountant">المحاسب (الحسابات، الرواتب، والتقارير)</option>
                  <option value="receptionist">موظف الاستقبال (الشقق، الحجوزات، والنزلاء)</option>
                  <option value="factory_manager">مسؤول المصنع (المخزون، المعدات، وعمال المصنع)</option>
                  <option value="hotel_manager">مسؤول الفندق (الشقق، المحتويات، والحجوزات)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">رمز الدخول السريع (PIN اختياري)</label>
                <input
                  type="password"
                  value={newUserForm.pin}
                  onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value })}
                  placeholder="4 أرقام"
                  maxLength={6}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
                >
                  إضافة المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
