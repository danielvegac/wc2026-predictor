// ============================================================
// Colombia Time (America/Bogota, UTC-5, no DST) helpers
// ============================================================
// All match dates/kickoffs in this app are stored as the
// Colombia calendar date ("YYYY-MM-DD") and a kickoffCOT time
// string ("h:mm AM/PM"). These helpers compute "today" and date
// labels explicitly in America/Bogota so the schedule looks the
// same regardless of the viewer's browser timezone.

const COLOMBIA_TZ = "America/Bogota";

/** Today's date as YYYY-MM-DD in America/Bogota, regardless of browser timezone */
export function getTodayCOT(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Format a "YYYY-MM-DD" date string as a long weekday label, anchored to America/Bogota */
export function formatDateLabelCOT(dateStr: string): string {
  // Anchor at UTC noon so the fixed -05:00 Bogota offset never rolls the date over
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    timeZone: COLOMBIA_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Parse a "h:mm AM/PM" kickoff time into minutes since midnight, for sorting */
export function parseKickoffMinutesCOT(kickoff?: string): number {
  if (!kickoff) return 720; // default to noon
  const match = kickoff.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 720;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}
