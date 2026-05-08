import { contextBridge, ipcRenderer } from 'electron';

import {
  AppInfo,
  AppSettings,
  GenerationProgress,
  GenerationResult,
  GoogleUserInfo,
} from '../shared/types/ipc';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('app-info'),
  getGoogleAuthStatus: (): Promise<boolean> => ipcRenderer.invoke('google-auth-status'),
  googleLogin: (): Promise<boolean> => ipcRenderer.invoke('google-login'),
  googleLogout: (): Promise<boolean> => ipcRenderer.invoke('google-logout'),
  getGoogleUserInfo: (): Promise<GoogleUserInfo | null> => ipcRenderer.invoke('google-user-info'),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: AppSettings): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('save-settings', settings),
  generateInvoice: (args: {
    templateId: string;
    fileName: string;
    data: Record<string, string>;
  }): Promise<GenerationResult> => ipcRenderer.invoke('generate-invoice', args),
  onGenerationProgress: (callback: (data: GenerationProgress) => void) => {
    const listener = (_event: any, data: GenerationProgress) => callback(data);
    ipcRenderer.on('generation-progress', listener);
    return () => ipcRenderer.removeListener('generation-progress', listener);
  },
});
