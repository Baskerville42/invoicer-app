import { ipcMain } from 'electron';

import { googleAuth } from './google-auth.js';
import { GoogleUserInfo } from '../../../shared/types/ipc.js';

export function registerAuthHandlers() {
  ipcMain.handle('google-auth-status', async (): Promise<boolean> => {
    return await googleAuth.isAuthenticated();
  });

  ipcMain.handle('google-login', async (): Promise<boolean> => {
    await googleAuth.login();
    return true;
  });

  ipcMain.handle('google-logout', async (): Promise<boolean> => {
    await googleAuth.logout();
    return true;
  });

  ipcMain.handle('google-user-info', async (): Promise<GoogleUserInfo | null> => {
    return await googleAuth.getUserInfo();
  });
}
