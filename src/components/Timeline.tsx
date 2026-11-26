import { useMemo, useState } from 'react'
import type { Entry } from '../types'
import {
  bn,
  examStartDate,
  fmtDate,
  nextExam,
  sortByExam,
} from '../lib/utils'
import Countdown from './Countdown'
import EntryDetail from './EntryDetail'
import { EmptyState } from './Shared'

interface Props {
  entries: Entry[]
  query: string
  verificationDate: string
  myCalendar: number[]
  onToggleMyCalendar: (id: number) => void
}

export default function Timeline({
  entries,
  query,
  verificationDate,
  myCalendar,
  onToggleMyCalendar,
}: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)
  const sorted = useMemo(() => sortByExam(entries), [entries])
  const q = query.trim().toLowerCase()
  const filtered = q
    ? sorted.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.unit.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      )
    : sorted
  const next = nextExam(entries, new Date())

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          পরীক্ষার সময়সূচি
        </h2>
        <button
          onClick={() => window.print()}
          className="no-print rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          ⬇ টাইমটেবিল ডাউনলোড (PDF / প্রিন্ট)
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="কিছু খুঁজে পাওয়া যায়নি"
          body="অন্য নাম বা ইউনিট লিখে আবার চেষ্টা করুন।"
        />
      ) : (
        <div id="print-area" className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] border-collapse bg-white text-left dark:bg-zinc-900">
            <thead>
              <tr className="bg-zinc-900 text-white dark:bg-black">
                <th className="px-4 py-3 text-sm font-semibold">বিশ্ববিদ্যালয়</th>
                <th className="px-4 py-3 text-sm font-semibold">পরীক্ষার তারিখ</th>
                <th className="px-4 py-3 text-sm font-semibold">বাকি সময়</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const start = examStartDate(e)
                const isNext = next !== null && next.id === e.id
                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={`cursor-pointer border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60 ${
                      isNext
                        ? 'bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60'
                        : 'odd:bg-white even:bg-zinc-50/60 dark:odd:bg-zinc-900 dark:even:bg-zinc-900/60'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                        {e.name}
                        {isNext && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                            সবচেয়ে কাছের পরীক্ষা
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {e.unit}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">
                      {e.examDate ? (
                        <>
                          <span className="num font-semibold">
                            {fmtDate(e.examDate)}
                          </span>
                          {e.examTime && (
                            <span className="num block text-xs text-zinc-500 dark:text-zinc-400">
                              {bn(e.examTime)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">
                          ঘোষণা হয়নি
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {start ? (
                        <Countdown target={start} compact />
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">
                          ঘোষণা হয়নি
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        তথ্য যাচাইয়ের তারিখ:{' '}
        <span className="num">{fmtDate(verificationDate)}</span> • কোনো সারিতে ক্লিক করলে
        বিস্তারিত দেখা যাবে। "ঘোষণা হয়নি" মানে {fmtDate(verificationDate)} পর্যন্ত
        অফিসিয়াল কোনো তথ্য পাওয়া যায়নি।
      </p>

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
