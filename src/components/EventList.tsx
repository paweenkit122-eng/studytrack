import type { StudyEvent, Subject } from '../types'
import { EventCard } from './EventCard'

/** A titled group of event cards. Renders nothing when the list is empty. */
export function EventList({
  title,
  events,
  subjectById,
  onToggleDone,
  onEdit,
  onDelete,
}: {
  title: string
  events: StudyEvent[]
  subjectById: Record<string, Subject>
  onToggleDone: (id: string) => void
  onEdit: (event: StudyEvent) => void
  onDelete: (id: string) => void
}) {
  if (events.length === 0) return null

  return (
    <section className="list">
      <h2 className="list__title">
        {title} <span className="list__count">{events.length}</span>
      </h2>
      <div className="list__items">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            subject={event.subjectId ? subjectById[event.subjectId] : undefined}
            onToggleDone={() => onToggleDone(event.id)}
            onEdit={() => onEdit(event)}
            onDelete={() => onDelete(event.id)}
          />
        ))}
      </div>
    </section>
  )
}
