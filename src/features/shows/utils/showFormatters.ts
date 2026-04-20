import type { ShowDetail } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function buildMetaFields(show: ShowDetail) {
  return [
    { label: 'Status',      value: show.status },
    { label: 'Network',     value: show.network?.name },
    { label: 'Country',     value: show.network?.country?.name },
    { label: 'Web Channel', value: show.webChannel?.name },
    { label: 'Language',    value: show.language },
    { label: 'Runtime',     value: show.runtime ? `${show.runtime} min` : null },
    { label: 'Premiered',   value: show.premiered ? formatDate(show.premiered) : null },
    { label: 'Ended',       value: show.ended ? formatDate(show.ended) : null },
    { label: 'Schedule',    value: show.schedule?.days?.length ? `${show.schedule.days.join(', ')} at ${show.schedule.time}` : null },
  ].filter((f) => Boolean(f.value)) as { label: string; value: string }[]
}
