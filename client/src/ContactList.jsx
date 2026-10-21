import { Mail, Pencil, Phone, Star, Trash2, UsersRound } from 'lucide-react'

const avatarColors = [
  'bg-emerald-100 text-emerald-800',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-cyan-100 text-cyan-700',
]

const ContactList = ({ contacts, isLoading, hasSearch, onDelete, onEdit }) => {
  if (isLoading) {
    return <ul className="space-y-2" aria-label="Loading contacts">{Array.from({ length: 5 }, (_, index) => <li key={index} className="h-[68px] animate-pulse rounded-lg border border-slate-100 bg-slate-50" />)}</ul>
  }

  return (
    contacts.length ? (
      <ul className="space-y-2">
        {contacts.map((contact, index) => (
          <li className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/20 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-3 sm:px-3" key={contact._id}>
            <div className={`grid size-9 place-items-center rounded-full text-sm font-bold sm:size-10 ${avatarColors[index % avatarColors.length]}`} aria-hidden="true">{contact.name?.trim().charAt(0).toUpperCase() || '?'}</div>
            <div className="min-w-0">
              <strong className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-bold text-slate-800 sm:flex-nowrap">
                <span className="truncate">{contact.name}</span>
                {contact.isFavorite && <Star size={14} className="shrink-0 fill-amber-400 text-amber-500" aria-label="Favorite" />}
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{contact.category || 'Other'}</span>
              </strong>
              <div className="mt-1 flex min-w-0 flex-col gap-x-4 gap-y-1 text-[11px] leading-4 text-slate-500 sm:flex-row sm:items-center sm:text-xs">
                <a className="flex min-w-0 items-center gap-1.5 truncate text-inherit no-underline hover:text-emerald-800" href={`tel:${contact.phone}`}><Phone size={12} className="shrink-0" aria-hidden="true" /><span className="truncate">{contact.phone}</span></a>
                <a className="flex min-w-0 items-center gap-1.5 truncate text-inherit no-underline hover:text-emerald-800" href={`mailto:${contact.email}`}><Mail size={12} className="shrink-0" aria-hidden="true" /><span className="truncate">{contact.email}</span></a>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="grid size-9 place-items-center rounded-md bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 sm:size-8" type="button" onClick={() => onEdit(contact)} aria-label={`Edit ${contact.name}`} title="Edit contact"><Pencil size={15} aria-hidden="true" /></button>
              <button className="grid size-9 place-items-center rounded-md bg-red-50 text-red-600 transition hover:bg-red-100 sm:size-8" type="button" onClick={() => onDelete(contact)} aria-label={`Delete ${contact.name}`} title="Delete contact"><Trash2 size={15} aria-hidden="true" /></button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
        <div>
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-800"><UsersRound size={19} aria-hidden="true" /></span>
          <p className="mt-3 text-sm font-bold text-slate-700">{hasSearch ? 'No contacts found' : 'Your directory is ready'}</p>
          <p className="mt-1 text-xs text-slate-500">{hasSearch ? 'Try a different search or category.' : 'Add a contact to get your directory started.'}</p>
        </div>
      </div>
    )
  )
}

export default ContactList
