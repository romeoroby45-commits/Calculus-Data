/**
 * Calculus Data - Factory & Hotel Enterprise Management System
 * Offline-first with IndexedDB persistence and full Arabic RTL support.
 */

import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { FactorySection } from './components/factory/FactorySection';
import { HotelSection } from './components/hotel/HotelSection';
import { FinanceSection } from './components/finance/FinanceSection';
import { ReportsSection } from './components/reports/ReportsSection';
import { SettingsSection } from './components/settings/SettingsSection';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { Loader2 } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { loading, activeSection } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard shortcuts: Ctrl+K or Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg mb-4">
          C
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          <span className="font-bold text-sm text-slate-800">جاري تحميل نظام Calculus Data من قاعدة البيانات المحلية...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeSection === 'dashboard' && <DashboardOverview />}
          {activeSection === 'factory' && <FactorySection />}
          {activeSection === 'hotel' && <HotelSection />}
          {activeSection === 'finance' && <FinanceSection />}
          {activeSection === 'reports' && <ReportsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>

      {/* WhatsApp Modal with preview & edit before sending */}
      <WhatsAppModal />

      {/* Global Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainAppLayout />
    </DataProvider>
  );
}
