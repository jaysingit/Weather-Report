// `time` is a naive local datetime string from the API (no UTC offset), so
// parsing and formatting it without a timeZone override just echoes back
// the same wall-clock time — i.e. the searched location's local time.
//
// Locale is pinned to "en-US" (rather than left to the device) so the
// 12-hour AM/PM format is consistent everywhere — many locales (e.g. most
// of Europe) default to 24-hour time when the locale is left unspecified.
export function formatLocalTime(time: string): string {
  const date = new Date(time);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
