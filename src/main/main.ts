import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import pkg from 'electron';

import * as dotenv from 'dotenv';

import { googleAuth } from '../features/auth/main/google-auth.js';
import { registerAuthHandlers } from '../features/auth/main/ipc-handlers.js';
import { registerInvoiceHandlers } from '../features/invoices/main/ipc-handlers.js';
import { registerSettingsHandlers } from '../features/settings/main/ipc-handlers.js';
import { AppInfo } from '../shared/types/ipc.js';

const { app, BrowserWindow, ipcMain } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv before other imports that might use process.env
dotenv.config();

if (app.isPackaged) {
  const envPath = path.join(process.resourcesPath, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

function resolvePreloadPath(): string {
  if (app.isPackaged) {
    // В упакованому вигляді шлях відносно кореня app.asar
    return path.join(app.getAppPath(), 'dist/preload/preload/preload.js');
  }
  // В режимі розробки шлях відносно поточного файлу (src/main/main.ts -> dist/main/main.js)
  return path.resolve(__dirname, '../../dist/preload/preload/preload.js');
}

function createWindow(): void {
  const preloadPath = resolvePreloadPath();

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.on('did-finish-load', () => {});

  mainWindow.webContents.on('did-fail-load', (_event, _errorCode, _errorDescription) => {});

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch((e) => {
      console.error('Failed to load URL:', e);
      setTimeout(() => mainWindow.loadURL('http://localhost:5173'), 1000);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html')).catch((_err) => {});
  }
}

app.whenReady().then(async () => {
  await googleAuth.authorize();

  // Реєстрація IPC обробників
  registerAuthHandlers();
  registerInvoiceHandlers();
  registerSettingsHandlers();

  ipcMain.handle('app-info', (): AppInfo => {
    const version = app.isPackaged ? app.getVersion() : `dev-${app.getVersion()}`;
    return {
      name: app.getName(),
      version: version,
    };
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
