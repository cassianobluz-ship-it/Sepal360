import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Storage polyfill — usa localStorage fora do Claude
if (!window.storage) {
  window.storage = {
    _data: (() => { try { return JSON.parse(localStorage.getItem('cg360_storage') || '{}'); } catch { return {}; } })(),
    _save() { try { localStorage.setItem('cg360_storage', JSON.stringify(this._data)); } catch {} },
    async get(key) {
      const value = this._data[key];
      if (value !== undefined) return { key, value };
      throw new Error('Key not found: ' + key);
    },
    async set(key, value) {
      this._data[key] = value;
      this._save();
      return { key, value };
    },
    async delete(key) {
      delete this._data[key];
      this._save();
      return { key, deleted: true };
    },
    async list(prefix) {
      const keys = Object.keys(this._data).filter(k => !prefix || k.startsWith(prefix));
      return { keys };
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
