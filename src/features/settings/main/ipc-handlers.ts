import { ipcMain } from 'electron';

import store from './store.js';
import { AppSettings } from '../../../shared/types/ipc.js';

export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', async (): Promise<AppSettings> => {
    const settings = await store.getSettings();
    return settings as AppSettings;
  });

  ipcMain.handle(
    'save-settings',
    async (_, settings: AppSettings): Promise<{ success: boolean }> => {
      await store.saveSettings(settings);
      return { success: true };
    }
  );
}
