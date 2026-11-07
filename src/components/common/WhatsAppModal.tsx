import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { MessageSquare, Send, Copy, Check, X } from 'lucide-react';

export const WhatsAppModal: React.FC = () => {
  const { whatsAppModal, closeWhatsAppModal } = useData();
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsAppModal.isOpen) {
      setEditedMessage(whatsAppModal.message);
      setCopied(false);
    }
  }, [whatsAppModal]);

  if (!whatsAppModal.isOpen) return null;

  const handleSend = () => {
    const url = generateWhatsAppUrl(whatsAppModal.phone, whatsAppModal.countryCode, editedMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    closeWhatsAppModal();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">{whatsAppModal.title}</h3>
              <p className="text-xs text-emerald-100">
                المستلم: {whatsAppModal.recipientName} ({whatsAppModal.countryCode} {whatsAppModal.phone})
              </p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppModal}
            className="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                محتوى الرسالة (يمكنك التعديل قبل الإرسال):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full text-sm leading-relaxed p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
              dir="rtl"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
            💡 سيتم توجيهك مباشرة إلى تطبيق واتساب أو واتساب ويب مع إرفاق النص أعلاه جاهزاً للإرسال.
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeWhatsAppModal}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all rounded-xl shadow-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>إرسال عبر واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
