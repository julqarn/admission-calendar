import { useMemo, useState } from 'react'
import type { University } from '../types'
import { bn, categoryBn, statusBn } from '../lib/utils'
import { StatusBadge } from './Shared'

interface Props {
  universities: University[]
}

const SYSTEMS = [
  'সবগুলো',
  'Engineering',
  'Medical & Dental',
  'Agriculture Cluster',
  'GST Cluster',
  'Independent',
]

export default function UniversityList({ universities }: Props) {
  const [system, setSystem] = useState('সবগুলো')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return universities.filter((u) => {
      if (system !== 'সবগুলো' && u.system !== system) return false
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.shortName.toLowerCase().includes(q) &&
        !u.location.toLowerCase().includes(q)
      )
        return false
      return true
    })
  }, [universities, system, query])

  const grouped = useMemo(() => {
    const map = new Map<string, University[]>()
    for (const u of filtered) {
      const list = map.get(u.system) ?? []
      list.push(u)
      map.set(u.system, list)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        বিশ্ববিদ্যালয় তালিকা
      </h2>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        মোট <span className="num">{bn(universities.length)}</span>টি সারি •{' '}
        <span className="num">৪৮</span>টি স্বতন্ত্র বিশ্ববিদ্যালয় (পটুয়াখালী
        বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় কৃষি ও জিএসটি — উভয় গুচ্ছেই আছে)
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="বিশ্ববিদ্যালয়ের নাম বা জেলা লিখুন…"
          className="w-full flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <select
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label="ভর্তি ব্যবস্থা"
        >
          {SYSTEMS.map((s) => (
            <option key={s} value={s}>
              {s === 'সবগুলো' ? 'সব ব্যবস্থা' : categoryBn(s)}
            </option>
          ))}
        </select>
      </div>

      {grouped.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          কিছু খুঁজে পাওয়া যায়নি।
        </p>
      )}

      {grouped.map(([sys, list]) => (
        <section key={sys} className="mt-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {categoryBn(sys)}{' '}
            <span className="num text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              ({bn(list.length)})
            </span>
          </h3>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[560px] border-collapse bg-white text-left dark:bg-zinc-900">
              <thead>
                <tr className="bg-zinc-900 text-white dark:bg-black">
                  <th className="px-4 py-2.5 text-sm font-semibold">বিশ্ববিদ্যালয়</th>
                  <th className="px-4 py-2.5 text-sm font-semibold">অবস্থান</th>
                  <th className="px-4 py-2.5 text-sm font-semibold">ইউনিট</th>
                  <th className="px-4 py-2.5 text-sm font-semibold">আসন</th>
                  <th className="px-4 py-2.5 text-sm font-semibold">অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-zinc-100 odd:bg-white even:bg-zinc-50/60 dark:border-zinc-800 dark:odd:bg-zinc-900 dark:even:bg-zinc-900/60"
                  >
                    <td className="px-4 py-2.5">
                      <a
                        href={u.website ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        {u.name} ({u.shortName})
                      </a>
                      {u.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {u.notes}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      {u.location}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      {u.unit}
                    </td>
                    <td className="num whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {u.seats !== null ? bn(u.seats.toLocaleString('en-US')) : 'ঘোষণা হয়নি'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <StatusBadge status={u.status} />
                      <span className="sr-only">{statusBn(u.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
