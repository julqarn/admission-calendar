import { useMemo, useState } from 'react'
import type { Notice } from '../types'
import { bn, fmtDate, relativeDay } from '../lib/utils'

interface Props {
  notices: Notice[]
  onOpenEntry: (id: number) => void
}

export default function Notices({ notices, onOpenEntry }: Props) {
  const [query, setQuery] = useState('')
  const sorted = useMemo(
    () => [...notices].sort((a, b) => b.date.localeCompare(a.date)),
    [notices],
  )
  const q = query.trim().toLowerCase()
  const filtered = q
    ? sorted.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q),
      )
    : sorted

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">নোটিশ</h2>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        নতুন সার্কুলার, পরীক্ষার তারিখ পরিবর্তন, আবেদন বাড়ানো — সব আপডেট
        এখানে।
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="নোটিশ খুঁজুন…"
        className="mt-4 w-full max-w-md rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            কিছু খুঁজে পাওয়া যায়নি।
          </p>
        )}
        {filtered.map((n) => (
          <article
            key={n.id}
            className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <span className="num text-lg font-bold leading-none">
                {bn(n.date.slice(8, 10))}
              </span>
              <span className="num mt-0.5 text-[10px] leading-none">
                {fmtDate(n.date).split(' ')[1]} {bn(n.date.slice(0, 4))}
              </span>
            </div>
            <div className="min-w-0">
              <p className="num text-xs text-zinc-500 dark:text-zinc-400">
                {fmtDate(n.date)} • {relativeDay(n.date)}
              </p>
              <h3 className="mt-0.5 text-base font-bold leading-snug text-zinc-900 dark:text-white">
                {n.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {bn(n.body)}
              </p>
              {n.entryId !== null && (
                <button
                  onClick={() => onOpenEntry(n.entryId as number)}
                  className="mt-2 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  সংশ্লিষ্ট পরীক্ষা দেখুন →
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
