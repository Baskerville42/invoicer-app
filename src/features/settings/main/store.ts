import pkg from 'electron';

import storage from 'electron-json-storage';

const { app } = pkg;

// Налаштовуємо шлях до сховища в userData
const storagePath = app.getPath('userData');
storage.setDataPath(storagePath);

const SETTINGS_KEY = 'app_settings';

export const getSettings = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    storage.get(SETTINGS_KEY, (error, data) => {
      if (error) reject(error);
      // electron-json-storage повертає порожній об'єкт {}, якщо даних немає
      resolve(Object.keys(data).length === 0 ? null : data);
    });
  });
};

export const saveSettings = (settings: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Спочатку отримуємо поточні налаштування для мерджу
    storage.get(SETTINGS_KEY, (error, currentData) => {
      if (error) {
        storage.set(SETTINGS_KEY, settings, (err) => {
          if (err) reject(err);
          resolve();
        });
        return;
      }

      const newData = { ...currentData, ...settings };
      storage.set(SETTINGS_KEY, newData, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
};

export const getSetting = async (key: string): Promise<any> => {
  const settings = await getSettings();
  return settings ? settings[key] : undefined;
};

export default {
  getSettings,
  saveSettings,
  getSetting,
};
