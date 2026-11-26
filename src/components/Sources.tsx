import { useMemo, useState } from 'react'
import type { Source } from '../types'
import { bn, fmtDate } from '../lib/utils'
import { base } from '../lib/store'

interface Props {
  sources: Source[]
}

export default function Sources({ sources }: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      q
        ? sources.filter(
            (s) =>
              s.system.toLowerCase().includes(q) ||
              s.source.toLowerCase().includes(q) ||
              s.verified.toLowerCase().includes(q),
          )
        : sources,
    [sources, q],
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        সোর্স ও যাচাই
      </h2>
      <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        প্রতিটি তথ্যের উৎস এখানে দেওয়া আছে। অফিসিয়াল পোর্টাল ও
        বিশ্ববিদ্যালয়ের সাইটকে প্রথমে, আর অফিসিয়াল সার্কুলারের সংবাদ
        প্রতিবেদনকে দ্বিতীয়ে রাখা হয়েছে। তথ্য যাচাইয়ের তারিখ:{' '}
        <span className="num">{fmtDate(base.meta.verificationDate)}</span>। "ঘোষণা হয়নি" একটি
        ফলাফল — খোঁজার ঘাটতি নয়।
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="সোর্স খুঁজুন (যেমন: BUET, Prothom Alo)…"
        className="mt-4 w-full max-w-md rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <p className="num mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        মোট {bn(filtered.length)}টি সোর্স
      </p>

      <div className="mt-2 space-y-2">
        {filtered.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {s.system}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  s.status.startsWith('Conflict')
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : s.status.includes('unavailable')
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                }`}
              >
                {s.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-700 hover:underline dark:text-sky-400"
              >
                {s.source} ↗
              </a>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {s.verified}
            </p>
            <p className="num mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              সোর্সের তারিখ: {bn(s.sourceDate)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
        <p className="font-bold">যাচাই পদ্ধতি</p>
        <p className="mt-1">
          অফিসিয়াল ভর্তি পোর্টাল ও বিশ্ববিদ্যালয়ের সাইট প্রথমে যাচাই করা
          হয়েছে (বুয়েট, কুয়েট, রুয়েট, চুয়েট, ডুয়েট, বুটেক্স, মিস্ট, ডিজিএমই,
          acas.edu.bd, gstadmission.ac.bd, ঢাবি, রাবি, চবি, জাবি, বিইউপি, জবি,
          খুবি, শাবিপ্রবি, হাবিপ্রবি, কুবি)। কোনো পোর্টাল বন্ধ থাকলে (acas.edu.bd
          ৫০৩, gstadmission.ac.bd ৪০৩, চবির পোর্টাল রক্ষণাবেক্ষণে) সেটি
          উল্লেখ করা হয়েছে এবং নির্ভরযোগ্য সংবাদ প্রতিবেদন দিয়ে যাচাই করা
          হয়েছে। আগের শিক্ষাবর্ষের (২০২৫-২৬) কোনো তারিখ, ফি বা GPA নতুন
          শিক্ষাবর্ষের তথ্য হিসেবে ব্যবহার করা হয়নি।
        </p>
      </div>
    </div>
  )
}
