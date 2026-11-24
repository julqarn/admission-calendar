import { useState } from 'react'
import type { CustomDeadline, Entry } from '../types'
import {
  bn,
  daysUntil,
  fmtDate,
  sortByExam,
} from '../lib/utils'
import { loadCustomDeadlines, saveCustomDeadlines } from '../lib/store'

interface Props {
  entries: Entry[]
  onOpenEntry: (id: number) => void
}

export default function Deadlines({ entries, onOpenEntry }: Props) {
  const [custom, setCustom] = useState<CustomDeadline[]>(() =>
    loadCustomDeadlines(),
  )
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('23:59')

  const appDeadlines = sortByExam(
    entries.filter((e) => e.appClose !== null),
  )

  const addCustom = () => {
    if (!title.trim() || !date) return
    const item: CustomDeadline = {
      id: `cd-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
    }
    const next = [...custom, item].sort((a, b) =>
      a.date.localeCompare(b.date),
    )
    setCustom(next)
    saveCustomDeadlines(next)
    setTitle('')
    setDescription('')
    setDate('')
    setTime('23:59')
  }

  const removeCustom = (id: string) => {
    const next = custom.filter((c) => c.id !== id)
    setCustom(next)
    saveCustomDeadlines(next)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          ডেডলাইন ট্র্যাকার
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          আবেদনের শেষ তারিখগুলো এক জায়গায় — মেয়াদোত্তীর্ণ আবেদন লাল চিহ্নে
          দেখানো হয়।
        </p>
      </div>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          আবেদনের শেষ তারিখ (অফিসিয়াল)
        </h3>
        <div className="mt-3 space-y-2">
          {appDeadlines.map((e) => {
            const d = daysUntil(e.appClose)
            const expired = d !== null && d < 0
            return (
              <button
                key={e.id}
                onClick={() => onOpenEntry(e.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm ${
                  expired
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <span>
                  <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                    {e.name}
                  </span>
                  <span className="num block text-xs text-zinc-500 dark:text-zinc-400">
                    শেষ: {e.appClose ? fmtDate(e.appClose) : 'ঘোষণা হয়নি'}
                  </span>
                </span>
                <span
                  className={`num shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    expired
                      ? 'bg-red-600 text-white'
                      : d !== null && d <= 3
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}
                >
                  {d === null
                    ? ''
                    : expired
                      ? `শেষ হয়েছে (${bn(Math.abs(d))} দিন আগে)`
                      : d === 0
                        ? 'আজই শেষ'
                        : `আর ${bn(d)} দিন`}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          আমার নিজের ডেডলাইন যোগ করুন
        </h3>
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="শিরোনাম (যেমন: বুয়েটের ফি জমা)"
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বিবরণ (ঐচ্ছিক)"
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="num rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="শেষ তারিখ"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="num rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="সময়"
            />
          </div>
          <button
            onClick={addCustom}
            disabled={!title.trim() || !date}
            className="mt-3 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900"
          >
            ডেডলাইন যোগ করুন
          </button>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            আপনার যোগ করা ডেডলাইন শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে।
          </p>
        </div>

        {custom.length > 0 && (
          <div className="mt-3 space-y-2">
            {custom.map((c) => {
              const d = daysUntil(c.date)
              const expired = d !== null && d < 0
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                    expired
                      ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                      {c.title}
                    </span>
                    {c.description && (
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        {c.description}
                      </span>
                    )}
                    <span className="num block text-xs text-zinc-500 dark:text-zinc-400">
                      {fmtDate(c.date)} • {bn(c.time)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`num rounded-full px-2.5 py-1 text-xs font-bold ${
                        expired
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      }`}
                    >
                      {d === null
                        ? ''
                        : expired
                          ? 'শেষ হয়েছে'
                          : d === 0
                            ? 'আজই শেষ'
                            : `আর ${bn(d)} দিন`}
                    </span>
                    <button
                      onClick={() => removeCustom(c.id)}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                      aria-label="মুছে ফেলুন"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
