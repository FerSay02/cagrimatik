import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from './locales/tr.json'
import en from './locales/en.json'

const stored = (() => { try { return localStorage.getItem('cm-lang') } catch { return null } })()
i18n.use(initReactI18next).init({
  resources: { tr: { translation: tr }, en: { translation: en } },
  lng: stored === 'en' ? 'en' : 'tr', fallbackLng: 'tr', interpolation: { escapeValue: false },
  returnNull: false,
})
export default i18n
