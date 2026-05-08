import {
  AppInfo,
  AppSettings,
  GenerationProgress,
  GenerationResult,
  GoogleUserInfo,
} from '@shared/types/ipc';

export interface ElectronAPI {
  getAppInfo: () => Promise<AppInfo>;
  getGoogleAuthStatus: () => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  googleLogout: () => Promise<boolean>;
  getGoogleUserInfo: () => Promise<GoogleUserInfo | null>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<{ success: boolean }>;
  generateInvoice: (args: {
    templateId: string;
    fileName: string;
    data: Record<string, string>;
  }) => Promise<GenerationResult>;
  onGenerationProgress: (callback: (data: GenerationProgress) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    HSStaticMethods: {
      autoInit(): void;
    };
    HSTooltip: {
      autoInit(): void;
    };
  }
}
