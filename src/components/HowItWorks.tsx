import { AudioLines, GitBranch, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
const icons = [Settings2, AudioLines, GitBranch]
export default function HowItWorks() { const {t}=useTranslation(); return <section id="how" className="section how-section"><div className="container"><div className="center-heading"><div className="eyebrow">{t('how.eyebrow')}</div><h2>{t('how.title')}</h2><p>{t('how.body')}</p></div><div className="steps-grid">{[1,2,3].map((n,i)=>{const Icon=icons[i]; const key=['one','two','three'][i];return <div className="how-step" key={n}><span className="step-top"><span>0{n}</span><i/></span><span className="how-icon"><Icon size={26}/></span><h3>{t(`how.${key}`)}</h3><p>{t(`how.${key}Body`)}</p></div>})}</div></div></section> }
