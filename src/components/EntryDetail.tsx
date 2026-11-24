import type { Entry } from '../types'
import {
  bn,
  categoryBn,
  daysUntil,
  examStartDate,
  fmtDate,
  fmtTimeRange,
  relativeDay,
} from '../lib/utils'
import Countdown from './Countdown'
import { Field, StatusBadge } from './Shared'

interface Props {
  entry: Entry
  onClose: () => void
  inMyCalendar: boolean
  onToggleMyCalendar: (id: number) => void
}

export default function EntryDetail({
  entry: e,
  onClose,
  inMyCalendar,
  onToggleMyCalendar,
}: Props) {
  const examStart = examStartDate(e)
  const appDays = daysUntil(e.appClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={e.name}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl dark:bg-zinc-900 sm:rounded-3xl sm:p-6"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
              {categoryBn(e.category)} • {e.unit}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-snug text-zinc-900 dark:text-white">
              {e.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={e.status} />
              {e.examDate && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  পরীক্ষা:{' '}
                  <span className="num ml-1">{fmtDate(e.examDate)}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {examStart && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-950/60">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              পরীক্ষা শুরু হতে বাকি
            </p>
            <p className="mt-0.5 text-lg">
              <Countdown target={examStart} />
            </p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              <span className="num">{fmtDate(e.examDate)}</span>
              {e.examTime ? (
                <>
                  {' • '}
                  <span className="num">{fmtTimeRange(e.examTime)}</span>
                </>
              ) : null}
            </p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="আবেদন শুরু">
            {e.appStart ? (
              <span className="num">{fmtDate(e.appStart)}</span>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
          <Field label="আবেদন শেষ">
            {e.appClose ? (
              <>
                <span className="num">{fmtDate(e.appClose)}</span>
                {appDays !== null && (
                  <span
                    className={
                      appDays < 0
                        ? 'ml-2 text-xs font-semibold text-red-600 dark:text-red-400'
                        : appDays <= 7
                          ? 'ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400'
                          : 'ml-2 text-xs text-zinc-500 dark:text-zinc-400'
                    }
                  >
                    {appDays < 0
                      ? `(${bn(Math.abs(appDays))} দিন আগে শেষ)`
                      : appDays === 0
                        ? '(আজই শেষ)'
                        : `(আর ${bn(appDays)} দিন)`}
                  </span>
                )}
              </>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
          <Field label="আবেদন ফি">
            {e.fee ? (
              <>
                <span className="num">{bn(e.fee)}</span> টাকা
              </>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
          <Field label="সার্কুলার প্রকাশ">
            {e.circularPublished ? bn(e.circularPublished) : 'ঘোষণা হয়নি'}
          </Field>
          <Field label="পরীক্ষার কেন্দ্র">
            {e.centres ?? 'ঘোষণা হয়নি'}
          </Field>
          <Field label="অ্যাডমিট কার্ড">
            {e.admitCard ? (
              <>
                <span className="num">{bn(e.admitCard)}</span>
              </>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
          <Field label="ফলাফল">
            {e.resultDate ? (
              <span className="num">{fmtDate(e.resultDate)}</span>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
          <Field label="পরীক্ষার সময়">
            {e.examTime ? (
              <span className="num">{fmtTimeRange(e.examTime)}</span>
            ) : (
              'ঘোষণা হয়নি'
            )}
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="যোগ্যতা">
            {e.eligibility ? bn(e.eligibility) : 'ঘোষণা হয়নি'}
          </Field>
          {e.notes && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-semibold">নোট / সতর্কতা</p>
              <p className="mt-1">{bn(e.notes)}</p>
            </div>
          )}
          {e.examDate && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              পরীক্ষা {relativeDay(e.examDate)}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => onToggleMyCalendar(e.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              inMyCalendar
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {inMyCalendar
              ? '✓ আমার ক্যালেন্ডারে আছে — সরান'
              : '+ আমার ক্যালেন্ডারে যোগ করুন'}
          </button>
          {e.website && (
            <a
              href={e.website}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              অফিসিয়াল ওয়েবসাইট ↗
            </a>
          )}
          {e.circularLink && (
            <a
              href={e.circularLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              সার্কুলার দেখুন ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
