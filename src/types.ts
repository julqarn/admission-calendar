export type Status =
  | 'Circular Published'
  | 'Exam Date Announced'
  | 'Application Ongoing'
  | 'Not Yet Announced'
  | 'Application Closed'
  | 'Exam Completed'

export interface SubjectCombinedRule {
  subjects: string[]
  min: number
  eachMin?: number
}

export interface GpaRule {
  sscYears?: number[]
  hscYears?: number[]
  sscMin?: number
  hscMin?: number
  combinedMin?: number
  subjectCombined?: SubjectCombinedRule
  subjectEach?: { subjects: string[]; min: number }
  requiredSubjects?: string[]
  secondTime?: boolean
  diplomaOnly?: boolean
  reportedOnly?: boolean
  note?: string
}

export interface Entry {
  id: number
  name: string
  unit: string
  category: string
  status: Status
  circularPublished: string | null
  appStart: string | null // ISO date
  appClose: string | null // ISO date
  fee: string | null
  examDate: string | null // ISO date
  examTime: string | null
  examStartTime: string | null // HH:MM
  centres: string | null
  admitCard: string | null
  admitStart: string | null
  admitEnd: string | null
  resultDate: string | null
  eligibility: string | null
  website: string | null
  circularLink: string | null
  notes: string | null
  gpaRule: GpaRule | null
}

export interface University {
  id: number
  name: string
  shortName: string
  location: string
  system: string
  unit: string
  status: Status
  seats: number | null
  website: string | null
  notes: string | null
}

export interface Source {
  system: string
  source: string
  url: string
  verified: string
  sourceDate: string
  status: string
}

export interface Notice {
  id: number
  date: string // ISO date
  title: string
  body: string
  entryId: number | null
}

export interface AdmissionsData {
  meta: {
    title: string
    session: string
    verificationDate: string
    scope: string
    totalEntries: number
    totalUniversities: number
    distinctUniversities: number
    totalSources: number
    totalNotices: number
  }
  entries: Entry[]
  universities: University[]
  sources: Source[]
  notices: Notice[]
}

export type Tab = 'timeline' | 'info' | 'apply' | 'admit' | 'result'

export type View =
  | { kind: 'home' }
  | { kind: 'detail'; entryId: number }
  | { kind: 'dashboard' }
  | { kind: 'universities' }
  | { kind: 'eligibility' }
  | { kind: 'deadlines' }
  | { kind: 'mycalendar' }
  | { kind: 'notices' }
  | { kind: 'sources' }
  | { kind: 'admin' }

export interface CustomDeadline {
  id: string
  title: string
  description: string
  date: string // ISO date
  time: string // HH:MM
}
