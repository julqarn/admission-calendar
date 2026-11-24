import { useEffect, useMemo, useState } from 'react'
import type { Tab, View } from './types'
import { base, loadEntries, loadMyCalendar, loadNotices, loadTheme, saveMyCalendar, saveTheme } from './lib/store'
import { applicationState, bn } from './lib/utils'
import Timeline from './components/Timeline'
import InfoTab from './components/InfoTab'
import ApplicationTab from './components/ApplicationTab'
import AdmitResultTab from './components/AdmitResultTab'
import Dashboard from './components/Dashboard'
import UniversityList from './components/UniversityList'
import Eligibility from './components/Eligibility'
import Deadlines from './components/Deadlines'
import MyCalendar from './components/MyCalendar'
import Notices from './components/Notices'
import Sources from './components/Sources'
import Admin from './components/Admin'
import EntryDetail from './components/EntryDetail'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'timeline', label: 'সময়কাল' },
  { id: 'info', label: 'তথ্য' },
  { id: 'apply', label: 'আবেদন' },
  { id: 'admit', label: 'অ্যাডমিট' },
  { id: 'result', label: 'ফলাফল' },
]

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme())
  const [entries, setEntries] = useState(() => loadEntries())
  const [notices, setNotices] = useState(() => loadNotices())
  const [tab, setTab] = useState<Tab>('timeline')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>({ kind: 'home' })
  const [detailId, setDetailId] = useState<number | null>(null)
  const [myCalendar, setMyCalendar] = useState<number[]>(() => loadMyCalendar())
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    saveTheme(theme)
  }, [theme])

  const toggleMyCalendar = (id: number) => {
    setMyCalendar((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveMyCalendar(next)
      return next
    })
  }

  const goHome = () => {
    setView({ kind: 'home' })
    setDetailId(null)
    setMoreOpen(false)
    window.scrollTo({ top: 0 })
  }

  const goView = (v: View) => {
    setView(v)
    setDetailId(null)
    setMoreOpen(false)
    window.scrollTo({ top: 0 })
  }

  const openEntry = (id: number) => {
    setDetailId(id)
    setMoreOpen(false)
  }

  const detailEntry = detailId !== null ? entries.find((e) => e.id === detailId) ?? null : null

  const ongoingCount = useMemo(
    () => entries.filter((e) => applicationState(e) === 'ongoing').length,
    [entries],
  )

  const tickerItems = useMemo(
    () =>
      [...notices]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [notices],
  )

  const navBtn =
    'flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-semibold leading-none'

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-[1000px] px-3 pb-28 sm:px-4">
        {/* ---------- Header ---------- */}
        <header className="relative pt-8 text-center sm:pt-10">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="no-print absolute right-0 top-4 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:top-6"
            aria-label="ডার্ক মোড পরিবর্তন করুন"
          >
            {theme === 'dark' ? '☀️ লাইট' : '🌙 ডার্ক'}
          </button>
          <h1
            onClick={goHome}
            className="cursor-pointer text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
          >
            অ্যাডমিশন ক্যালেন্ডার
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
            বাংলাদেশের সব সরকারি বিশ্ববিদ্যালয়ের বিজ্ঞান ইউনিট ভর্তি পরীক্ষার
            সময়সূচি ও তথ্য — এক জায়গায়
          </p>
          <p className="num mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            শিক্ষাবর্ষ ২০২৬-২৭ • তথ্য যাচাইয়ের তারিখ: ২৪ নভেম্বর ২০২৬
          </p>
        </header>

        {/* ---------- Update banner ---------- */}
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            ভর্তি পরীক্ষার সর্বশেষ আপডেট
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            সবার আগে গোছানো এবং নির্ভুল তথ্য পেতে এই ক্যালেন্ডারটি সংরক্ষণ করে
            রাখুন।
          </p>
          <p className="mt-2 text-sm">
            বর্তমানে{' '}
            <span className="num font-bold text-emerald-700 dark:text-emerald-400">
              {bn(ongoingCount)}
            </span>{' '}
            টি আবেদন চলমান আছে
          </p>
        </section>

        {/* ---------- Notice ticker ---------- */}
        <div className="mt-3 overflow-hidden rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
              নোটিশ
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="ticker-track flex w-max whitespace-nowrap">
                {[0, 1].map((copy) => (
                  <span key={copy} className="flex" aria-hidden={copy === 1}>
                    {tickerItems.map((n) => (
                      <span
                        key={`${copy}-${n.id}`}
                        className="mx-4 text-sm text-zinc-700 dark:text-zinc-200"
                      >
                        {n.title}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Views ---------- */}
        {view.kind === 'home' && (
          <>
            {/* Search + tabs */}
            <div className="no-print mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="বিশ্ববিদ্যালয়ের নাম দিয়ে খুঁজুন…"
                className="w-full flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="ভিউ নির্বাচন">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      tab === t.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <main className="mt-5">
              {tab === 'timeline' && (
                <Timeline
                  entries={entries}
                  query={query}
                  myCalendar={myCalendar}
                  onToggleMyCalendar={toggleMyCalendar}
                />
              )}
              {tab === 'info' && (
                <InfoTab
                  entries={entries}
                  myCalendar={myCalendar}
                  onToggleMyCalendar={toggleMyCalendar}
                />
              )}
              {tab === 'apply' && (
                <ApplicationTab
                  entries={entries}
                  myCalendar={myCalendar}
                  onToggleMyCalendar={toggleMyCalendar}
                />
              )}
              {tab === 'admit' && (
                <AdmitResultTab
                  entries={entries}
                  kind="admit"
                  myCalendar={myCalendar}
                  onToggleMyCalendar={toggleMyCalendar}
                />
              )}
              {tab === 'result' && (
                <AdmitResultTab
                  entries={entries}
                  kind="result"
                  myCalendar={myCalendar}
                  onToggleMyCalendar={toggleMyCalendar}
                />
              )}
            </main>
          </>
        )}

        {view.kind === 'dashboard' && (
          <main className="mt-5">
            <Dashboard
              entries={entries}
              notices={notices}
              totalUniversities={base.meta.totalUniversities}
              distinctUniversities={base.meta.distinctUniversities}
              onOpenEntry={openEntry}
              onGoNotices={() => goView({ kind: 'notices' })}
            />
          </main>
        )}
        {view.kind === 'universities' && (
          <main className="mt-5">
            <UniversityList universities={base.universities} />
          </main>
        )}
        {view.kind === 'eligibility' && (
          <main className="mt-5">
            <Eligibility entries={entries} onOpenEntry={openEntry} />
          </main>
        )}
        {view.kind === 'deadlines' && (
          <main className="mt-5">
            <Deadlines entries={entries} onOpenEntry={openEntry} />
          </main>
        )}
        {view.kind === 'mycalendar' && (
          <main className="mt-5">
            <MyCalendar
              entries={entries}
              myCalendar={myCalendar}
              onToggleMyCalendar={toggleMyCalendar}
              onOpenEntry={openEntry}
            />
          </main>
        )}
        {view.kind === 'notices' && (
          <main className="mt-5">
            <Notices notices={notices} onOpenEntry={openEntry} />
          </main>
        )}
        {view.kind === 'sources' && (
          <main className="mt-5">
            <Sources sources={base.sources} />
          </main>
        )}
        {view.kind === 'admin' && (
          <main className="mt-5">
            <Admin
              entries={entries}
              notices={notices}
              onEntriesChange={setEntries}
              onNoticesChange={setNotices}
            />
          </main>
        )}

        {/* ---------- Footer ---------- */}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-center text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>© ২০২৬ অ্যাডমিশন ক্যালেন্ডার। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="mt-1">
            শুধু সরকারি বিশ্ববিদ্যালয়ের বিজ্ঞান ইউনিটের তথ্য • তথ্য যাচাইয়ের
            তারিখ <span className="num">২৪ নভেম্বর ২০২৬</span> • কোনো তথ্য
            অনুমান করে লেখা হয়নি — "ঘোষণা হয়নি" মানে অফিসিয়াল তথ্য পাওয়া
            যায়নি
          </p>
        </footer>
      </div>

      {/* ---------- Floating bottom pill navigation ---------- */}
      <nav className="no-print fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
        <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-2 shadow-lg ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/95 dark:ring-zinc-700">
          <button
            onClick={() => goView({ kind: 'deadlines' })}
            className={`${navBtn} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800`}
          >
            <span className="text-base leading-none">⏰</span>ডেডলাইন
          </button>
          <button
            onClick={() => goView({ kind: 'mycalendar' })}
            className={`${navBtn} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800`}
          >
            <span className="text-base leading-none">🗓️</span>ক্যালেন্ডার
          </button>
          <button
            onClick={() => {
              goHome()
              setTab('timeline')
            }}
            className="mx-1 flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full bg-zinc-900 text-lg text-white shadow-md dark:bg-white dark:text-zinc-900"
            aria-label="সময়কাল"
          >
            📅
          </button>
          <button
            onClick={() => goView({ kind: 'notices' })}
            className={`${navBtn} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800`}
          >
            <span className="text-base leading-none">🔔</span>নোটিশ
          </button>
          <button
            onClick={() => setMoreOpen(true)}
            className={`${navBtn} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800`}
          >
            <span className="text-base leading-none">⋯</span>আরও
          </button>
        </div>
      </nav>

      {/* ---------- More sheet ---------- */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl dark:bg-zinc-900 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="আরও"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                আরও
              </h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  ['ড্যাশবোর্ড', '📊', { kind: 'dashboard' } as View],
                  ['বিশ্ববিদ্যালয় তালিকা', '🏛️', { kind: 'universities' } as View],
                  ['যোগ্যতা যাচাই', '✅', { kind: 'eligibility' } as View],
                  ['ডেডলাইন ট্র্যাকার', '⏰', { kind: 'deadlines' } as View],
                  ['আমার ক্যালেন্ডার', '🗓️', { kind: 'mycalendar' } as View],
                  ['নোটিশ', '🔔', { kind: 'notices' } as View],
                  ['সোর্স ও যাচাই', '🔍', { kind: 'sources' } as View],
                  ['অ্যাডমিন প্যানেল', '⚙️', { kind: 'admin' } as View],
                ] as Array<[string, string, View]>
              ).map(([label, icon, v]) => (
                <button
                  key={label}
                  onClick={() => goView(v)}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              ))}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className="text-lg">⬇️</span>
                টাইমটেবিল ডাউনলোড (PDF / প্রিন্ট)
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              তথ্য যাচাইয়ের তারিখ: <span className="num">২৪ নভেম্বর ২০২৬</span>
            </p>
          </div>
        </div>
      )}

      {/* ---------- Entry detail modal ---------- */}
      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          onClose={() => setDetailId(null)}
          inMyCalendar={myCalendar.includes(detailEntry.id)}
          onToggleMyCalendar={toggleMyCalendar}
        />
      )}
    </div>
  )
}
