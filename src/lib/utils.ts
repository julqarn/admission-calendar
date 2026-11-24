import type { Entry, Status } from '../types'

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

/** Convert ASCII digits in a string to Bengali digits. */
export function bn(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

const BN_MONTHS_SHORT = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে',
]

/** '2026-12-12' -> '১২ ডিসেম্বর ২০২৬' */
export function fmtDate(iso: string | null | undefined, short = false): string {
  if (!iso) return 'ঘোষণা হয়নি'
  const [y, m, d] = iso.split('-').map(Number)
  const month = short ? BN_MONTHS_SHORT[m - 1] : BN_MONTHS[m - 1]
  return `${bn(d)} ${month} ${bn(y)}`
}

/** '11:00' -> '১১:০০' */
export function fmtTime(hhmm: string | null | undefined): string {
  if (!hhmm) return 'ঘোষণা হয়নি'
  return bn(hhmm)
}

/** '11:00–12:30' -> '১১:০০–১২:৩০' (digits converted, separators kept) */
export function fmtTimeRange(s: string | null | undefined): string {
  if (!s) return 'ঘোষণা হয়নি'
  return bn(s)
}

export const STATUS_BN: Record<Status, string> = {
  'Circular Published': 'সার্কুলার প্রকাশিত',
  'Exam Date Announced': 'পরীক্ষার তারিখ ঘোষিত',
  'Application Ongoing': 'আবেদন চলমান',
  'Not Yet Announced': 'এখনো ঘোষণা হয়নি',
  'Application Closed': 'আবেদন শেষ',
  'Exam Completed': 'পরীক্ষা সম্পন্ন',
}

export const CATEGORY_BN: Record<string, string> = {
  Engineering: 'প্রকৌশল',
  'Medical & Dental': 'মেডিকেল ও ডেন্টাল',
  'Agriculture Cluster': 'কৃষি গুচ্ছ',
  'GST Cluster': 'জিএসটি গুচ্ছ',
  Independent: 'স্বতন্ত্র',
}

export function statusBn(s: Status): string {
  return STATUS_BN[s] ?? s
}

export function categoryBn(c: string): string {
  return CATEGORY_BN[c] ?? c
}

export const STATUS_STYLE: Record<Status, string> = {
  'Circular Published':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  'Exam Date Announced':
    'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  'Application Ongoing':
    'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  'Not Yet Announced':
    'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
  'Application Closed':
    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  'Exam Completed':
    'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
}

/** Parse an ISO date as a local-midnight Date. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Exam start as a Date (Asia/Dhaka wall time approximated in local time). */
export function examStartDate(e: Entry): Date | null {
  if (!e.examDate) return null
  const d = parseISODate(e.examDate)
  const [h, mi] = (e.examStartTime ?? '11:00').split(':').map(Number)
  d.setHours(h, mi, 0, 0)
  return d
}

/** Whole days from now until a date (negative when past). */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = parseISODate(iso)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  past: boolean
}

export function countdownTo(target: Date, now: Date): Countdown {
  const diff = target.getTime() - now.getTime()
  const past = diff <= 0
  const abs = Math.abs(diff)
  return {
    days: Math.floor(abs / 86400000),
    hours: Math.floor(abs / 3600000) % 24,
    minutes: Math.floor(abs / 60000) % 60,
    seconds: Math.floor(abs / 1000) % 60,
    past,
  }
}

/** Application state of an entry, computed live from today's date. */
export function applicationState(e: Entry): 'ongoing' | 'upcoming' | 'closed' | 'unknown' {
  if (!e.appStart || !e.appClose) return 'unknown'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = parseISODate(e.appStart)
  const close = parseISODate(e.appClose)
  if (today < start) return 'upcoming'
  if (today > close) return 'closed'
  return 'ongoing'
}

/** Sort entries by exam date; entries without a date go last, then by name. */
export function sortByExam(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    if (!a.examDate && !b.examDate) return a.name.localeCompare(b.name)
    if (!a.examDate) return 1
    if (!b.examDate) return -1
    if (a.examDate !== b.examDate) return a.examDate.localeCompare(b.examDate)
    return a.name.localeCompare(b.name)
  })
}

/** Next upcoming exam (by start datetime). */
export function nextExam(entries: Entry[], now: Date): Entry | null {
  const upcoming = entries
    .map((e) => ({ e, start: examStartDate(e) }))
    .filter((x): x is { e: Entry; start: Date } => x.start !== null && x.start.getTime() > now.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  return upcoming.length ? upcoming[0].e : null
}

/** Bengali relative time, e.g. 'আজ', 'গতকাল', '২ দিন আগে'. */
export function relativeDay(iso: string): string {
  const d = daysUntil(iso)
  if (d === null) return ''
  if (d === 0) return 'আজ'
  if (d === 1) return 'আগামীকাল'
  if (d === -1) return 'গতকাল'
  if (d < 0) return `${bn(Math.abs(d))} দিন আগে`
  return `${bn(d)} দিন পর`
}

export const SUBJECT_BN: Record<string, string> = {
  math: 'উচ্চতর গণিত',
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  english: 'ইংরেজি',
}

export function subjectBn(key: string): string {
  return SUBJECT_BN[key] ?? key
}
