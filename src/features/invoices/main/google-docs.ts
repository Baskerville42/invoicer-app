import { google } from 'googleapis';

import { googleAuth } from '../../auth/main/google-auth.js';
import store from '../../settings/main/store.js';

export async function generateInvoice(
  templateId: string,
  fileName: string,
  data: Record<string, string>,
  onProgress?: (step: number, status: string) => void
) {
  // Додаткова перевірка та очищення templateId безпосередньо в main процесі
  let cleanTemplateId = templateId.trim();
  if (cleanTemplateId.includes('docs.google.com/document/d/')) {
    const match = cleanTemplateId.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) cleanTemplateId = match[1];
  }

  const auth = googleAuth.getClient();
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  // 0. Шукаємо або створюємо теку
  const folderName = (await store.getSetting('folderName')) || 'invoices';
  let folderId: string | null = null;

  try {
    if (onProgress) onProgress(0, `Пошук папки "${folderName}"...`);
    const folderRes = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (folderRes.data.files && folderRes.data.files.length > 0) {
      folderId = folderRes.data.files[0].id!;
    } else {
      if (onProgress) onProgress(0, `Створення папки "${folderName}"...`);
      const createFolderRes = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderId = createFolderRes.data.id!;
    }
  } catch (error) {
    // Якщо помилка з текою, документів будуть у корені.
  }

  // 1. Копіюємо шаблон
  if (onProgress) onProgress(1, 'Копіювання шаблону...');
  const copyResponse = await drive.files.copy({
    fileId: cleanTemplateId,
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    },
  });

  const documentId = copyResponse.data.id;
  if (!documentId) throw new Error('Failed to copy template');

  // 2. Замінюємо текст {{key}} на value
  if (onProgress) onProgress(2, 'Заміна тексту...');
  const requests = Object.entries(data).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: false,
      },
      replaceText: value,
    },
  }));

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests,
    },
  });

  // 3. Експортуємо в PDF
  if (onProgress) onProgress(3, 'Експорт в PDF...');
  const pdfResponse = await drive.files.export(
    {
      fileId: documentId,
      mimeType: 'application/pdf',
    },
    { responseType: 'arraybuffer' }
  );

  if (onProgress) onProgress(4, 'Збереження...');
  return {
    documentId,
    pdfBuffer: Buffer.from(pdfResponse.data as any),
  };
}
