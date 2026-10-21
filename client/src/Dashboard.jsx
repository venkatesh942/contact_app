import React, { useEffect, useState } from 'react'
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    LogOut,
    Mail,
    Plus,
    Search,
    UsersRound,
    X,
    Zap,
} from 'lucide-react'
import API from './api'
import ContactForm from './ContactForm'
import ContactList from './ContactList'

const PAGE_SIZE = 6
const CATEGORIES = ['All', 'Family', 'Friends', 'Work', 'Other']

const getRequestError = (error, fallback) => error.response?.data?.message || fallback

const Dashboard = ({ user, onLogout }) => {
    const [contacts, setContacts] = useState([])
    const [total, setTotal] = useState(0)
    const [totalContacts, setTotalContacts] = useState(0)
    const [recentlyAdded, setRecentlyAdded] = useState(0)
    const [pages, setPages] = useState(1)
    const [page, setPage] = useState(1)
    const [category, setCategory] = useState('All')
    const [categoryCounts, setCategoryCounts] = useState({})
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [requestError, setRequestError] = useState('')
    const [actionError, setActionError] = useState('')
    const [activeModal, setActiveModal] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [formVersion, setFormVersion] = useState(0)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim())
            setPage(1)
        }, 300)
        return () => window.clearTimeout(timer)
    }, [search])

    useEffect(() => {
        const controller = new AbortController()
        setIsLoading(true)
        setRequestError('')

        API.get('/', {
            params: { search: debouncedSearch, category: category === 'All' ? undefined : category, page, limit: PAGE_SIZE },
            signal: controller.signal,
        }).then(({ data }) => {
            setContacts(data.contacts)
            setTotal(data.total)
            setTotalContacts(data.totalContacts)
            setRecentlyAdded(data.recentlyAdded)
            setCategoryCounts(data.categoryCounts || {})
            setPages(Math.max(data.pages, 1))
        }).catch((error) => {
            if (!controller.signal.aborted) {
                setRequestError(getRequestError(error, 'Could not load contacts. Please try again.'))
            }
        }).finally(() => {
            if (!controller.signal.aborted) setIsLoading(false)
        })

        return () => controller.abort()
    }, [category, debouncedSearch, page, reloadKey])

    useEffect(() => {
        if (!activeModal) return undefined
        const closeOnEscape = (event) => {
            if (event.key === 'Escape' && !isSaving) setActiveModal(null)
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [activeModal, isSaving])

    const handleSave = async (contactData) => {
        setActionError('')
        setIsSaving(true)
        try {
            if (activeModal?.type === 'edit') {
                await API.put(`/${activeModal.contact._id}`, contactData)
                setActiveModal(null)
            } else {
                await API.post('/', contactData)
                setFormVersion((version) => version + 1)
                setSearch('')
                setDebouncedSearch('')
                setPage(1)
            }
            setReloadKey((key) => key + 1)
        } catch (error) {
            setActionError(getRequestError(error, 'Could not save this contact. Please try again.'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (activeModal?.type !== 'delete') return
        setActionError('')
        setIsSaving(true)
        try {
            await API.delete(`/${activeModal.contact._id}`)
            setActiveModal(null)
            if (contacts.length === 1 && page > 1) setPage((currentPage) => currentPage - 1)
            setReloadKey((key) => key + 1)
        } catch (error) {
            setActionError(getRequestError(error, 'Could not delete this contact. Please try again.'))
        } finally {
            setIsSaving(false)
        }
    }

    const focusAddForm = () => {
        const input = document.getElementById('new-contact-name')
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        input?.focus({ preventScroll: true })
    }

    const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0
    const lastResult = Math.min(page * PAGE_SIZE, total)
    const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

    return (
        <main className="min-h-screen bg-[#f4f9f7] text-slate-800">
            <header className="border-b border-emerald-100 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
                    <a className="flex min-w-0 items-center gap-2.5 text-emerald-900 no-underline sm:gap-3" href="#dashboard" aria-label="Contacts Book home">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl rounded-bl-sm bg-emerald-800 font-serif text-xl font-bold text-white">C</span>
                        <span className="truncate text-base font-bold tracking-tight sm:text-lg">Contacts Book</span>
                    </a>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-bold text-white sm:size-9" aria-hidden="true">
                            {user.name?.trim().charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="hidden max-w-40 truncate text-sm font-semibold text-slate-700 sm:block">{user.name}</span>
                        <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800 sm:px-3" type="button" onClick={() => setActiveModal({ type: 'logout' })}>
                            <LogOut size={15} aria-hidden="true" />
                            <span className="hidden sm:inline">Log out</span>
                        </button>
                    </div>
                </div>
            </header>

            <div id="dashboard" className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
                <section className="mb-3 flex min-h-24 items-center justify-between gap-3 overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-4 py-4 sm:mb-4 sm:gap-4 sm:px-7 sm:py-5">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                        <span className="hidden text-3xl sm:block" aria-hidden="true">👋</span>
                        <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Your personal directory</p>
                            <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-2xl">{greeting}, {user.name?.split(' ')[0] || 'there'}!</h1>
                            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Manage your contacts and keep everyone important close.</p>
                        </div>
                    </div>
                    <UsersRound className="mr-2 hidden size-12 shrink-0 text-emerald-700/30 sm:block" aria-hidden="true" />
                </section>

                <section className="mb-3 grid grid-cols-2 gap-2.5 sm:mb-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3" aria-label="Contact summary">
                    <article className="flex min-h-20 items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 sm:size-11"><UsersRound size={18} aria-hidden="true" /></span>
                        <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-500 sm:text-xs">Total contacts</p><p className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">{isLoading && !totalContacts ? '...' : totalContacts}</p><p className="text-[10px] text-slate-400 sm:text-xs">Your saved contacts</p></div>
                    </article>
                    <article className="flex min-h-20 items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 sm:size-11"><CalendarDays size={18} aria-hidden="true" /></span>
                        <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-500 sm:text-xs">Recently added</p><p className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">{isLoading && !totalContacts ? '...' : recentlyAdded}</p><p className="text-[10px] text-slate-400 sm:text-xs">In the last 7 days</p></div>
                    </article>
                    <article className="col-span-2 flex min-h-16 items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:col-span-2 sm:gap-3 sm:p-4 lg:col-span-1">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 sm:size-11"><Zap size={18} aria-hidden="true" /></span>
                            <div><p className="text-xs font-semibold text-slate-600">Quick action</p><p className="text-xs text-slate-400">Add a new contact</p></div>
                        </div>
                        <button type="button" onClick={focusAddForm} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-xs font-bold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:gap-2 sm:px-3">
                            <Plus size={15} aria-hidden="true" /> Add contact
                        </button>
                    </article>
                </section>

                {requestError && <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert"><CircleAlert size={17} className="mt-0.5 shrink-0" />{requestError}</div>}

                <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.65fr)]">
                    <section id="add-contact" className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="add-contact-title">
                        <div className="mb-4 flex items-center gap-3 sm:mb-5">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-800 text-white sm:size-10"><Plus size={19} aria-hidden="true" /></span>
                            <div><h2 id="add-contact-title" className="font-bold text-slate-800">Add new contact</h2><p className="text-xs text-slate-500">Fill in the details to save a new contact.</p></div>
                        </div>
                        <ContactForm key={`new-${formVersion}`} onSubmit={handleSave} isSaving={isSaving} error={actionError} />
                    </section>

                    <section className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5" aria-labelledby="contacts-title">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <UsersRound size={22} className="shrink-0 text-emerald-800" aria-hidden="true" />
                                <div><h2 id="contacts-title" className="font-bold text-slate-800">My contacts</h2><p className="text-xs text-slate-500">{totalContacts} {totalContacts === 1 ? 'contact' : 'contacts'} in your directory</p></div>
                            </div>
                            <label className="relative block w-full sm:max-w-64">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                <input type="text" role="searchbox" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone or email..." aria-label="Search contacts by name, phone, or email" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100" />
                                {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={14} /></button>}
                            </label>
                        </div>

                        <div className="-mx-1 mb-3 flex touch-pan-x gap-1.5 overflow-x-auto px-1 pb-2 sm:mb-4 sm:gap-2" role="group" aria-label="Filter contacts by category">
                            {CATEGORIES.map((categoryName) => {
                                const count = categoryName === 'All'
                                    ? Object.values(categoryCounts).reduce((sum, value) => sum + value, 0)
                                    : categoryCounts[categoryName] || 0
                                const isActive = category === categoryName
                                return (
                                    <button
                                        key={categoryName}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => { setCategory(categoryName); setPage(1) }}
                                        className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition sm:gap-2 sm:px-3 ${isActive ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                    >
                                        {categoryName}
                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div>
                        <ContactList
                            contacts={contacts}
                            isLoading={isLoading}
                            hasSearch={Boolean(debouncedSearch) || category !== 'All'}
                            onEdit={(contact) => { setActionError(''); setActiveModal({ type: 'edit', contact }) }}
                            onDelete={(contact) => { setActionError(''); setActiveModal({ type: 'delete', contact }) }}
                        />
                        </div>

                        <footer className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span>Showing {firstResult}-{lastResult} of {total} {total === 1 ? 'result' : 'results'}</span>
                            <nav className="flex items-center justify-between gap-2 sm:justify-end" aria-label="Contact pages">
                                <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((currentPage) => currentPage - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-slate-200 px-2.5 font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} />Previous</button>
                                <span className="min-w-16 text-center">Page {page} of {pages}</span>
                                <button type="button" disabled={page >= pages || isLoading} onClick={() => setPage((currentPage) => currentPage + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-slate-200 px-2.5 font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={15} /></button>
                            </nav>
                        </footer>
                    </section>
                </div>
            </div>

            {activeModal?.type === 'edit' && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setActiveModal(null) }}>
                    <section className="my-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="edit-title">
                        <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="edit-title" className="text-lg font-bold text-slate-800">Edit contact</h2><p className="mt-1 text-sm text-slate-500">Update {activeModal.contact.name}'s details.</p></div><button type="button" onClick={() => setActiveModal(null)} disabled={isSaving} aria-label="Close edit dialog" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
                        <ContactForm key={activeModal.contact._id} existingContact={activeModal.contact} onSubmit={handleSave} onCancel={() => setActiveModal(null)} isSaving={isSaving} error={actionError} />
                    </section>
                </div>
            )}

            {activeModal?.type === 'delete' && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setActiveModal(null) }}>
                    <section className="my-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
                        <div className="mb-4 grid size-10 place-items-center rounded-full bg-red-50 text-red-600"><CircleAlert size={20} /></div>
                        <h2 id="delete-title" className="text-lg font-bold text-slate-800">Delete this contact?</h2>
                        <p id="delete-description" className="mt-2 text-sm leading-6 text-slate-600">{activeModal.contact.name} will be removed from your directory. This action cannot be undone.</p>
                        {actionError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{actionError}</p>}
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button type="button" disabled={isSaving} onClick={() => setActiveModal(null)} className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                            <button type="button" disabled={isSaving} onClick={handleDelete} className="min-h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{isSaving ? 'Deleting...' : 'Delete contact'}</button>
                        </div>
                    </section>
                </div>
            )}

            {activeModal?.type === 'logout' && (
                <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setActiveModal(null) }}>
                    <section className="my-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description">
                        <div className="mb-4 grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-800"><LogOut size={19} aria-hidden="true" /></div>
                        <h2 id="logout-title" className="text-lg font-bold text-slate-800">Log out of your account?</h2>
                        <p id="logout-description" className="mt-2 text-sm leading-6 text-slate-600">Are you sure you want to log out? You will need to sign in again to access your contacts.</p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setActiveModal(null)} className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Stay logged in</button>
                            <button type="button" onClick={onLogout} className="min-h-10 rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white hover:bg-emerald-900">Yes, log out</button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    )
}

export default Dashboard
