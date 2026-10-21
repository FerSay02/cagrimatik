import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Brand from './Brand'
export default function Footer(){const {t}=useTranslation();return <footer className="footer"><div className="container footer-top"><div><Brand/><p>{t('footer.line')}</p></div><nav aria-label="Footer"><a href="#sectors">{t('nav.sectors')}</a><a href="#demo">{t('nav.demo')}</a><a href="#features">{t('nav.features')}</a><a href="#contact">{t('nav.contact')}</a></nav></div><div className="container footer-bottom"><span>{t('footer.copyright',{year:new Date().getFullYear()})}</span><a href="#top">{t('footer.top')} <ArrowUp size={15}/></a></div></footer>}
