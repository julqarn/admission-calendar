import { useState } from 'react'
import type { Entry, Notice, Status } from '../types'
import { isAdminEdited, resetToVerified } from '../lib/store'
import { saveEntries, saveNotices } from '../lib/store'
import { bn, fmtDate, statusBn } from '../lib/utils'

const STATUSES: Status[] = [
  'Circular Published',
  'Exam Date Announced',
  'Application Ongoing',
  'Application Closed',
  'Exam Completed',
  'Not Yet Announced',
]

interface Props {
  entries: Entry[]
  notices: Notice[]
  onEntriesChange: (entries: Entry[]) => void
  onNoticesChange: (notices: Notice[]) => void
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  )
}

export default function Admin({
  entries,
  notices,
  onEntriesChange,
  onNoticesChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [draft, setDraft] = useState<Partial<Entry> | null>(null)
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeDate, setNoticeDate] = useState('')
  const [noticeBody, setNoticeBody] = useState('')
  const [message, setMessage] = useState('')

  const selected = entries.find((e) => e.id === selectedId) ?? null

  const startEdit = (id: number) => {
    const e = entries.find((x) => x.id === id)
    if (!e) return
    setSelectedId(id)
    setDraft({ ...e })
    setMessage('')
  }

  const saveDraft = () => {
    if (!draft || selectedId === '') return
    const next = entries.map((e) =>
      e.id === selectedId ? ({ ...e, ...draft } as Entry) : e,
    )
    onEntriesChange(next)
    saveEntries(next)
    setMessage('পরিবর্তন সংরক্ষিত হয়েছে।')
  }

  const deleteEntry = (id: number) => {
    const next = entries.filter((e) => e.id !== id)
    onEntriesChange(next)
    saveEntries(next)
    if (selectedId === id) {
      setSelectedId('')
      setDraft(null)
    }
    setMessage('ভর্তি পরীক্ষাটি মুছে ফেলা হয়েছে।')
  }

  const addEntry = () => {
    const id = Math.max(0, ...entries.map((e) => e.id)) + 1
    const fresh: Entry = {
      id,
      name: 'নতুন ভর্তি পরীক্ষা',
      unit: '',
      category: 'Independent',
      status: 'Not Yet Announced',
      circularPublished: null,
      appStart: null,
      appClose: null,
      fee: null,
      examDate: null,
      examTime: null,
      examStartTime: null,
      centres: null,
      admitCard: null,
      admitStart: null,
      admitEnd: null,
      resultDate: null,
      eligibility: null,
      website: null,
      circularLink: null,
      notes: null,
      gpaRule: null,
    }
    const next = [...entries, fresh]
    onEntriesChange(next)
    saveEntries(next)
    startEdit(id)
    setMessage('নতুন ভর্তি পরীক্ষা যোগ হয়েছে — নিচে তথ্য লিখে সংরক্ষণ করুন।')
  }

  const addNotice = () => {
    if (!noticeTitle.trim() || !noticeDate || !noticeBody.trim()) return
    const id = Math.max(0, ...notices.map((n) => n.id)) + 1
    const next = [
      { id, date: noticeDate, title: noticeTitle.trim(), body: noticeBody.trim(), entryId: null },
      ...notices,
    ]
    onNoticesChange(next)
    saveNotices(next)
    setNoticeTitle('')
    setNoticeDate('')
    setNoticeBody('')
    setMessage('নোটিশ যোগ হয়েছে।')
  }

  const deleteNotice = (id: number) => {
    const next = notices.filter((n) => n.id !== id)
    onNoticesChange(next)
    saveNotices(next)
    setMessage('নোটিশ মুছে ফেলা হয়েছে।')
  }

  const doReset = () => {
    resetToVerified()
    window.location.reload()
  }

  const setD = (key: keyof Entry) => (v: string) =>
    setDraft((d) => (d ? { ...d, [key]: v === '' ? null : v } : d))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          অ্যাডমিন প্যানেল
        </h2>
        <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          ভর্তি পরীক্ষার তথ্য ও নোটিশ এখান থেকে হালনাগাদ করা যায়। পরিবর্তন
          শুধু এই ব্রাউজারে সংরক্ষিত হয় (localStorage)। মূল যাচাইকৃত তথ্যে
          ফিরতে "যাচাইকৃত তথ্যে ফিরুন" বাটন ব্যবহার করুন।
        </p>
        {isAdminEdited() && (
          <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            অ্যাডমিন পরিবর্তন সক্রিয় আছে
          </p>
        )}
        {message && (
          <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {message}
          </p>
        )}
      </div>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          ভর্তি পরীক্ষা সম্পাদনা
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={selectedId}
            onChange={(e) =>
              e.target.value === '' ? null : startEdit(Number(e.target.value))
            }
            className="min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="ভর্তি পরীক্ষা নির্বাচন করুন"
          >
            <option value="">ভর্তি পরীক্ষা নির্বাচন করুন</option>
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.unit}
              </option>
            ))}
          </select>
          <button
            onClick={addEntry}
            className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            + নতুন পরীক্ষা
          </button>
        </div>

        {draft && selected && (
          <div className="mt-4 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <LabeledInput label="নাম" value={draft.name ?? ''} onChange={setD('name')} />
            <LabeledInput label="ইউনিট" value={draft.unit ?? ''} onChange={setD('unit')} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                অবস্থা
              </span>
              <select
                value={draft.status ?? 'Not Yet Announced'}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, status: e.target.value as Status } : d,
                  )
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusBn(s)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledInput label="আবেদন শুরু" type="date" value={draft.appStart ?? ''} onChange={setD('appStart')} />
              <LabeledInput label="আবেদন শেষ" type="date" value={draft.appClose ?? ''} onChange={setD('appClose')} />
              <LabeledInput label="পরীক্ষার তারিখ" type="date" value={draft.examDate ?? ''} onChange={setD('examDate')} />
              <LabeledInput label="ফলাফলের তারিখ" type="date" value={draft.resultDate ?? ''} onChange={setD('resultDate')} />
            </div>
            <LabeledInput label="আবেদন ফি (টাকা)" value={draft.fee ?? ''} onChange={setD('fee')} placeholder="যেমন: ১,২০০" />
            <LabeledInput label="পরীক্ষার সময়" value={draft.examTime ?? ''} onChange={setD('examTime')} placeholder="যেমন: ১১:০০–১২:৩০" />
            <LabeledInput label="পরীক্ষার কেন্দ্র" value={draft.centres ?? ''} onChange={setD('centres')} />
            <LabeledInput label="অ্যাডমিট কার্ড" value={draft.admitCard ?? ''} onChange={setD('admitCard')} />
            <LabeledInput label="অফিসিয়াল ওয়েবসাইট" value={draft.website ?? ''} onChange={setD('website')} />
            <LabeledInput label="সার্কুলার লিংক" value={draft.circularLink ?? ''} onChange={setD('circularLink')} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                যোগ্যতা
              </span>
              <textarea
                value={draft.eligibility ?? ''}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, eligibility: e.target.value || null } : d,
                  )
                }
                rows={2}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                নোট / সতর্কতা
              </span>
              <textarea
                value={draft.notes ?? ''}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, notes: e.target.value || null } : d,
                  )
                }
                rows={2}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveDraft}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
              >
                সংরক্ষণ করুন
              </button>
              <button
                onClick={() => deleteEntry(selected.id)}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                এই পরীক্ষাটি মুছে ফেলুন
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          নোটিশ যোগ করুন
        </h3>
        <div className="mt-3 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <LabeledInput label="শিরোনাম" value={noticeTitle} onChange={setNoticeTitle} />
          <LabeledInput label="তারিখ" type="date" value={noticeDate} onChange={setNoticeDate} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              বিবরণ
            </span>
            <textarea
              value={noticeBody}
              onChange={(e) => setNoticeBody(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <button
            onClick={addNotice}
            disabled={!noticeTitle.trim() || !noticeDate || !noticeBody.trim()}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            নোটিশ যোগ করুন
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {notices.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {n.title}
                </p>
                <p className="num text-xs text-zinc-500 dark:text-zinc-400">
                  {fmtDate(n.date)}
                </p>
              </div>
              <button
                onClick={() => deleteNotice(n.id)}
                className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              >
                মুছুন ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          তথ্য পুনরুদ্ধার
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          সব অ্যাডমিন পরিবর্তন মুছে যাচাইকৃত মূল তথ্যে (২৪ নভেম্বর ২০২৬) ফিরে
          যান। মোট <span className="num">{bn(entries.length)}</span>টি ভর্তি
          পরীক্ষা ও <span className="num">{bn(notices.length)}</span>টি নোটিশ
          রয়েছে।
        </p>
        <button
          onClick={doReset}
          className="mt-3 rounded-full border-2 border-red-600 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          যাচাইকৃত তথ্যে ফিরুন (রিসেট)
        </button>
      </section>
    </div>
  )
}
