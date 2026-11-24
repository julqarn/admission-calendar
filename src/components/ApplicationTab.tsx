import { useState } from 'react'
import type { Entry } from '../types'
import {
  applicationState,
  bn,
  daysUntil,
  fmtDate,
} from '../lib/utils'
import EntryDetail from './EntryDetail'
import { EmptyState, StatusBadge } from './Shared'

interface Props {
  entries: Entry[]
  myCalendar: number[]
  onToggleMyCalendar: (id: number) => void
}

export default function ApplicationTab({
  entries,
  myCalendar,
  onToggleMyCalendar,
}: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)

  const withDates = entries.filter((e) => e.appStart && e.appClose)
  const ongoing = withDates.filter((e) => applicationState(e) === 'ongoing')
  const upcoming = withDates
    .filter((e) => applicationState(e) === 'upcoming')
    .sort((a, b) => (a.appStart ?? '').localeCompare(b.appStart ?? ''))
  const closed = withDates
    .filter((e) => applicationState(e) === 'closed')
    .sort((a, b) => (b.appClose ?? '').localeCompare(a.appClose ?? ''))
  const unknown = entries.filter((e) => !e.appStart || !e.appClose)

  const row = (e: Entry) => {
    const state = applicationState(e)
    const days = daysUntil(e.appClose)
    return (
      <button
        key={e.id}
        onClick={() => setSelected(e)}
        className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold leading-snug text-zinc-900 dark:text-white">
              {e.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{e.unit}</p>
          </div>
          <StatusBadge status={e.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">
            আবেদন:{' '}
            <span className="num font-semibold">
              {fmtDate(e.appStart)} – {fmtDate(e.appClose)}
            </span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-300">
            ফি:{' '}
            <span className="num font-semibold">
              {e.fee ? `${bn(e.fee)} টাকা` : 'ঘোষণা হয়নি'}
            </span>
          </span>
          {state === 'ongoing' && days !== null && (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {days === 0 ? 'আজই শেষ দিন' : `আর ${bn(days)} দিন বাকি`}
            </span>
          )}
          {state === 'upcoming' && (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              শুরু হতে{' '}
              {(() => {
                const d = daysUntil(e.appStart)
                return d !== null ? `${bn(d)} দিন বাকি` : ''
              })()}
            </span>
          )}
          {state === 'closed' && (
            <span className="font-semibold text-red-600 dark:text-red-400">
              আবেদন শেষ
            </span>
          )}
        </div>
        {e.website && (
          <span className="mt-3 inline-block rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
            আবেদন করুন ↗
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          চলমান আবেদন{' '}
          <span className="num rounded-full bg-emerald-600 px-2.5 py-0.5 text-sm text-white">
            {bn(ongoing.length)}
          </span>
        </h2>
        {ongoing.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="এই মুহূর্তে কোনো আবেদন চলমান নেই"
              body="নিচে আসন্ন আবেদনগুলো দেখুন।"
            />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {ongoing.map(row)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          আসন্ন আবেদন
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="কোনো আসন্ন আবেদন নেই"
              body="নতুন সার্কুলার প্রকাশ হলে এখানে যোগ হবে।"
            />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {upcoming.map(row)}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            আবেদন শেষ হয়েছে
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 opacity-80">
            {closed.map(row)}
          </div>
        </section>
      )}

      {unknown.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            আবেদনের তারিখ এখনো ঘোষণা হয়নি
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {unknown.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-left dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  {e.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {e.unit} • আবেদনের তারিখ ঘোষণা হয়নি
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <EntryDetail
          entry={selected}
          onClose={() => setSelected(null)}
          inMyCalendar={myCalendar.includes(selected.id)}
          onToggleMyCalendar={onToggleMyCalendar}
        />
      )}
    </div>
  )
}
