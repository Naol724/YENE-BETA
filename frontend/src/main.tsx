import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as Window & { deferredInstallPrompt?: typeof e }).deferredInstallPrompt = e;
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
