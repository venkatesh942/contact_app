import React, { useEffect, useRef, useState } from 'react'
import { BriefcaseBusiness, Check, ChevronDown, Heart, Plus, Save, Tag, UsersRound, X } from 'lucide-react'

const inputClasses = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100'
const categoryOptions = [
  { name: 'Family', Icon: UsersRound, iconClasses: 'bg-rose-50 text-rose-600' },
  { name: 'Friends', Icon: Heart, iconClasses: 'bg-violet-50 text-violet-600' },
  { name: 'Work', Icon: BriefcaseBusiness, iconClasses: 'bg-blue-50 text-blue-600' },
  { name: 'Other', Icon: Tag, iconClasses: 'bg-amber-50 text-amber-600' },
]

const ContactForm = ({ onSubmit, existingContact, onCancel, isSaving = false, error = '' }) => {
  const [name, setName] = useState(existingContact?.name || '')
  const [phone, setPhone] = useState(existingContact?.phone || '')
  const [email, setEmail] = useState(existingContact?.email || '')
  const [category, setCategory] = useState(existingContact?.category || 'Other')
  const [isFavorite, setIsFavorite] = useState(Boolean(existingContact?.isFavorite))
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const categoryRef = useRef(null)
  const categoryButtonRef = useRef(null)
  const optionRefs = useRef([])

  useEffect(() => {
    if (!isCategoryOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!categoryRef.current?.contains(event.target)) setIsCategoryOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isCategoryOpen])

  const handleCategoryKeyDown = (event) => {
    const selectedIndex = categoryOptions.findIndex((option) => option.name === category)
    if (event.key === 'Escape' && isCategoryOpen) {
      event.preventDefault()
      setIsCategoryOpen(false)
      categoryButtonRef.current?.focus()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      const focusedIndex = optionRefs.current.findIndex((option) => option === document.activeElement)
      const nextIndex = isCategoryOpen && focusedIndex >= 0
        ? (focusedIndex + offset + categoryOptions.length) % categoryOptions.length
        : selectedIndex
      if (!isCategoryOpen) setIsCategoryOpen(true)
      window.requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus())
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === categoryButtonRef.current) {
        event.preventDefault()
        setIsCategoryOpen((open) => !open)
      }
    }
  }

  const selectCategory = (value) => {
    setCategory(value)
    setIsCategoryOpen(false)
    categoryButtonRef.current?.focus()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    if (!normalizedName) nextErrors.name = 'Enter a contact name.'
    if (!/^\d{10}$/.test(phone)) nextErrors.phone = 'Enter a 10-digit phone number.'
    if (!normalizedEmail) nextErrors.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit({ name: normalizedName, phone, email: normalizedEmail, category, isFavorite })
  }

  const update = (field, setter) => (event) => {
    setter(event.target.value)
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  const updatePhone = (event) => {
    setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
    setErrors((currentErrors) => ({ ...currentErrors, phone: '' }))
  }

  return (
    <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit} noValidate>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Full name <span className="text-red-500">*</span></span>
        <input id={existingContact ? 'edit-contact-name' : 'new-contact-name'} type="text" placeholder="e.g. Jordan Lee" value={name} onChange={update('name', setName)} autoComplete="name" maxLength={80} aria-invalid={Boolean(errors.name)} className={`${inputClasses} ${errors.name ? 'border-red-400' : ''}`} />
        {errors.name && <span className="block text-xs text-red-700">{errors.name}</span>}
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Phone number <span className="text-red-500">*</span></span>
        <input type="tel" placeholder="10-digit phone number" value={phone} onChange={updatePhone} autoComplete="tel" inputMode="numeric" maxLength={10} aria-invalid={Boolean(errors.phone)} className={`${inputClasses} ${errors.phone ? 'border-red-400' : ''}`} />
        {errors.phone && <span className="block text-xs text-red-700">{errors.phone}</span>}
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Email address <span className="text-red-500">*</span></span>
        <input type="email" placeholder="name@example.com" value={email} onChange={update('email', setEmail)} autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} className={`${inputClasses} ${errors.email ? 'border-red-400' : ''}`} />
        {errors.email && <span className="block text-xs text-red-700">{errors.email}</span>}
      </label>
      <div className="block space-y-1.5" ref={categoryRef} onKeyDown={handleCategoryKeyDown}>
        <span id="contact-category-label" className="block text-xs font-semibold text-slate-700">Category</span>
        <div className="relative">
          <button
            ref={categoryButtonRef}
            type="button"
            role="combobox"
            aria-labelledby="contact-category-label"
            aria-controls="contact-category-options"
            aria-expanded={isCategoryOpen}
            aria-haspopup="listbox"
            onClick={() => setIsCategoryOpen((open) => !open)}
            className="flex min-h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-emerald-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100"
          >
            <span className="flex items-center gap-2.5">
              {(() => {
                const selected = categoryOptions.find((option) => option.name === category) || categoryOptions[3]
                const Icon = selected.Icon
                return <><span className={`grid size-7 place-items-center rounded-md ${selected.iconClasses}`}><Icon size={15} aria-hidden="true" /></span>{selected.name}</>
              })()}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {isCategoryOpen && (
            <ul id="contact-category-options" role="listbox" aria-labelledby="contact-category-label" className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              {categoryOptions.map(({ name: option, Icon, iconClasses }, index) => (
                <li key={option} role="presentation">
                  <button
                    ref={(element) => { optionRefs.current[index] = element }}
                    type="button"
                    role="option"
                    aria-selected={category === option}
                    onClick={() => selectCategory(option)}
                    className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition ${category === option ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className={`grid size-7 place-items-center rounded-md ${iconClasses}`}><Icon size={15} aria-hidden="true" /></span>
                    <span className="flex-1">{option}</span>
                    {category === option && <Check size={16} className="text-emerald-700" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={isFavorite} onChange={(event) => setIsFavorite(event.target.checked)} className="size-4 accent-amber-500" />
        <span>Mark as favorite</span>
      </label>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{error}</p>}
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSaving}>
          {existingContact ? <Save size={16} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {isSaving ? 'Saving...' : existingContact ? 'Save changes' : 'Add contact'}
        </button>
        {existingContact && <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={onCancel} disabled={isSaving}><X size={15} />Cancel</button>}
      </div>
    </form>
  )
}

export default ContactForm
