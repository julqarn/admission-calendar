import type { Status } from '../types'
import { STATUS_STYLE, statusBn } from '../lib/utils'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      {statusBn(status)}
    </span>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
        {children}
      </span>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
    </div>
  )
}

/** A value that is "Not Announced" in the data renders as ঘোষণা হয়নি. */
export function MaybeValue({ value }: { value: string | null | undefined }) {
  if (!value) {
    return (
      <span className="text-zinc-400 dark:text-zinc-500">ঘোষণা হয়নি</span>
    )
  }
  return <>{value}</>
}
