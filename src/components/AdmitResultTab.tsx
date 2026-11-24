import { useState } from 'react'
import type { Entry } from '../types'
import { bn, fmtDate, fmtTimeRange } from '../lib/utils'
import EntryDetail from './EntryDetail'
import { EmptyState, StatusBadge } from './Shared'

interface Props {
  entries: Entry[]
  kind: 'admit' | 'result'
  myCalendar: number[]
  onToggleMyCalendar: (id: number) => void
}

export default function AdmitResultTab({
  entries,
  kind,
  myCalendar,
  onToggleMyCalendar,
}: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)
  const isAdmit = kind === 'admit'

  const announced = entries.filter((e) =>
    isAdmit ? e.admitStart !== null : e.resultDate !== null,
  )
  const notAnnounced = entries.filter((e) =>
    isAdmit ? e.admitStart === null : e.resultDate === null,
  )

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {isAdmit ? 'অ্যাডমিট কার্ড ডাউনলোড' : 'ফলাফল'}
        </h2>
        {announced.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title={
                isAdmit
                  ? 'এখনো কোনো অ্যাডমিট কার্ড প্রকাশিত হয়নি'
                  : 'এখনো কোনো ফলাফল প্রকাশিত হয়নি'
              }
              body={
                isAdmit
                  ? 'কোনো বিশ্ববিদ্যালয়ের অ্যাডমিট কার্ড ডাউনলোডের তারিখ এখনো ঘোষণা হয়নি। ঘোষণা হলে এখানে দেখা যাবে।'
                  : 'কোনো ভর্তি পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি। পরীক্ষা শেষে এখানে ফলাফলের তারিখ ও লিংক যোগ হবে।'
              }
            />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {announced.map((e) => (
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
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {e.unit}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  {isAdmit ? (
                    <>
                      অ্যাডমিট কার্ড:{' '}
                      <span className="num font-semibold">
                        {e.admitStart
                          ? fmtDate(e.admitStart) +
                            (e.admitEnd ? ` – ${fmtDate(e.admitEnd)}` : '')
                          : 'ঘোষণা হয়নি'}
                      </span>
                    </>
                  ) : (
                    <>
                      ফলাফল:{' '}
                      <span className="num font-semibold">
                        {e.resultDate ? fmtDate(e.resultDate) : 'ঘোষণা হয়নি'}
                      </span>
                    </>
                  )}
                </p>
                {e.examDate && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    পরীক্ষা:{' '}
                    <span className="num">{fmtDate(e.examDate)}</span>
                    {e.examTime ? (
                      <>
                        {' • '}
                        <span className="num">{fmtTimeRange(e.examTime)}</span>
                      </>
                    ) : null}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {notAnnounced.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {isAdmit
              ? 'অ্যাডমিট কার্ডের তারিখ ঘোষণা হয়নি'
              : 'ফলাফলের তারিখ ঘোষণা হয়নি'}
            <span className="num ml-2 rounded-full bg-zinc-200 px-2.5 py-0.5 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {bn(notAnnounced.length)}
            </span>
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {notAnnounced.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-left dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {e.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {e.unit}
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
