import { useEffect, useRef, useState } from 'react'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import Brand from './Brand'
import type { ThemeChoice } from '../hooks/useTheme'

export default function Navbar({ theme, themeChoice, onTheme }: { theme: 'light' | 'dark'; themeChoice: ThemeChoice; onTheme: (t: ThemeChoice) => void }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { const update = () => setScrolled(window.scrollY > 12); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update) }, [])
  useEffect(() => { if (!open) return; const trigger = triggerRef.current; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); if (event.key === 'Tab') { const nodes = menuRef.current?.querySelectorAll<HTMLElement>('a,button'); if (!nodes?.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() } } }; document.addEventListener('keydown', key); return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', key); trigger?.focus() } }, [open])
  const changeLang = () => { const language = i18n.language === 'tr' ? 'en' : 'tr'; i18n.changeLanguage(language); try { localStorage.setItem('cm-lang', language) } catch { /* Storage may be unavailable */ } }
  const links = [['nav.sectors', '#sectors'], ['nav.demo', '#demo'], ['nav.features', '#features'], ['nav.integrations', '#integrations'], ['nav.contact', '#contact']]
  const controls = <><button className="icon-button language-button" onClick={changeLang} aria-label={t('nav.language')} title={t('nav.language')}><Languages size={17}/><span>{i18n.language === 'tr' ? 'TR' : 'EN'}</span></button><button className="icon-button" onClick={() => onTheme(themeChoice === 'system' ? (theme === 'dark' ? 'light' : 'dark') : theme === 'dark' ? 'light' : 'dark')} aria-label={t('nav.theme')} title={t('nav.theme')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button></>
  return <header className={`site-header ${scrolled ? 'scrolled' : ''}`}><div className="container nav-inner"><Brand/><nav className="desktop-nav" aria-label="Main"><div className="nav-links">{links.map(([label, href]) => <a key={href} href={href}>{t(label)}</a>)}</div><div className="nav-actions">{controls}<a className="button button-primary nav-cta" href="#demo">{t('nav.try')} <span aria-hidden="true">↗</span></a></div></nav><button ref={triggerRef} className="icon-button mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={t(open ? 'nav.close' : 'nav.menu')}>{open ? <X/> : <Menu/>}</button></div><AnimatePresence>{open && <motion.div id="mobile-menu" ref={menuRef} className="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }}><nav aria-label="Mobile">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{t(label)}</a>)}<a className="button button-primary" href="#demo" onClick={() => setOpen(false)}>{t('nav.try')}</a><div className="mobile-controls">{controls}</div></nav></motion.div>}</AnimatePresence></header>
}
