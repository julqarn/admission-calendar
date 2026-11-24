import { useMemo, useState } from 'react'
import type { Entry, GpaRule } from '../types'
import { bn, subjectBn } from '../lib/utils'
import { StatusBadge } from './Shared'

interface Props {
  entries: Entry[]
  onOpenEntry: (id: number) => void
}

interface Form {
  sscGpa: string
  hscGpa: string
  sscYear: string
  hscYear: string
  group: string
  math: string
  physics: string
  chemistry: string
  biology: string
  english: string
}

const EMPTY: Form = {
  sscGpa: '',
  hscGpa: '',
  sscYear: '',
  hscYear: '',
  group: 'বিজ্ঞান',
  math: '',
  physics: '',
  chemistry: '',
  biology: '',
  english: '',
}

const GRADE_OPTIONS = ['', '5.00', '4.50', '4.00', '3.50', '3.00', '2.50', '2.00']
const YEARS = ['', '2021', '2022', '2023', '2024', '2025', '2026']

type Verdict =
  | { kind: 'eligible' }
  | { kind: 'not-eligible'; reasons: string[] }
  | { kind: 'unknown'; reason: string }
  | { kind: 'diploma' }

function check(entry: Entry, f: Form): Verdict {
  const rule: GpaRule | null = entry.gpaRule
  if (!rule) return { kind: 'unknown', reason: 'এই পরীক্ষার যোগ্যতার শর্ত এখনো ঘোষণা হয়নি।' }
  if (rule.diplomaOnly) return { kind: 'diploma' }

  const ssc = parseFloat(f.sscGpa)
  const hsc = parseFloat(f.hscGpa)
  const sscYear = Number(f.sscYear)
  const hscYear = Number(f.hscYear)
  const subjects: Record<string, number | null> = {
    math: f.math === '' ? null : parseFloat(f.math),
    physics: f.physics === '' ? null : parseFloat(f.physics),
    chemistry: f.chemistry === '' ? null : parseFloat(f.chemistry),
    biology: f.biology === '' ? null : parseFloat(f.biology),
    english: f.english === '' ? null : parseFloat(f.english),
  }
  const reasons: string[] = []

  if (f.group !== 'বিজ্ঞান') {
    reasons.push('শুধু বিজ্ঞান বিভাগের শিক্ষার্থীরা আবেদন করতে পারবে।')
  }
  if (rule.sscYears && !rule.sscYears.includes(sscYear)) {
    reasons.push(
      `এসএসসি পাসের বছর হতে হবে ${rule.sscYears.map((y) => bn(y)).join(', ')}-এর মধ্যে।`,
    )
  }
  if (rule.hscYears && !rule.hscYears.includes(hscYear)) {
    reasons.push(
      `এইচএসসি পাসের বছর হতে হবে ${rule.hscYears.map((y) => bn(y)).join(', ')}-এর মধ্যে।`,
    )
  }
  if (rule.sscMin !== undefined && !Number.isNaN(ssc) && ssc < rule.sscMin) {
    reasons.push(`এসএসসিতে কমপক্ষে GPA ${bn(rule.sscMin.toFixed(2))} প্রয়োজন।`)
  }
  if (rule.hscMin !== undefined && !Number.isNaN(hsc) && hsc < rule.hscMin) {
    reasons.push(`এইচএসসিতে কমপক্ষে GPA ${bn(rule.hscMin.toFixed(2))} প্রয়োজন।`)
  }
  if (
    rule.combinedMin !== undefined &&
    !Number.isNaN(ssc) &&
    !Number.isNaN(hsc) &&
    ssc + hsc < rule.combinedMin
  ) {
    reasons.push(
      `এসএসসি ও এইচএসসি মিলিয়ে মোট GPA কমপক্ষে ${bn(rule.combinedMin.toFixed(2))} প্রয়োজন (আপনার মোট ${bn((ssc + hsc).toFixed(2))})।`,
    )
  }
  if (rule.subjectCombined) {
    const vals = rule.subjectCombined.subjects.map((s) => subjects[s])
    if (vals.every((v) => v !== null)) {
      const sum = (vals as number[]).reduce((a, b) => a + b, 0)
      if (sum < rule.subjectCombined.min) {
        reasons.push(
          `${rule.subjectCombined.subjects.map(subjectBn).join(', ')} বিষয়ে মোট GPA কমপক্ষে ${bn(rule.subjectCombined.min.toFixed(2))} প্রয়োজন (আপনার ${bn(sum.toFixed(2))})।`,
        )
      }
      if (rule.subjectCombined.eachMin) {
        for (let i = 0; i < rule.subjectCombined.subjects.length; i++) {
          const v = vals[i] as number
          if (v < (rule.subjectCombined.eachMin as number)) {
            reasons.push(
              `${subjectBn(rule.subjectCombined.subjects[i])} বিষয়ে কমপক্ষে GPA ${bn((rule.subjectCombined.eachMin as number).toFixed(2))} প্রয়োজন।`,
            )
          }
        }
      }
    }
  }
  if (rule.subjectEach) {
    for (const s of rule.subjectEach.subjects) {
      const v = subjects[s]
      if (v !== null && v < rule.subjectEach.min) {
        reasons.push(
          `${subjectBn(s)} বিষয়ে GPA ${bn(rule.subjectEach.min.toFixed(2))} প্রয়োজন।`,
        )
      }
    }
  }
  if (rule.requiredSubjects) {
    const missing = rule.requiredSubjects.filter((s) => subjects[s] === null)
    if (missing.length > 0) {
      reasons.push(
        `এই পরীক্ষায় ${missing.map(subjectBn).join(', ')} বিষয় থাকা বাধ্যতামূলক — বিষয়ভিত্তিক GPA দিন।`,
      )
    }
  }
  if (rule.secondTime === false && rule.hscYears && rule.hscYears.length === 1) {
    // single HSC year implies first-timers only; already covered by year check
  }

  if (reasons.length > 0) return { kind: 'not-eligible', reasons }
  return { kind: 'eligible' }
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === '' ? 'নির্বাচন করুন' : bn(o)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function Eligibility({ entries, onOpenEntry }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [checked, setChecked] = useState(false)

  const set = (key: keyof Form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }))

  const ready =
    form.sscGpa !== '' &&
    form.hscGpa !== '' &&
    form.sscYear !== '' &&
    form.hscYear !== ''

  const results = useMemo(() => {
    if (!checked || !ready) return null
    return entries.map((e) => ({ entry: e, verdict: check(e, form) }))
  }, [checked, ready, entries, form])

  const eligible = results?.filter((r) => r.verdict.kind === 'eligible') ?? []
  const notEligible =
    results?.filter((r) => r.verdict.kind === 'not-eligible') ?? []
  const unknown = results?.filter((r) => r.verdict.kind === 'unknown') ?? []
  const diploma = results?.filter((r) => r.verdict.kind === 'diploma') ?? []

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        যোগ্যতা যাচাই
      </h2>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        আপনার এসএসসি ও এইচএসসির ফলাফল দিন — কোন কোন ভর্তি পরীক্ষায় আবেদন
        করতে পারবেন, দেখে নিন। যাচাই শুধু প্রকাশিত সার্কুলারের শর্তের ভিত্তিতে
        করা হয়।
      </p>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="এসএসসি GPA"
            value={form.sscGpa}
            onChange={set('sscGpa')}
            options={GRADE_OPTIONS}
          />
          <Select
            label="এইচএসসি GPA"
            value={form.hscGpa}
            onChange={set('hscGpa')}
            options={GRADE_OPTIONS}
          />
          <Select
            label="এসএসসি পাসের বছর"
            value={form.sscYear}
            onChange={set('sscYear')}
            options={YEARS}
          />
          <Select
            label="এইচএসসি পাসের বছর"
            value={form.hscYear}
            onChange={set('hscYear')}
            options={YEARS}
          />
          <Select
            label="বিভাগ / গ্রুপ"
            value={form.group}
            onChange={set('group')}
            options={['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা', 'অন্যান্য']}
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          বিষয়ভিত্তিক GPA (যেগুলো আছে সেগুলো দিন)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Select label="উচ্চতর গণিত" value={form.math} onChange={set('math')} options={GRADE_OPTIONS} />
          <Select label="পদার্থবিজ্ঞান" value={form.physics} onChange={set('physics')} options={GRADE_OPTIONS} />
          <Select label="রসায়ন" value={form.chemistry} onChange={set('chemistry')} options={GRADE_OPTIONS} />
          <Select label="জীববিজ্ঞান" value={form.biology} onChange={set('biology')} options={GRADE_OPTIONS} />
          <Select label="ইংরেজি" value={form.english} onChange={set('english')} options={GRADE_OPTIONS} />
        </div>

        <button
          onClick={() => setChecked(true)}
          disabled={!ready}
          className="mt-5 w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto sm:px-8"
        >
          যোগ্যতা যাচাই করুন
        </button>
        {!ready && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            যাচাই করতে এসএসসি ও এইচএসসির GPA এবং পাসের বছর দিতে হবে।
          </p>
        )}
      </div>

      {results && (
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              আবেদন করতে পারবেন{' '}
              <span className="num">({bn(eligible.length)}টি)</span>
            </h3>
            {eligible.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                দেওয়া তথ্য অনুযায়ী কোনো পরীক্ষায় আবেদনের যোগ্যতা মিলছে না।
                বিষয়ভিত্তিক GPA দিলে ফল আরও নির্ভুল হবে।
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {eligible.map(({ entry: e }) => (
                  <button
                    key={e.id}
                    onClick={() => onOpenEntry(e.id)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left dark:border-emerald-900 dark:bg-emerald-950/40"
                  >
                    <span>
                      <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                        {e.name}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        {e.unit}
                      </span>
                    </span>
                    <StatusBadge status={e.status} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {notEligible.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                আবেদন করতে পারবেন না{' '}
                <span className="num">({bn(notEligible.length)}টি)</span>
              </h3>
              <div className="mt-3 space-y-2">
                {notEligible.map(({ entry: e, verdict }) => (
                  <div
                    key={e.id}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {e.name} <span className="font-normal text-zinc-500 dark:text-zinc-400">• {e.unit}</span>
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                      {(verdict.kind === 'not-eligible' ? verdict.reasons : []).map(
                        (r, i) => (
                          <li key={i}>{bn(r)}</li>
                        ),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {unknown.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                যোগ্যতা এখনো ঘোষণা হয়নি{' '}
                <span className="num">({bn(unknown.length)}টি)</span>
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                এসব পরীক্ষার সার্কুলার এখনো প্রকাশিত হয়নি, তাই যোগ্যতা যাচাই
                করা যাচ্ছে না।
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unknown.map(({ entry: e }) => (
                  <button
                    key={e.id}
                    onClick={() => onOpenEntry(e.id)}
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {diploma.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                ডিপ্লোমাধারীদের জন্য
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                ডুয়েটে শুধু ডিপ্লোমা ইন ইঞ্জিনিয়ারিংধারীরা আবেদন করতে পারেন;
                এইচএসসি (বিজ্ঞান) দিয়ে আবেদন করা যায় না।
              </p>
            </section>
          )}

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            এই যাচাই শুধু প্রাথমিক নির্দেশনা। চূড়ান্ত সিদ্ধান্তের আগে সংশ্লিষ্ট
            বিশ্ববিদ্যালয়ের অফিসিয়াল সার্কুলার দেখে নিন।
          </p>
        </div>
      )}
    </div>
  )
}
