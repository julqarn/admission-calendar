import { useEffect, useState } from 'react'
import { bn, countdownTo } from '../lib/utils'

interface Props {
  target: Date
  compact?: boolean
}

/** Live countdown (days / hours / minutes) refreshing every 30 seconds. */
export default function Countdown({ target, compact = false }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(id)
  }, [])

  const c = countdownTo(target, now)
  if (c.past) {
    return (
      <span className="text-zinc-500 dark:text-zinc-400">পরীক্ষা সম্পন্ন</span>
    )
  }
  if (compact) {
    return (
      <span className="num font-semibold text-emerald-700 dark:text-emerald-400">
        {bn(c.days)}দিন {bn(c.hours)}ঘণ্টা {bn(c.minutes)}মিনিট
      </span>
    )
  }
  return (
    <span className="num inline-flex flex-wrap items-center gap-x-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
      <span>
        <span className="text-base">{bn(c.days)}</span> দিন
      </span>
      <span>
        <span className="text-base">{bn(c.hours)}</span> ঘণ্টা
      </span>
      <span>
        <span className="text-base">{bn(c.minutes)}</span> মিনিট
      </span>
    </span>
  )
}
