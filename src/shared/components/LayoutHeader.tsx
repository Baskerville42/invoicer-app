import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText, GitBranch, LogIn, LogOut, Settings } from 'lucide-react';

import { useInvoiceStore } from '../store';

interface HeaderProps {
  version: string;
}

export const LayoutHeader: React.FC<HeaderProps> = ({ version }) => {
  const { isAuthorized, setIsAuthorized, userInfo, setUserInfo, setStatus, setIsSettingsOpen } =
    useInvoiceStore();

  const handleLogin = async () => {
    setStatus('Відкриваємо браузер для авторизації...', 'info');
    if (!window.electronAPI) {
      setStatus('Помилка авторизації: electronAPI не доступний. Перезапустіть додаток.', 'error');
      return;
    }

    try {
      await window.electronAPI.googleLogin();
      setIsAuthorized(true);
      const info = await window.electronAPI.getGoogleUserInfo();
      setUserInfo(info);
      setStatus('Авторизація успішна!', 'success');
    } catch (e: any) {
      setStatus(`Помилка авторизації: ${e.message}`, 'error');
    }
  };

  const handleLogout = async () => {
    if (!window.electronAPI) {
      setStatus('Помилка: electronAPI не доступний. Перезапустіть додаток.', 'error');
      return;
    }

    try {
      await window.electronAPI.googleLogout();
      setIsAuthorized(false);
      setUserInfo(null);
      setStatus('Ви вийшли з акаунта', 'info');
    } catch (e: any) {
      setStatus(`Помилка: ${e.message}`, 'error');
    }
  };

  return (
    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <FileText className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-montserrat">
            Invoicer
          </h1>
          <a
            href="https://github.com/Baskerville42/invoicer-app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors duration-200"
            title="GitHub Repository"
          >
            <GitBranch className="w-5 h-5" />
          </a>
        </div>
        <p className="text-slate-500 font-medium">
          Керування інвойсами • v{version}{' '}
          <span className="badge badge-soft badge-primary ml-2">FlyonUI</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200"
          title="Налаштування"
        >
          <Settings className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {!isAuthorized ? (
            <motion.button
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleLogin}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Увійти
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div
                key="auth-ok"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]"
              >
                <button
                  id="dropdown-account"
                  type="button"
                  className="dropdown-toggle flex items-center gap-2 bg-white border border-slate-200 py-1.5 pl-1.5 pr-3 rounded-xl shadow-sm hover:border-indigo-200 transition-all"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  aria-label="Dropdown"
                >
                  <div className="avatar">
                    <div className="size-8 rounded-lg overflow-hidden border border-slate-100">
                      {userInfo?.picture ? (
                        <img
                          src={userInfo.picture}
                          alt={userInfo.name || 'User Avatar'}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            console.error('Avatar load error:', userInfo.picture);
                            // @ts-expect-error - legacy access to DOM
                            e.target.style.display = 'none';
                            // @ts-expect-error - legacy access to DOM
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs"
                        style={{ display: userInfo?.picture ? 'none' : 'flex' }}
                      >
                        {userInfo?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[13px] font-bold text-slate-900 truncate max-w-30">
                      {userInfo?.name || 'Користувач'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-30">
                      {userInfo?.email || 'Google Account'}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1" />
                </button>

                <ul
                  className="dropdown-menu dropdown-open:opacity-100 hidden min-w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="dropdown-account"
                >
                  <li className="px-3 py-2 border-bottom border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Акаунт
                    </p>
                  </li>
                  <li className="px-3 py-2">
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {userInfo?.email}
                    </p>
                  </li>
                </ul>
              </motion.div>

              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Вийти з акаунта"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};
