import React, { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, Heart, Mail, Phone, ShieldCheck, Star, UsersRound } from 'lucide-react'
import { AuthAPI } from './api'

const AuthForm = ({ onAuthenticated }) => {
    const [mode, setMode] = useState('login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isSignup = mode === 'signup'

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        const validationErrors = {}

        if (isSignup && !name.trim()) {
            validationErrors.name = 'Enter your full name.'
        }
        if (!email.trim()) {
            validationErrors.email = 'Enter your email address.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            validationErrors.email = 'Enter a valid email address.'
        }
        if (password.length < 8) {
            validationErrors.password = 'Password must be at least 8 characters.'
        }
        if (isSignup && !confirmPassword) {
            validationErrors.confirmPassword = 'Confirm your password.'
        } else if (isSignup && password !== confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match.'
        }

        setFieldErrors(validationErrors)
        if (Object.keys(validationErrors).length) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await AuthAPI.post(isSignup ? '/signup' : '/login', {
                ...(isSignup && { name: name.trim() }),
                email: email.trim(),
                password,
            })
            onAuthenticated(response.data)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to complete your request. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const updateField = (field, setter) => (event) => {
        setter(event.target.value)
        setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
        setError('')
    }

    return (
        <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
            <section className="relative isolate flex min-h-0 flex-col justify-between overflow-hidden bg-[#073f35] px-5 py-5 text-white sm:min-h-[360px] sm:px-10 sm:py-9 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16" aria-label="Contacts Book introduction">
                <div className="pointer-events-none absolute -left-32 top-24 -z-10 size-96 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -left-16 top-40 -z-10 size-64 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-96 rounded-full bg-emerald-300/10 blur-3xl" />
                <header className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl rounded-bl-sm bg-white font-serif text-2xl font-bold text-emerald-900 shadow-lg shadow-black/10" aria-hidden="true">C</div>
                    <div>
                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">Your personal directory</p>
                        <h1 className="font-serif text-xl font-bold text-white">Contacts book</h1>
                    </div>
                </header>

                <div className="relative mx-auto my-5 w-full max-w-lg sm:my-9 sm:flex-1 lg:my-0 lg:flex lg:flex-col lg:justify-center">
                    <div className="mb-5 max-w-md sm:mb-7">
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-emerald-100 sm:mb-4 sm:text-[11px]">
                            <ShieldCheck size={14} aria-hidden="true" /> A little closer, every day
                        </span>
                        <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
                            {isSignup ? 'Make room for your people.' : 'Your people, all in one place.'}
                        </h2>
                        <p className="mt-2 max-w-sm text-xs leading-5 text-emerald-100/75 sm:mt-4 sm:text-base sm:leading-6">
                            Keep the people who matter close with one thoughtful, private directory.
                        </p>
                    </div>

                    <div className="relative hidden max-w-md rounded-2xl border border-white/15 bg-white p-4 text-slate-800 shadow-2xl shadow-black/20 sm:block sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Your circle</p>
                                <p className="mt-0.5 text-[10px] text-slate-400">A few of your favorites</p>
                            </div>
                            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><UsersRound size={16} aria-hidden="true" /></span>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { initials: 'AM', name: 'Alex Morgan', detail: 'Family', style: 'bg-amber-100 text-amber-800', Icon: Heart },
                                { initials: 'JR', name: 'Jamie Rivera', detail: 'Friends', style: 'bg-violet-100 text-violet-800', Icon: Star },
                                { initials: 'SK', name: 'Sam Kim', detail: 'Work', style: 'bg-sky-100 text-sky-800', Icon: BriefcaseBusiness },
                            ].map(({ initials, name: contactName, detail, style, Icon }) => (
                                <div key={contactName} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                                    <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-bold ${style}`}>{initials}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-bold text-slate-800">{contactName}</span>
                                        <span className="mt-0.5 block text-[10px] text-slate-400">{detail}</span>
                                    </span>
                                    <Icon size={15} className="text-emerald-700" aria-hidden="true" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                            <Phone size={12} aria-hidden="true" />
                            <span>All your important connections, close at hand</span>
                        </div>
                    </div>
                </div>

                <p className="hidden items-center gap-2 text-xs text-emerald-100/60 lg:flex"><ShieldCheck size={14} aria-hidden="true" />Your contacts stay personal and organized.</p>
            </section>

            <section className="flex min-h-0 items-center justify-center bg-[#f7faf8] px-4 py-7 sm:px-8 sm:py-10 lg:min-h-screen lg:px-10 xl:px-16" aria-labelledby="auth-title">
                <div className="w-full max-w-md">
                    <div className="mb-5 lg:hidden sm:mb-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Contacts book</p>
                        <p className="mt-2 font-serif text-2xl font-bold text-slate-800">{isSignup ? 'Make room for your people.' : 'Your people, all in one place.'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/[0.04] sm:p-9">
                        <div className="mb-6 sm:mb-7">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Private by design</p>
                            <h2 id="auth-title" className="font-serif text-3xl font-bold leading-tight text-slate-800">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{isSignup ? 'Create an account to keep your contacts securely together.' : 'Sign in to open your personal contact directory.'}</p>
                        </div>
                        <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit} noValidate>
                            {isSignup && (
                                <label className="block space-y-1.5">
                                    <span className="text-xs font-semibold text-slate-700">Full name</span>
                                    <input id="auth-name" type="text" autoComplete="name" value={name} onChange={updateField('name', setName)} maxLength={80} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined} className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100" />
                                    {fieldErrors.name && <span className="block text-xs text-red-700" id="auth-name-error">{fieldErrors.name}</span>}
                                </label>
                            )}
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-slate-700">Email address</span>
                                <span className="relative block">
                                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                    <input id="auth-email" type="email" autoComplete="email" value={email} onChange={updateField('email', setEmail)} maxLength={254} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined} className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100" />
                                </span>
                                {fieldErrors.email && <span className="block text-xs text-red-700" id="auth-email-error">{fieldErrors.email}</span>}
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-slate-700">Password</span>
                                <span className="relative block">
                                    <input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={updateField('password', setPassword)} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined} className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-3 pr-11 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100" />
                                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">
                                        {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                    </button>
                                </span>
                                {fieldErrors.password && <span className="block text-xs text-red-700" id="auth-password-error">{fieldErrors.password}</span>}
                            </label>
                            {isSignup && (
                                <label className="block space-y-1.5">
                                    <span className="text-xs font-semibold text-slate-700">Confirm password</span>
                                    <span className="relative block">
                                        <input id="auth-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={updateField('confirmPassword', setConfirmPassword)} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'auth-confirm-password-error' : undefined} className="min-h-11 w-full rounded-lg border border-slate-200 py-2 pl-3 pr-11 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100" />
                                        <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">
                                            {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                        </button>
                                    </span>
                                    {fieldErrors.confirmPassword && <span className="block text-xs text-red-700" id="auth-confirm-password-error">{fieldErrors.confirmPassword}</span>}
                                </label>
                            )}
                            {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{error}</p>}
                            <button className="flex min-h-11 w-full items-center justify-between rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
                                <ArrowRight size={16} aria-hidden="true" />
                            </button>
                        </form>
                        <p className="mt-6 text-center text-xs text-slate-500">
                            {isSignup ? 'Already have an account?' : 'New to Contacts book?'}{' '}
                            <button className="font-bold text-emerald-800 hover:underline" type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setFieldErrors({}) }}>
                                {isSignup ? 'Log in' : 'Create account'}
                            </button>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AuthForm