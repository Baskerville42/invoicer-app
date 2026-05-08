import fs from 'fs';
import http from 'http';
import path from 'path';
import { URL } from 'url';

import pkg from 'electron';

import * as dotenv from 'dotenv';
import { google } from 'googleapis';

const { shell, app } = pkg;

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

const TOKEN_PATH = path.join(app.getPath('userData'), 'google_tokens.json');

export class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3001');
  }

  async authorize() {
    this.initClient(); // Ensure client is re-initialized with potentially new env vars
    const tokens = this.loadTokens();
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
      return true;
    }
    return false;
  }

  async login(): Promise<void> {
    this.initClient(); // Ensure client is initialized with env vars before generating URL
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });

    await shell.openExternal(authUrl);

    return new Promise((resolve, reject) => {
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url?.startsWith('/')) {
              const urlParams = new URL(req.url, 'http://localhost:3001').searchParams;
              const code = urlParams.get('code');

              if (code) {
                const { tokens } = await this.oauth2Client.getToken(code);
                this.oauth2Client.setCredentials(tokens);
                this.saveTokens(tokens);

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(this.getAuthHtml('success'));
                server.close();
                resolve();
              }
            }
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(this.getAuthHtml('error'));
            server.close();
            reject(e);
          }
        })
        .listen(3001);
    });
  }

  private getAuthHtml(status: 'success' | 'error') {
    const isSuccess = status === 'success';
    const title = isSuccess ? 'Авторизація успішна' : 'Помилка авторизації';
    const message = isSuccess
      ? 'Ви успішно увійшли в систему через Google. Тепер ви можете закрити це вікно та повернутися до додатка.'
      : 'Сталася помилка під час спроби авторизації. Спробуйте ще раз.';
    const icon = isSuccess
      ? '<svg class="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      : '<svg class="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    return `
<!DOCTYPE html>
<html lang="uk" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/flyonui@latest/dist/full.min.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; }
        h1, h2 { font-family: 'Montserrat', sans-serif; }
        .bg-pattern {
            background-color: #F8FAFC;
            background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
            background-size: 20px 20px;
        }
    </style>
</head>
<body class="bg-pattern min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div class="flex justify-center mb-6">
            <div class="p-4 bg-slate-50 rounded-full">
                ${icon}
            </div>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-4">${title}</h1>
        <p class="text-slate-600 mb-8 leading-relaxed">
            ${message}
        </p>
        <div class="space-y-4">
            ${
              isSuccess
                ? '<div class="badge badge-soft badge-success py-3 px-4 text-sm font-medium">Готово до роботи</div>'
                : '<button onclick="window.close()" class="btn btn-primary w-full">Спробувати знову</button>'
            }
            <p class="text-xs text-slate-400 mt-6">
                Це вікно можна безпечно закрити.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  private saveTokens(tokens: any) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  }

  private loadTokens() {
    if (fs.existsSync(TOKEN_PATH)) {
      return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    }
    return null;
  }

  async isAuthenticated() {
    const tokens = this.loadTokens();
    return !!tokens;
  }

  async logout() {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
    this.oauth2Client.setCredentials({});
  }

  async getUserInfo() {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      return userInfo.data;
    } catch (_e) {
      return null;
    }
  }

  getClient() {
    return this.oauth2Client;
  }
}

export const googleAuth = new GoogleAuthService();
