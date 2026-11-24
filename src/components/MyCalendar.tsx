import { useMemo } from 'react'
import type { Entry } from '../types'
import { bn, examStartDate, fmtDate, sortByExam } from '../lib/utils'
import Countdown from './Countdown'
import { EmptyState } from './Shared'

interface Props {
  entries: Entry[]
  myCalendar: number[]
  onToggleMyCalendar: (id: number) => void
  onOpenEntry: (id: number) => void
}

export default function MyCalendar({
  entries,
  myCalendar,
  onToggleMyCalendar,
  onOpenEntry,
}: Props) {
  const mine = useMemo(() => {
    const byId = new Map(entries.map((e) => [e.id, e]))
    return sortByExam(
      myCalendar
        .map((id) => byId.get(id))
        .filter((e): e is Entry => e !== undefined),
    )
  }, [entries, myCalendar])

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        আমার ক্যালেন্ডার
      </h2>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        আপনার পছন্দের ভর্তি পরীক্ষাগুলো এখানে সংরক্ষিত থাকে — শুধু আপনার
        ব্রাউজারে।
      </p>

      {mine.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="আপনার ক্যালেন্ডারে এখনো কিছু যোগ হয়নি"
            body="টাইমলাইন থেকে যেকোনো পরীক্ষার বিস্তারিত খুলে 'আমার ক্যালেন্ডারে যোগ করুন' বাটনে ক্লিক করুন।"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {mine.map((e) => {
            const start = examStartDate(e)
            return (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <button
                  onClick={() => onOpenEntry(e.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-bold text-zinc-900 dark:text-white">
                    {e.name}
                  </span>
                  <span className="num block text-xs text-zinc-500 dark:text-zinc-400">
                    {e.examDate ? fmtDate(e.examDate) : 'ঘোষণা হয়নি'}
                  </span>
                  {start && (
                    <span className="mt-0.5 block text-sm">
                      <Countdown target={start} compact />
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onToggleMyCalendar(e.id)}
                  className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  সরান ✕
                </button>
              </div>
            )
          })}
          <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400">
            মোট <span className="num">{bn(mine.length)}</span>টি পরীক্ষা
            সংরক্ষিত আছে।
          </p>
        </div>
      )}
    </div>
  )
}
