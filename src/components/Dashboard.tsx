import { useMemo } from 'react'
import type { Entry, Notice } from '../types'
import {
  applicationState,
  bn,
  daysUntil,
  fmtDate,
  nextExam,
  sortByExam,
} from '../lib/utils'
import { StatusBadge } from './Shared'

interface Props {
  entries: Entry[]
  notices: Notice[]
  totalUniversities: number
  distinctUniversities: number
  onOpenEntry: (id: number) => void
  onGoNotices: () => void
}

function Stat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="num text-3xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium leading-snug text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
    </div>
  )
}

export default function Dashboard({
  entries,
  notices,
  totalUniversities,
  distinctUniversities,
  onOpenEntry,
  onGoNotices,
}: Props) {
  const stats = useMemo(() => {
    const circular = entries.filter((e) => e.status === 'Circular Published').length
    const examAnnounced = entries.filter((e) => e.status === 'Exam Date Announced').length
    const ongoing = entries.filter((e) => applicationState(e) === 'ongoing').length
    const closingSoon = entries.filter((e) => {
      const d = daysUntil(e.appClose)
      return d !== null && d >= 0 && d <= 14
    }).length
    const upcomingExams = entries.filter((e) => {
      const d = daysUntil(e.examDate)
      return d !== null && d >= 0 && d <= 30
    }).length
    return { circular, examAnnounced, ongoing, closingSoon, upcomingExams }
  }, [entries])

  const next = nextExam(entries, new Date())
  const upcomingDeadlines = useMemo(
    () =>
      entries
        .filter((e) => {
          const d = daysUntil(e.appClose)
          return d !== null && d >= 0
        })
        .sort((a, b) => (a.appClose ?? '').localeCompare(b.appClose ?? ''))
        .slice(0, 5),
    [entries],
  )
  const latestNotices = useMemo(
    () =>
      [...notices]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [notices],
  )
  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) map.set(e.status, (map.get(e.status) ?? 0) + 1)
    return [...map.entries()]
  }, [entries])
  const maxStatus = Math.max(1, ...byStatus.map(([, n]) => n))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          ড্যাশবোর্ড
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          ২০২৬-২৭ শিক্ষাবর্ষের ভর্তি পরীক্ষার সার্বিক চিত্র — তথ্য যাচাইয়ের
          তারিখ <span className="num">২৪ নভেম্বর ২০২৬</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat value={bn(distinctUniversities)} label="বিশ্ববিদ্যালয় (স্বতন্ত্র)" />
        <Stat value={bn(entries.length)} label="ভর্তি পরীক্ষা / ব্যবস্থা" />
        <Stat value={bn(stats.circular)} label="সার্কুলার প্রকাশিত" />
        <Stat value={bn(stats.examAnnounced)} label="পরীক্ষার তারিখ ঘোষিত" />
        <Stat value={bn(stats.ongoing)} label="আবেদন চলমান" />
        <Stat value={bn(stats.closingSoon)} label="আগামী ১৪ দিনে আবেদন শেষ" />
        <Stat value={bn(stats.upcomingExams)} label="আগামী ৩০ দিনে পরীক্ষা" />
        <Stat value={bn(totalUniversities)} label="মাস্টার তালিকার সারি" />
      </div>

      {next && (
        <button
          onClick={() => onOpenEntry(next.id)}
          className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-left text-white shadow-sm hover:bg-emerald-700"
        >
          <p className="text-xs font-semibold opacity-90">
            সবচেয়ে কাছের পরীক্ষা
          </p>
          <p className="mt-1 text-lg font-bold leading-snug">{next.name}</p>
          <p className="num mt-0.5 text-sm opacity-95">
            {next.examDate ? fmtDate(next.examDate) : 'ঘোষণা হয়নি'}
            {next.examTime ? ` • ${bn(next.examTime)}` : ''}
          </p>
        </button>
      )}

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          অবস্থা অনুযায়ী ভর্তি পরীক্ষা
        </h3>
        <div className="mt-3 space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {byStatus.map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-36 shrink-0">
                <StatusBadge status={status as Entry['status']} />
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${(count / maxStatus) * 100}%` }}
                />
              </div>
              <span className="num w-8 text-right text-sm font-bold text-zinc-800 dark:text-zinc-100">
                {bn(count)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          আসন্ন আবেদনের শেষ তারিখ
        </h3>
        <div className="mt-3 space-y-2">
          {upcomingDeadlines.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              আসন্ন কোনো আবেদনের শেষ তারিখ নেই।
            </p>
          )}
          {upcomingDeadlines.map((e) => {
            const d = daysUntil(e.appClose)
            return (
              <button
                key={e.id}
                onClick={() => onOpenEntry(e.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
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
                    d !== null && d <= 3
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  }`}
                >
                  {d === 0 ? 'আজই শেষ' : `আর ${bn(d ?? 0)} দিন`}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            সর্বশেষ নোটিশ
          </h3>
          <button
            onClick={onGoNotices}
            className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            সব নোটিশ দেখুন →
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {latestNotices.map((n) => (
            <button
              key={n.id}
              onClick={() => onGoNotices()}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="num block text-xs text-zinc-500 dark:text-zinc-400">
                {fmtDate(n.date)}
              </span>
              <span className="mt-0.5 block text-sm font-bold text-zinc-900 dark:text-white">
                {n.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        পরীক্ষার তারিখ অনুযায়ী সাজানো সম্পূর্ণ তালিকা দেখতে সময়কাল ট্যাবে যান।
        সর্বমোট <span className="num">{bn(sortByExam(entries).length)}</span>টি
        ভর্তি পরীক্ষার তথ্য রয়েছে।
      </p>
    </div>
  )
}
