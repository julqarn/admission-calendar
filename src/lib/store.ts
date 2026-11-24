import type { CustomDeadline, Entry, Notice } from '../types'
import baseData from '../data/admissions.json'
import type { AdmissionsData } from '../types'

const ENTRIES_KEY = 'ac2026.admin.entries.v1'
const NOTICES_KEY = 'ac2026.admin.notices.v1'
const MY_CAL_KEY = 'ac2026.mycalendar.v1'
const DEADLINES_KEY = 'ac2026.deadlines.v1'
const THEME_KEY = 'ac2026.theme.v1'

export const base: AdmissionsData = baseData as AdmissionsData

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Entries with admin overrides applied (localStorage), or the verified base data. */
export function loadEntries(): Entry[] {
  const saved = readJSON<Entry[]>(ENTRIES_KEY)
  if (saved && Array.isArray(saved) && saved.length > 0) return saved
  return base.entries
}

export function saveEntries(entries: Entry[]): void {
  writeJSON(ENTRIES_KEY, entries)
}

export function loadNotices(): Notice[] {
  const saved = readJSON<Notice[]>(NOTICES_KEY)
  if (saved && Array.isArray(saved)) return saved
  return base.notices
}

export function saveNotices(notices: Notice[]): void {
  writeJSON(NOTICES_KEY, notices)
}

/** Restore the verified 24-Nov-2026 data, discarding all admin edits. */
export function resetToVerified(): void {
  localStorage.removeItem(ENTRIES_KEY)
  localStorage.removeItem(NOTICES_KEY)
}

export function isAdminEdited(): boolean {
  return (
    localStorage.getItem(ENTRIES_KEY) !== null ||
    localStorage.getItem(NOTICES_KEY) !== null
  )
}

export function loadMyCalendar(): number[] {
  const saved = readJSON<number[]>(MY_CAL_KEY)
  return Array.isArray(saved) ? saved : []
}

export function saveMyCalendar(ids: number[]): void {
  writeJSON(MY_CAL_KEY, ids)
}

export function loadCustomDeadlines(): CustomDeadline[] {
  const saved = readJSON<CustomDeadline[]>(DEADLINES_KEY)
  return Array.isArray(saved) ? saved : []
}

export function saveCustomDeadlines(list: CustomDeadline[]): void {
  writeJSON(DEADLINES_KEY, list)
}

export function loadTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}
