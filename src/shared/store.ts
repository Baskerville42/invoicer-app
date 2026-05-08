import { create } from 'zustand';

interface InvoiceState {
  price: string;
  month: string;
  year: string;
  templateId: string;
  invoicePrefix: string;
  folderName: string;
  status: string;
  statusType: 'info' | 'success' | 'error';
  generationStep: number | null;
  userInfo: { name?: string | null; email?: string | null; picture?: string | null } | null;
  isAuthorized: boolean;
  isSettingsOpen: boolean;
  setIsAuthorized: (isAuthorized: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setPrice: (price: string) => void;
  setMonth: (month: string) => void;
  setYear: (year: string) => void;
  setTemplateId: (templateId: string) => void;
  setInvoicePrefix: (prefix: string) => void;
  setFolderName: (folderName: string) => void;
  setStatus: (status: string, statusType?: 'info' | 'success' | 'error') => void;
  setGenerationStep: (step: number | null) => void;
  setUserInfo: (
    userInfo: { name?: string | null; email?: string | null; picture?: string | null } | null
  ) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  price: '1000.01',
  month: new Date().toLocaleString('en-US', { month: 'long' }),
  year: new Date().getFullYear().toString(),
  templateId: '',
  invoicePrefix: '_PREFIX_',
  folderName: 'invoices',
  status: '',
  statusType: 'info',
  generationStep: null,
  userInfo: null,
  isAuthorized: false,
  isSettingsOpen: false,

  setIsAuthorized: (isAuthorized) => set({ isAuthorized }),
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setPrice: (price) => set({ price }),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setTemplateId: (templateId) => set({ templateId }),
  setInvoicePrefix: (invoicePrefix) => set({ invoicePrefix }),
  setFolderName: (folderName) => set({ folderName }),
  setStatus: (status, statusType = 'info') => set({ status, statusType }),
  setGenerationStep: (generationStep) => set({ generationStep }),
  setUserInfo: (userInfo) => set({ userInfo }),
}));
