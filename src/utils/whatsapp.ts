/**
 * WhatsApp Integration & Arab Countries Directory for Calculus Data
 */

export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'مصر', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'السعودية', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'الإمارات', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'الكويت', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'قطر', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'عمان', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'البحرين', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'الأردن', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'العراق', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'ليبيا', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'السودان', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'سوريا', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'لبنان', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'فلسطين', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'المغرب', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'تونس', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'الجزائر', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'اليمن', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'تركيا', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'المملكة المتحدة', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'الولايات المتحدة', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'ألمانيا', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Egypt 🇪🇬 (+20)

export function cleanPhoneNumber(phone: string, dialCode: string): string {
  // Strip non-numeric characters
  let cleanPhone = phone.replace(/[^\d]/g, '');
  const cleanDial = dialCode.replace(/[^\d]/g, '');

  // Remove leading zeros e.g. 01012345678 -> 1012345678
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.replace(/^0+/, '');
  }

  // If already starts with dial code, don't duplicate
  if (cleanPhone.startsWith(cleanDial)) {
    return cleanPhone;
  }

  return `${cleanDial}${cleanPhone}`;
}

export function generateWhatsAppUrl(phone: string, dialCode: string, message: string): string {
  const fullNumber = cleanPhoneNumber(phone, dialCode);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${fullNumber}?text=${encodedText}`;
}

// WhatsApp Message Templates
export function createDeductionMessage(params: {
  employeeName: string;
  deductionAmount: number;
  reason: string;
  date: string;
  baseSalary: number;
  totalDeductions: number;
  netSalaryRemaining: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `إشعار إداري - شركة Calculus Data
━━━━━━━━━━━━━━━━━━━━
الأستاذ/ة: ${params.employeeName}
تحية طيبة وبعد،

نحيطكم علماً بأنه تم تسجيل حركة خصم من الراتب وفقاً للتفاصيل التالية:
• قيمة الخصم: ${params.deductionAmount.toLocaleString()} ${cur}
• سبب الخصم: ${params.reason}
• تاريخ الخصم: ${params.date}
───────────────────
بيان الراتب للشهر الحالي:
• الراتب الأساسي: ${params.baseSalary.toLocaleString()} ${cur}
• إجمالي الخصومات: ${params.totalDeductions.toLocaleString()} ${cur}
• صافي الراتب المستحق: ${params.netSalaryRemaining.toLocaleString()} ${cur}

مع خالص التقدير،
إدارة شركة Calculus Data`;
}

export function createBonusMessage(params: {
  employeeName: string;
  bonusAmount: number;
  reason: string;
  date: string;
  baseSalary: number;
  netSalary: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `إشعار إداري - مكافأة تشجيعية - Calculus Data
━━━━━━━━━━━━━━━━━━━━
الأستاذ/ة: ${params.employeeName}
تحية طيبة وبعد،

يسر إدارة شركة Calculus Data إعلامكم بصرف مكافأة إضافية:
• قيمة المكافأة: ${params.bonusAmount.toLocaleString()} ${cur}
• السبب / الاستحقاق: ${params.reason}
• التاريخ: ${params.date}
───────────────────
• الراتب الأساسي: ${params.baseSalary.toLocaleString()} ${cur}
• الصافي بعد الإضافة: ${params.netSalary.toLocaleString()} ${cur}

شاكرين لجهودكم المتميزة وإخلاصكم في العمل.`;
}

export function createBookingConfirmationMessage(params: {
  guestName: string;
  apartmentNumber: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `تأكيد حجز إقامة فندقية - Calculus Data
━━━━━━━━━━━━━━━━━━━━
عزيزنا العميل: ${params.guestName}
أهلاً ومرحباً بكم، يسعدنا تأكيد حجز إقامتكم لدينا.

تفاصيل الحجز:
• رقم الشقة: ${params.apartmentNumber}
• تاريخ الوصول (البداية): ${params.startDate}
• تاريخ المغادرة (النهاية): ${params.endDate}
• مدة الإقامة: ${params.durationDays} يوم / ليالٍ
───────────────────
البيان المالي:
• إجمالي مبلغ الحجز: ${params.totalAmount.toLocaleString()} ${cur}
• العربون المدفوع: ${params.paidAmount.toLocaleString()} ${cur}
• المبلغ المتبقي المستحق: ${params.remainingAmount.toLocaleString()} ${cur}

نتمنى لكم إقامة مريحة وممتعة!
لأي استفسار يرجى التواصل معنا مباشرة.
إدارة فندق Calculus Data`;
}

export function createBookingExpiringSoonMessage(params: {
  guestName: string;
  apartmentNumber: string;
  endDate: string;
  remainingAmount: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `تذكير بموعد انتهاء الإقامة - Calculus Data
━━━━━━━━━━━━━━━━━━━━
عزيزنا العميل: ${params.guestName}
تحية طيبة،

نود تذكيركم بأن فترة إقامتكم في الشقة رقم (${params.apartmentNumber}) تنتهي بتاريخ: ${params.endDate}.
${params.remainingAmount > 0 ? `• يرجى العلم بأن المبلغ المتبقي للاستحقاق هو: ${params.remainingAmount.toLocaleString()} ${cur}\n` : ''}
في حال رغبتكم في تمديد الحجز أو تجديد الإقامة، نرجو إبلاغ الإدارة في أقرب وقت لتأكيد استمرار توافر الشقة.

شاكرين حسن تعاونكم،
إدارة فندق Calculus Data`;
}

export function createBookingExpiredNoticeMessage(params: {
  guestName: string;
  apartmentNumber: string;
  endDate: string;
  remainingAmount: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `إشعار انتهاء فترة الحجز - Calculus Data
━━━━━━━━━━━━━━━━━━━━
عزيزنا العميل: ${params.guestName}
تحية طيبة،

نحيطكم علماً بانتهاء مدة الحجز للشقة رقم (${params.apartmentNumber}) بتاريخ اليوم ${params.endDate}.
${params.remainingAmount > 0 ? `• المبلغ المستحق لتسوية الحساب: ${params.remainingAmount.toLocaleString()} ${cur}\n` : ''}
يرجى التفضل بمراجعة الاستقبال لتسليم المفاتيح أو إتمام إجراءات تمديد الإقامة.

سعدنا بخدمتكم ونتمنى رؤيتكم مجدداً!
إدارة فندق Calculus Data`;
}

export function createBookingRenewalMessage(params: {
  guestName: string;
  apartmentNumber: string;
  addedDays: number;
  newEndDate: string;
  additionalAmount: number;
  remainingAmount: number;
  currency?: string;
}): string {
  const cur = params.currency || 'ج.م';
  return `تأكيد تجديد وتمديد الحجز - Calculus Data
━━━━━━━━━━━━━━━━━━━━
عزيزنا العميل: ${params.guestName}
تم بنجاح تمديد فترة إقامتكم في الشقة رقم (${params.apartmentNumber}).

• الأيام المضافة: ${params.addedDays} يوم
• تاريخ المغادرة الجديد: ${params.newEndDate}
• المبلغ الإضافي للتجديد: ${params.additionalAmount.toLocaleString()} ${cur}
• الرصيد المتبقي الإجمالي: ${params.remainingAmount.toLocaleString()} ${cur}

شكراً لاختياركم فندق Calculus Data!`;
}
