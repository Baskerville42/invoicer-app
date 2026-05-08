import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { SettingsInput } from './SettingsInput';
import { useInvoiceStore } from '../../../shared/store';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    templateId,
    setTemplateId,
    invoicePrefix,
    setInvoicePrefix,
    folderName,
    setFolderName,
    setStatus,
  } = useInvoiceStore();

  const [tempTemplateId, setTempTemplateId] = useState(templateId);
  const [tempPrefix, setTempPrefix] = useState(invoicePrefix);
  const [tempFolderName, setTempFolderName] = useState(folderName);

  useEffect(() => {
    if (isSettingsOpen) {
      setTempTemplateId(templateId);
      setTempPrefix(invoicePrefix);
      setTempFolderName(folderName);
    }
  }, [isSettingsOpen, templateId, invoicePrefix, folderName]);

  const handleSaveSettings = async () => {
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI не доступний. Спробуйте перезавантажити додаток.');
      }
      let finalId = tempTemplateId.trim();
      // Покращений регулярний вираз для вилучення ID з будь-якого формату URL
      if (finalId.includes('docs.google.com/document/d/')) {
        const match = finalId.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) finalId = match[1];
      }
      const finalPrefix = tempPrefix.trim() || '_PREFIX_';
      const finalFolderName = tempFolderName.trim() || 'invoices';

      await window.electronAPI.saveSettings({
        templateId: finalId,
        invoicePrefix: finalPrefix,
        folderName: finalFolderName,
      });

      setTemplateId(finalId);
      setInvoicePrefix(finalPrefix);
      setFolderName(finalFolderName);
      setIsSettingsOpen(false);
      setStatus('Налаштування збережено!', 'success');
    } catch (e: any) {
      setStatus(`Помилка збереження: ${e.message}`, 'error');
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold font-montserrat tracking-tight">
                Налаштування
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <SettingsInput
                id="settings-prefix"
                label="Префікс інвойсу"
                value={tempPrefix}
                onChange={setTempPrefix}
              />

              <SettingsInput
                id="settings-template"
                label="Document ID"
                value={tempTemplateId}
                onChange={setTempTemplateId}
              />

              <SettingsInput
                id="settings-folder"
                label="Папка в Google Drive"
                value={tempFolderName}
                onChange={setTempFolderName}
              />

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  Зберегти
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
