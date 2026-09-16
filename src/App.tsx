/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickScratchpadModal } from './components/common/QuickScratchpadModal';
import { Toast } from './components/common/Toast';

// 9 Vertical Views
import { DashboardView } from './views/DashboardView';
import { DailyPlanView } from './views/DailyPlanView';
import { ContentView } from './views/ContentView';
import { DevWorkView } from './views/DevWorkView';
import { ConsultingView } from './views/ConsultingView';
import { FitnessView } from './views/FitnessView';
import { DietView } from './views/DietView';
import { GamingView } from './views/GamingView';
import { DataSettingsView } from './views/DataSettingsView';

const MainLayout: React.FC = () => {
  const { activeModule } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeModule) {
      case 'daily':
        return <DailyPlanView />;
      case 'content':
        return <ContentView />;
      case 'dev':
        return <DevWorkView />;
      case 'consulting':
        return <ConsultingView />;
      case 'fitness':
        return <FitnessView />;
      case 'diet':
        return <DietView />;
      case 'gaming':
        return <GamingView />;
      case 'settings':
        return <DataSettingsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="app-root-layout" className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 antialiased">
      {/* 9-Module Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sticky Header with Date, Clock, Local Status, Scratchpad Shortcut */}
        <Header />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <QuickScratchpadModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
