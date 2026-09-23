// `time` is a naive local datetime string from the API (no UTC offset), so
// parsing and formatting it without a timeZone override just echoes back
// the same wall-clock time — i.e. the searched location's local time.
export function formatLocalTime(time: string): string {
  const date = new Date(time);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
