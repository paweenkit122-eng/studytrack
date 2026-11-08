import { useLanguage } from '../context/LanguageContext'
import { daysUntil, urgencyOf } from '../lib/dates'

/**
 * Shows how far away a date is ("Today", "Tomorrow", "3 days left",
 * "Overdue by 2 days") and colour-codes itself by urgency.
 */
export function CountdownBadge({ date, large = false }: { date: string; large?: boolean }) {
  const { t } = useLanguage()
  const d = daysUntil(date)
  const urgency = urgencyOf(date)

  let label: string
  if (d < 0) label = t('count.overdue', { n: Math.abs(d) })
  else if (d === 0) label = t('count.today')
  else if (d === 1) label = t('count.tomorrow')
  else label = t('count.daysLeft', { n: d })

  return (
    <span className={`badge badge--${urgency} ${large ? 'badge--large' : ''}`}>{label}</span>
  )
}
