import React, { useEffect, useState } from 'react';

import 'flyonui/flyonui';
import { InvoiceForm } from '../features/invoices/renderer/InvoiceForm';
import { SettingsModal } from '../features/settings/renderer/SettingsModal';
import { LayoutHeader as Header } from '../shared/components/LayoutHeader';
import { useInvoiceStore } from '../shared/store';

const App: React.FC = () => {
  const {
    setTemplateId,
    setInvoicePrefix,
    setFolderName,
    setStatus,
    setGenerationStep,
    setUserInfo,
    setIsAuthorized,
  } = useInvoiceStore();

  const [appInfo, setAppInfo] = useState({ name: '', version: '' });

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppInfo().then(setAppInfo);

      window.electronAPI.getGoogleAuthStatus().then(async (authorized) => {
        setIsAuthorized(authorized);
        if (authorized) {
          const info = await window.electronAPI.getGoogleUserInfo();
          setUserInfo(info);
        }
      });

      window.electronAPI.getSettings().then((settings) => {
        if (settings) {
          if (settings.templateId) setTemplateId(settings.templateId);
          if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
          if (settings.folderName) setFolderName(settings.folderName);
        }
      });

      const removeListener = window.electronAPI.onGenerationProgress(({ step, status }) => {
        setGenerationStep(step);
        setStatus(status, 'info');
      });

      return () => {
        removeListener();
      };
    } else {
      console.error('electronAPI is not available');
      setAppInfo({ name: 'Invoicer (Web Mode)', version: '0.0.0' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <Header version={appInfo.version} />
        <main>
          <InvoiceForm />
        </main>
      </div>

      <SettingsModal />
    </div>
  );
};

export default App;
