import fs from 'fs';

import { dialog, ipcMain } from 'electron';

import { generateInvoice } from './google-docs.js';
import { GenerationResult } from '../../../shared/types/ipc.js';

export function registerInvoiceHandlers() {
  ipcMain.handle(
    'generate-invoice',
    async (event, { templateId, fileName, data }): Promise<GenerationResult> => {
      try {
        const webContents = event.sender;
        const onProgress = (step: number, status: string) => {
          webContents.send('generation-progress', { step, status });
        };

        const result = await generateInvoice(templateId, fileName, data, onProgress);

        const { filePath } = await dialog.showSaveDialog({
          title: 'Зберегти PDF інвойс',
          defaultPath: `${fileName}.pdf`,
          filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        });

        if (filePath) {
          fs.writeFileSync(filePath, result.pdfBuffer);
          return { success: true, path: filePath };
        }
        return { success: false, error: 'Save cancelled' };
      } catch (error: any) {
        console.error('Generation error:', error);
        return { success: false, error: error.message };
      }
    }
  );
}
