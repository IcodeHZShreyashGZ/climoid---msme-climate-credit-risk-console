import React, { useState } from 'react';
import { TabType, TimeHorizon, BorrowerRecord } from './types';
import { PRIMARY_BORROWER, TOP_AT_RISK_BORROWERS } from './data/mockData';
import { SideNavBar } from './components/SideNavBar';
import { TopNavBar } from './components/TopNavBar';
import { ExportRiskPackModal, BulkNotifyModal } from './components/Modals';
import { ChatBot } from './components/ChatBot';
import { BorrowerConsoleView } from './views/BorrowerConsoleView';
import { CompareView } from './views/CompareView';
import { MapExplorerView } from './views/MapExplorerView';
import { DashboardView } from './views/DashboardView';
import { AlertsKanbanView } from './views/AlertsKanbanView';
import { ScenariosView } from './views/ScenariosView';
import { PortfolioAnalyticsView } from './views/PortfolioAnalyticsView';
import { LandingPortalView } from './views/LandingPortalView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('borrowers');
  const [horizon, setHorizon] = useState<TimeHorizon>('now');
  const [currentBorrower, setCurrentBorrower] = useState<BorrowerRecord>(PRIMARY_BORROWER);

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportTargetName, setExportTargetName] = useState('Full MSME Credit Portfolio');
  const [bulkNotifyModalOpen, setBulkNotifyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenUnderwriting = (borrower: BorrowerRecord) => {
    setCurrentBorrower(borrower);
    setActiveTab('borrowers');
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    // Check if matches a borrower
    const matched = TOP_AT_RISK_BORROWERS.find(b => 
      b.name.toLowerCase().includes(q) ||
      b.msmeId.toLowerCase().includes(q) ||
      b.district.toLowerCase().includes(q)
    );
    if (matched) {
      setCurrentBorrower(matched);
      setActiveTab('borrowers');
      showToast(`Navigated to ${matched.name} (${matched.msmeId})`);
    } else if (q.includes('map') || q.includes('pune') || q.includes('baramati') || q.includes('basin')) {
      setActiveTab('map');
    } else if (q.includes('alert')) {
      setActiveTab('alerts');
    } else if (q.includes('scenario') || q.includes('stress')) {
      setActiveTab('scenarios');
    }
  };

  // If viewing the public Landing / Sign-in page
  if (activeTab === 'landing') {
    return (
      <LandingPortalView
        onEnterConsole={(initialTab = 'dashboard') => {
          setActiveTab(initialTab);
          showToast('Authenticated via Chartered Bank Identity Federation. Console ready.');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#00685f] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in slide-in-from-top duration-200">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Side Navigation Bar */}
      <SideNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        alertCount={31}
      />

      {/* Top Navigation Bar */}
      <TopNavBar
        activeTab={activeTab}
        horizon={horizon}
        onHorizonChange={setHorizon}
        onSearch={handleSearch}
        onExportClick={() => {
          setExportTargetName(
            activeTab === 'borrowers' 
              ? `${currentBorrower.name} (${currentBorrower.msmeId})` 
              : 'Full MSME Credit Portfolio'
          );
          setExportModalOpen(true);
        }}
      />

      {/* Main Canvas Viewport */}
      {activeTab === 'map' ? (
        <MapExplorerView
          onOpenUnderwritingFile={(borrower) => {
            setCurrentBorrower(borrower);
            setActiveTab('borrowers');
          }}
          onExportDossier={() => {
            setExportTargetName(`${PRIMARY_BORROWER.name} Dossier`);
            setExportModalOpen(true);
          }}
        />
      ) : (
        <main className="ml-64 pt-14 min-h-screen p-6 overflow-y-auto">
          {activeTab === 'borrowers' && (
            <BorrowerConsoleView
              borrower={currentBorrower}
              horizon={horizon}
              onExportCreditNote={() => {
                setExportTargetName(`${currentBorrower.name} Credit Note`);
                setExportModalOpen(true);
              }}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onUnderwriteBorrower={handleOpenUnderwriting}
              onNavigateToAlerts={() => setActiveTab('alerts')}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'compare' && (
            <CompareView onOpenBorrower={handleOpenUnderwriting} />
          )}

          {activeTab === 'alerts' && (
            <AlertsKanbanView
              onOpenBulkNotify={() => setBulkNotifyModalOpen(true)}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenariosView
              onExportReport={() => {
                setExportTargetName('Macro Scenario Stress-Test Report #4092-B');
                setExportModalOpen(true);
              }}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioAnalyticsView
              onReRunScenarios={() => setActiveTab('scenarios')}
              onExportPillar3={() => {
                setExportTargetName('Regulatory Pillar 3 Disclosure');
                setExportModalOpen(true);
              }}
              onSelectBorrowerDossier={(name) => {
                const found = TOP_AT_RISK_BORROWERS.find(b => b.name === name) || PRIMARY_BORROWER;
                setCurrentBorrower(found);
                setActiveTab('borrowers');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onExportPack={() => {
                setExportTargetName('All Compliance & Pillar 3 Disclosures');
                setExportModalOpen(true);
              }}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      )}

      {/* Floating Risk Assistant */}
      <ChatBot
        onNavigate={(tab) => setActiveTab(tab)}
        onSelectBorrower={(borrower) => {
          setCurrentBorrower(borrower);
          setActiveTab('borrowers');
        }}
      />

      {/* Global Interactive Modals */}
      <ExportRiskPackModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        targetName={exportTargetName}
      />

      <BulkNotifyModal
        isOpen={bulkNotifyModalOpen}
        onClose={() => setBulkNotifyModalOpen(false)}
        onSuccess={() => {
          showToast('18 Relationship Managers notified across Pune, Surat & Vidarbha.');
        }}
      />
    </div>
  );
}
