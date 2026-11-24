import { useMemo, useState } from 'react'
import type { Entry } from '../types'
import { bn, categoryBn, fmtDate, subjectBn } from '../lib/utils'
import EntryDetail from './EntryDetail'
import { EmptyState, StatusBadge } from './Shared'

interface Props {
  entries: Entry[]
  myCalendar: number[]
  onToggleMyCalendar: (id: number) => void
}

function InfoCard({
  e,
  onOpen,
}: {
  e: Entry
  onOpen: (e: Entry) => void
}) {
  const rule = e.gpaRule
  return (
    <button
      onClick={() => onOpen(e)}
      className="rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {categoryBn(e.category)}
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-snug text-zinc-900 dark:text-white">
            {e.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{e.unit}</p>
        </div>
        <StatusBadge status={e.status} />
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-zinc-500 dark:text-zinc-400">পরীক্ষার কেন্দ্র</dt>
          <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
            {e.centres ?? 'ঘোষণা হয়নি'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-zinc-500 dark:text-zinc-400">পরীক্ষার তারিখ</dt>
          <dd className="num text-right font-medium text-zinc-800 dark:text-zinc-200">
            {e.examDate ? fmtDate(e.examDate) : 'ঘোষণা হয়নি'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-zinc-500 dark:text-zinc-400">দ্বিতীয়বার আবেদন</dt>
          <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
            {!rule
              ? 'ঘোষণা হয়নি'
              : rule.diplomaOnly
                ? 'ডিপ্লোমাধারীদের জন্য'
                : rule.secondTime
                  ? 'সুযোগ আছে'
                  : 'সুযোগ নেই'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-zinc-500 dark:text-zinc-400">নেগেটিভ মার্কিং</dt>
          <dd className="text-right font-medium text-zinc-800 dark:text-zinc-200">
            ঘোষণা হয়নি
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-zinc-500 dark:text-zinc-400">আবেদন ফি</dt>
          <dd className="num text-right font-medium text-zinc-800 dark:text-zinc-200">
            {e.fee ? `${bn(e.fee)} টাকা` : 'ঘোষণা হয়নি'}
          </dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-zinc-100 pt-2 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        যোগ্যতা:{' '}
        {e.eligibility ? bn(e.eligibility) : 'ঘোষণা হয়নি'}
      </p>
    </button>
  )
}

function CompareCell({ e }: { e: Entry | null }) {
  if (!e) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
        বিশ্ববিদ্যালয় নির্বাচন করুন
      </div>
    )
  }
  const rule = e.gpaRule
  const rows: Array<[string, string]> = [
    ['ইউনিট', e.unit],
    ['বিভাগ', categoryBn(e.category)],
    ['অবস্থা', ''],
    ['পরীক্ষার তারিখ', e.examDate ? fmtDate(e.examDate) : 'ঘোষণা হয়নি'],
    ['আবেদন ফি', e.fee ? `${e.fee} টাকা` : 'ঘোষণা হয়নি'],
    ['পরীক্ষার কেন্দ্র', e.centres ?? 'ঘোষণা হয়নি'],
    [
      'দ্বিতীয়বার আবেদন',
      !rule
        ? 'ঘোষণা হয়নি'
        : rule.diplomaOnly
          ? 'ডিপ্লোমাধারীদের জন্য'
          : rule.secondTime
            ? 'সুযোগ আছে'
            : 'সুযোগ নেই',
    ],
    ['যোগ্যতা', e.eligibility ?? 'ঘোষণা হয়নি'],
  ]
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h4 className="font-bold text-zinc-900 dark:text-white">{e.name}</h4>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{k}</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {k === 'অবস্থা' ? (
                <StatusBadge status={e.status} />
              ) : (
                <span className="num">{bn(v)}</span>
              )}
            </dd>
          </div>
        ))}
        {rule?.subjectCombined && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              বিষয়ভিত্তিক GPA
            </dt>
            <dd className="num text-zinc-800 dark:text-zinc-200">
              {rule.subjectCombined.subjects.map(subjectBn).join(' + ')} ={' '}
              {bn(rule.subjectCombined.min)}
              {rule.subjectCombined.eachMin
                ? ` (প্রতিটিতে ${bn(rule.subjectCombined.eachMin)})`
                : ''}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export default function InfoTab({ entries, myCalendar, onToggleMyCalendar }: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)
  const [firstId, setFirstId] = useState<number | ''>('')
  const [secondId, setSecondId] = useState<number | ''>('')
  const [query, setQuery] = useState('')

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.name.localeCompare(b.name)),
    [entries],
  )
  const q = query.trim().toLowerCase()
  const filtered = q
    ? sorted.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.unit.toLowerCase().includes(q),
      )
    : sorted
  const first = entries.find((e) => e.id === firstId) ?? null
  const second = entries.find((e) => e.id === secondId) ?? null

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          দুটি বিশ্ববিদ্যালয় তুলনা করুন
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          যেকোনো দুটি ভর্তি পরীক্ষা পাশাপাশি দেখুন।
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={firstId}
            onChange={(e) =>
              setFirstId(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="প্রথম বিশ্ববিদ্যালয়"
          >
            <option value="">প্রথম বিশ্ববিদ্যালয়</option>
            {sorted.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.unit}
              </option>
            ))}
          </select>
          <select
            value={secondId}
            onChange={(e) =>
              setSecondId(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="দ্বিতীয় বিশ্ববিদ্যালয়"
          >
            <option value="">দ্বিতীয় বিশ্ববিদ্যালয়</option>
            {sorted.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.unit}
              </option>
            ))}
          </select>
        </div>
        {(first || second) && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <CompareCell e={first} />
            <CompareCell e={second} />
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            বিশ্ববিদ্যালয়ভিত্তিক তথ্য
          </h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="বিশ্ববিদ্যালয় খুঁজুন…"
            className="w-full max-w-xs rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title="কিছু খুঁজে পাওয়া যায়নি"
            body="অন্য নাম লিখে আবার চেষ্টা করুন।"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((e) => (
              <InfoCard key={e.id} e={e} onOpen={setSelected} />
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          নেগেটিভ মার্কিং ও ক্যালকুলেটর-সংক্রান্ত তথ্য যাচাইকৃত ডেটায় না
          থাকায় "ঘোষণা হয়নি" দেখানো হয়েছে — অনুমান করে লেখা হয়নি।
        </p>
      </section>

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
