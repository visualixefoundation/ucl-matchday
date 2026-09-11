// Display timezone for the site — East Africa Time (UTC+3).
export const DISPLAY_TZ = "Africa/Nairobi";

export function formatKickoffTime(dateIso: string): string {
  // e.g. "10:00 PM" in EAT
  return new Date(dateIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TZ
  });
}

export function formatKickoffDateTime(dateIso: string): string {
  return new Date(dateIso).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TZ
  });
}

/** Calendar day key (YYYY-MM-DD) in EAT for grouping fixtures. */
export function dayKeyEAT(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-CA", {
    timeZone: DISPLAY_TZ
  });
}

export function formatDayLabelEAT(isoDate: string): string {
  const noonUtcApprox = new Date(isoDate + "T12:00:00.000Z");
  const todayEAT = dayKeyEAT(new Date().toISOString());
  const tomorrowEAT = dayKeyEAT(
    new Date(Date.now() + 86400000).toISOString()
  );
  if (isoDate === todayEAT) return "Today";
  if (isoDate === tomorrowEAT) return "Tomorrow";
  return noonUtcApprox.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TZ
  });
}
