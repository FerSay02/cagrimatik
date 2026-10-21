import { ArrowRight, Check, Copy, Mail, MessageSquareText } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

type Fields = { name: string; company: string; email: string; solution: string; message: string }
const empty: Fields = { name: '', company: '', email: '', solution: '', message: '' }
const address = import.meta.env.VITE_CONTACT_EMAIL as string | undefined

export default function Contact() {
  const { t } = useTranslation()
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [notice, setNotice] = useState('')
  const update = (key: keyof Fields, value: string) => {
    setFields(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
    setNotice('')
  }
  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {}
    for (const key of Object.keys(fields) as (keyof Fields)[]) {
      if (!fields[key].trim()) next[key] = t('forms.required')
      else if (fields[key].length > (key === 'message' ? 1000 : 120)) next[key] = t('forms.tooLong')
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) next.email = t('forms.emailInvalid')
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const content = () => `${t('forms.name')}: ${fields.name}\n${t('forms.company')}: ${fields.company}\n${t('forms.email')}: ${fields.email}\n${t('forms.solution')}: ${t(`sectors.${fields.solution}.title`)}\n\n${fields.message}`
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(content())
      else {
        const temporary = document.createElement('textarea')
        temporary.value = content()
        temporary.style.position = 'fixed'
        temporary.style.opacity = '0'
        document.body.appendChild(temporary)
        temporary.select()
        const copied = document.execCommand('copy')
        temporary.remove()
        if (!copied) throw new Error('Copy failed')
      }
      setNotice(t('common.copied'))
    } catch { setNotice(t('common.copyFailed')) }
  }
  const handle = (e: FormEvent, kind: 'email' | 'copy') => {
    e.preventDefault()
    if (!validate()) return
    if (kind === 'email' && address) {
      window.location.href = `mailto:${address}?subject=${encodeURIComponent(`Çağrımatik demo — ${fields.company}`)}&body=${encodeURIComponent(content())}`
      setNotice(t('forms.notSent'))
    } else void copy()
  }
  const textField = (key: 'name' | 'company' | 'email') => <label key={key}>
    {t(`forms.${key}`)}
    <input type={key === 'email' ? 'email' : 'text'} value={fields[key]} onChange={e => update(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} maxLength={121}/>
    {errors[key] && <span id={`${key}-error`} className="field-error">{errors[key]}</span>}
  </label>
  return <section id="contact" className="section contact-section">
    <div className="container contact-layout">
      <div className="contact-copy">
        <div className="eyebrow">{t('contact.eyebrow')}</div>
        <h2>{t('contact.title')}</h2>
        <p>{t('contact.body')}</p>
        <div className="contact-aside"><span><MessageSquareText size={22}/></span><div><strong>{t('contact.aside')}</strong><p>{t('contact.asideBody')}</p></div></div>
      </div>
      <form className="contact-form" noValidate onSubmit={e => handle(e, address ? 'email' : 'copy')}>
        <div className="form-row">{textField('name')}{textField('company')}</div>
        <div className="form-row">{textField('email')}<label>{t('forms.solution')}
          <select value={fields.solution} onChange={e => update('solution', e.target.value)} aria-invalid={!!errors.solution} aria-describedby={errors.solution ? 'solution-error' : undefined}>
            <option value="">{t('forms.select')}</option>
            {(['legal','hotel','sales','commerce'] as const).map(s => <option key={s} value={s}>{t(`sectors.${s}.title`)}</option>)}
          </select>
          {errors.solution && <span id="solution-error" className="field-error">{errors.solution}</span>}
        </label></div>
        <label>{t('forms.message')}
          <textarea rows={5} value={fields.message} onChange={e => update('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} maxLength={1001}/>
          {errors.message && <span id="message-error" className="field-error">{errors.message}</span>}
        </label>
        <div className="form-footer"><p>{t(address ? 'forms.notSent' : 'forms.noEmail')}</p><div className="form-buttons">
          <button type="submit" className="button button-primary">{address ? <Mail size={17}/> : <Copy size={17}/>} {t(address ? 'forms.submit' : 'forms.copy')} <ArrowRight size={16}/></button>
          {address && <button type="button" className="button button-secondary" onClick={() => { if (validate()) void copy() }}><Copy size={16}/>{t('forms.copy')}</button>}
        </div></div>
        {notice && <div className="form-notice" role="status"><Check size={15}/>{notice}</div>}
      </form>
    </div>
  </section>
}
