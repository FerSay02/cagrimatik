import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
export default function Faq(){const {t}=useTranslation();const items=t('faq.items',{returnObjects:true}) as {q:string;a:string}[];return <section id="faq" className="section faq-section"><div className="container faq-layout"><div><div className="eyebrow">{t('faq.eyebrow')}</div><h2>{t('faq.title')}</h2></div><div className="faq-list">{items.map(item=><details key={item.q}><summary>{item.q}<Plus size={18}/></summary><p>{item.a}</p></details>)}</div></div></section>}
