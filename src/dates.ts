const isoDate = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getSeoulWeekRange(now = new Date()): {
  start: string
  end: string
  label: string
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const localDate = new Date(
    Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)),
  )
  const mondayOffset = (localDate.getUTCDay() + 6) % 7
  const startDate = new Date(localDate)
  startDate.setUTCDate(localDate.getUTCDate() - mondayOffset)
  const endDate = new Date(startDate)
  endDate.setUTCDate(startDate.getUTCDate() + 6)
  const start = isoDate(startDate)
  const end = isoDate(endDate)
  return { start, end, label: `${start} ~ ${end}` }
}
