export interface AppInfo {
  name: string;
  version: string;
}

export interface GoogleUserInfo {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

export interface AppSettings {
  templateId: string;
  invoicePrefix: string;
  folderName: string;
}

export interface GenerationProgress {
  step: number;
  status: string;
}

export interface GenerationResult {
  success: boolean;
  path?: string;
  error?: string;
}
