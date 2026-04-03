import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import App from './App';
import './index.css';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as Window & { deferredInstallPrompt?: typeof e }).deferredInstallPrompt = e;
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <I18nProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-darksurface dark:text-slate-100',
              style: { borderRadius: '12px' },
            }}
          />
        </I18nProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
