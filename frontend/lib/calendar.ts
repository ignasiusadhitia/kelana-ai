/**
 * RFC 5545 Compliant iCalendar (.ics) Generator for KelanaAI
 * Allows travelers to export AI-generated itineraries into Google Calendar,
 * Apple Calendar, and Microsoft Outlook with zero third-party dependencies.
 */

import { TripResponse } from "@/types/trip";

function formatIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatIcsDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Generates and triggers download of an RFC 5545 compliant .ics calendar file for the trip itinerary.
 *
 * @param trip The trip data containing destination, days, and AI markdown itinerary
 */
export function generateTripIcs(trip: TripResponse): void {
  const destination = trip.destination || "Destination";
  const rawText = trip.ai_recommendation || "";
  const totalDays = trip.days || 1;

  // Base trip start date: start from tomorrow if created recently
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(9, 0, 0, 0);

  // Parse markdown itinerary into daily activity blocks
  const dayBlocks: { dayNum: number; title: string; content: string }[] = [];

  // Split by Day headings (e.g. ## Day 1, Day 1:, ### Hari 1)
  const dayRegex = /(?:^|\n)(?:#{1,3}\s*)?(?:Day|Hari)\s+(\d+)[:\s\-–—]*([\s\S]*?)(?=(?:\n(?:#{1,3}\s*)?(?:Day|Hari)\s+\d+)|\n##|\n---|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = dayRegex.exec(rawText)) !== null) {
    const dayNum = parseInt(match[1], 10);
    const title = match[2]?.trim() || `Day ${dayNum} in ${destination}`;
    const content = match[0].trim();
    dayBlocks.push({ dayNum, title, content });
  }

  // Fallback: If no structured "Day X" was matched, create single or day-by-day blocks
  if (dayBlocks.length === 0) {
    for (let i = 1; i <= totalDays; i++) {
      dayBlocks.push({
        dayNum: i,
        title: `Explore ${destination} - Day ${i}`,
        content: `Travel activity for Day ${i} of ${totalDays} in ${destination}.\n\nRefer to KelanaAI for complete budget and transport details.`,
      });
    }
  }

  // Assemble VCALENDAR content
  const nowStamp = formatIcsDate(new Date());
  const vEvents: string[] = [];

  for (const block of dayBlocks) {
    const eventDate = new Date(startDate);
    eventDate.setDate(startDate.getDate() + (block.dayNum - 1));

    const nextDay = new Date(eventDate);
    nextDay.setDate(eventDate.getDate() + 1);

    const uid = `kelana-trip-${trip.id}-day-${block.dayNum}-${Date.now()}@kelana.ai`;
    const summary = `${destination}: Day ${block.dayNum} - ${block.title || "Travel Itinerary"}`;
    // Truncate description preview cleanly for calendar invite
    const cleanDesc = block.content.replace(/[#*`_]/g, "").slice(0, 800);

    vEvents.push([
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${formatIcsDateOnly(eventDate)}`,
      `DTEND;VALUE=DATE:${formatIcsDateOnly(nextDay)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(cleanDesc)}`,
      `LOCATION:${escapeIcsText(destination)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    ].join("\r\n"));
  }

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KelanaAI//Travel Companion//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:KelanaAI - ${destination} (${totalDays} Days)`,
    `X-WR-TIMEZONE:UTC`,
    ...vEvents,
    "END:VCALENDAR",
  ].join("\r\n");

  // Trigger client-side file download
  const blob = new Blob([icsLines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${destination.toLowerCase().replace(/[^a-z0-9]/g, "-")}-itinerary.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
