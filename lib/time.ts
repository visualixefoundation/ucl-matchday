// Display timezone for the site — East Africa Time (UTC+3).
export const DISPLAY_TZ = "Africa/Nairobi";

export function formatKickoffTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TZ
  });
}

export function formatKickoffDateTime(dateIso: string): string {
  return new Date(dateIso).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
  // isoDate is YYYY-MM-DD interpreted as that calendar day in EAT
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
