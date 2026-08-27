import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with standard clsx resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to strictly limit and round any decimal number to maximum 2 decimal places.
 * Handles floating-point arithmetic precision (e.g. 1.005 -> 1.01).
 *
 * @param value Number or numeric string to round
 * @returns Clean numeric value with at most 2 decimal places
 */
export function roundToTwoDecimals(value: number | string): number {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number with commas and at most 2 decimal places.
 * E.g.: 1428.5714 -> "1,428.57", 2000 -> "2,000"
 */
export function formatDecimal(
  value: number | string,
  options?: { minFractionDigits?: number; maxFractionDigits?: number }
): string {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return "0";
  return numeric.toLocaleString("en-US", {
    minimumFractionDigits: options?.minFractionDigits ?? 0,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  });
}

/**
 * Formats a numeric or string budget into clean USD currency display with at most 2 decimal digits.
 * E.g.: 2000 -> "USD 2,000", 1428.5714 -> "USD 1,428.57"
 */
export function formatBudget(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "USD 0";
  return `USD ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Maps destination names dynamically to iconic landmarks, cultural heritage symbols,
 * country flags, and geographical features for rich card visuals.
 */
export function getDestinationIcon(destination: string): string {
  if (!destination) return "✈️";
  const lower = destination.toLowerCase().trim();

  // 1. Specific Iconic Cities & Regions
  if (lower.includes("tokyo") || lower.includes("kyoto") || lower.includes("osaka") || lower.includes("japan") || lower.includes("fuji") || lower.includes("hokkaido") || lower.includes("okinawa")) return "🗼";
  if (lower.includes("paris") || lower.includes("france") || lower.includes("nice") || lower.includes("lyon") || lower.includes("bordeaux")) return "🥐";
  if (lower.includes("rome") || lower.includes("italy") || lower.includes("florence") || lower.includes("venice") || lower.includes("milan") || lower.includes("naples") || lower.includes("amalfi") || lower.includes("sicily")) return "🏛️";
  if (lower.includes("london") || lower.includes("uk") || lower.includes("england") || lower.includes("britain") || lower.includes("scotland") || lower.includes("edinburgh")) return "💂";
  if (lower.includes("new york") || lower.includes("nyc") || lower.includes("manhattan")) return "🗽";
  if (lower.includes("san francisco") || lower.includes("golden gate")) return "🌁";
  if (lower.includes("las vegas") || lower.includes("vegas")) return "🎰";
  if (lower.includes("los angeles") || lower.includes("hollywood") || lower.includes("california")) return "🎬";
  if (lower.includes("hawaii") || lower.includes("honolulu") || lower.includes("maui") || lower.includes("oahu")) return "🌺";
  if (lower.includes("bali") || lower.includes("lombok") || lower.includes("komodo") || lower.includes("raja ampat") || lower.includes("labuan bajo") || lower.includes("gili")) return "🏝️";
  if (lower.includes("indonesia") || lower.includes("jakarta") || lower.includes("yogyakarta") || lower.includes("bandung") || lower.includes("kuningan") || lower.includes("surabaya") || lower.includes("cigugur")) return "🇮🇩";
  if (lower.includes("singapore") || lower.includes("sentosa")) return "🦁";
  if (lower.includes("seoul") || lower.includes("korea") || lower.includes("busan") || lower.includes("jeju") || lower.includes("pyongyang")) return "🏯";
  if (lower.includes("bangkok") || lower.includes("thailand") || lower.includes("phuket") || lower.includes("chiang mai") || lower.includes("krabi") || lower.includes("pattaya")) return "🛕";
  if (lower.includes("vietnam") || lower.includes("hanoi") || lower.includes("ho chi minh") || lower.includes("da nang") || lower.includes("hoi an") || lower.includes("saigon")) return "🇻🇳";
  if (lower.includes("malaysia") || lower.includes("kuala lumpur") || lower.includes("penang") || lower.includes("langkawi")) return "🇲🇾";
  if (lower.includes("philippines") || lower.includes("manila") || lower.includes("boracay") || lower.includes("cebu") || lower.includes("palawan")) return "🇵🇭";
  if (lower.includes("china") || lower.includes("beijing") || lower.includes("shanghai") || lower.includes("guangzhou") || lower.includes("chengdu")) return "🥟";
  if (lower.includes("hong kong") || lower.includes("macau")) return "🌃";
  if (lower.includes("taiwan") || lower.includes("taipei") || lower.includes("kaohsiung")) return "🧋";
  if (lower.includes("india") || lower.includes("delhi") || lower.includes("mumbai") || lower.includes("taj mahal") || lower.includes("goa") || lower.includes("jaipur")) return "🇮🇳";
  if (lower.includes("dubai") || lower.includes("uae") || lower.includes("abu dhabi")) return "🏙️";
  if (lower.includes("saudi") || lower.includes("mecca") || lower.includes("medina") || lower.includes("riyadh") || lower.includes("jeddah")) return "🕌";
  if (lower.includes("turkey") || lower.includes("istanbul") || lower.includes("cappadocia") || lower.includes("antalya")) return "🇹🇷";
  if (lower.includes("egypt") || lower.includes("cairo") || lower.includes("giza") || lower.includes("pyramid") || lower.includes("luxor") || lower.includes("nile")) return "🐫";
  if (lower.includes("tanzania") || lower.includes("zanzibar") || lower.includes("kilimanjaro") || lower.includes("serengeti") || lower.includes("kenya") || lower.includes("nairobi") || lower.includes("safari")) return "🦁";
  if (lower.includes("nigeria") || lower.includes("lagos") || lower.includes("abuja")) return "🇳🇬";
  if (lower.includes("south africa") || lower.includes("cape town") || lower.includes("johannesburg")) return "🇿🇦";
  if (lower.includes("morocco") || lower.includes("marrakech") || lower.includes("casablanca") || lower.includes("fez")) return "🇲🇦";
  if (lower.includes("australia") || lower.includes("sydney") || lower.includes("melbourne") || lower.includes("brisbane") || lower.includes("perth")) return "🦘";
  if (lower.includes("new zealand") || lower.includes("auckland") || lower.includes("queenstown") || lower.includes("wellington") || lower.includes("rotorua")) return "🥝";
  if (lower.includes("switzerland") || lower.includes("swiss") || lower.includes("zurich") || lower.includes("geneva") || lower.includes("interlaken") || lower.includes("zermatt") || lower.includes("alps")) return "🏔️";
  if (lower.includes("germany") || lower.includes("berlin") || lower.includes("munich") || lower.includes("frankfurt") || lower.includes("hamburg")) return "🥨";
  if (lower.includes("netherlands") || lower.includes("amsterdam") || lower.includes("rotterdam") || lower.includes("holland")) return "🌷";
  if (lower.includes("spain") || lower.includes("barcelona") || lower.includes("madrid") || lower.includes("seville") || lower.includes("valencia") || lower.includes("ibiza")) return "🥘";
  if (lower.includes("portugal") || lower.includes("lisbon") || lower.includes("porto") || lower.includes("algarve")) return "🇵🇹";
  if (lower.includes("greece") || lower.includes("athens") || lower.includes("santorini") || lower.includes("mykonos") || lower.includes("crete")) return "🇬🇷";
  if (lower.includes("austria") || lower.includes("vienna") || lower.includes("salzburg") || lower.includes("hallstatt")) return "🎻";
  if (lower.includes("czech") || lower.includes("prague")) return "🏰";
  if (lower.includes("hungary") || lower.includes("budapest")) return "🇭🇺";
  if (lower.includes("iceland") || lower.includes("reykjavik")) return "🧊";
  if (lower.includes("norway") || lower.includes("oslo") || lower.includes("tromso") || lower.includes("fjord") || lower.includes("aurora") || lower.includes("sweden") || lower.includes("stockholm") || lower.includes("finland") || lower.includes("helsinki")) return "🌌";
  if (lower.includes("russia") || lower.includes("moscow") || lower.includes("petersburg")) return "🪆";
  if (lower.includes("brazil") || lower.includes("rio") || lower.includes("sao paulo") || lower.includes("amazon")) return "🇧🇷";
  if (lower.includes("argentina") || lower.includes("buenos aires") || lower.includes("patagonia")) return "🇦🇷";
  if (lower.includes("mexico") || lower.includes("cancun") || lower.includes("tulum") || lower.includes("cabo")) return "🌮";
  if (lower.includes("peru") || lower.includes("lima") || lower.includes("cusco") || lower.includes("machu picchu")) return "🦙";
  if (lower.includes("canada") || lower.includes("toronto") || lower.includes("vancouver") || lower.includes("banff") || lower.includes("montreal")) return "🍁";
  if (lower.includes("maldives")) return "🪸";
  if (lower.includes("nepal") || lower.includes("kathmandu") || lower.includes("everest") || lower.includes("himalaya")) return "⛰️";
  if (lower.includes("jordan") || lower.includes("petra") || lower.includes("amman")) return "🏺";
  if (lower.includes("usa") || lower.includes("america") || lower.includes("united states") || lower.includes("chicago") || lower.includes("miami") || lower.includes("orlando")) return "🇺🇸";

  // 2. Thematic / Geographic Keyword Fallbacks
  if (lower.includes("beach") || lower.includes("island") || lower.includes("coast") || lower.includes("bay") || lower.includes("resort")) return "🏖️";
  if (lower.includes("mountain") || lower.includes("hill") || lower.includes("peak") || lower.includes("trek") || lower.includes("trail")) return "🏔️";
  if (lower.includes("safari") || lower.includes("jungle") || lower.includes("wildlife") || lower.includes("park")) return "🦁";
  if (lower.includes("desert") || lower.includes("dune") || lower.includes("oasis")) return "🏜️";
  if (lower.includes("temple") || lower.includes("shrine") || lower.includes("pagoda")) return "🛕";
  if (lower.includes("castle") || lower.includes("palace") || lower.includes("fort")) return "🏰";
  if (lower.includes("lake") || lower.includes("river") || lower.includes("sea") || lower.includes("cruise")) return "⛵";
  if (lower.includes("snow") || lower.includes("ski") || lower.includes("winter")) return "⛷️";
  if (lower.includes("city") || lower.includes("downtown") || lower.includes("capital")) return "🏙️";

  return "✈️";
}

/**
 * Resolves visual icon and normalized presentation for all travel styles & personas.
 * Features an intelligent keyword matching engine for custom user input (50+ keyword mappings).
 */
export function getTravelStyleIcon(style?: string | null): string {
  if (!style) return "🧭";
  const lower = style.toLowerCase().trim();

  // 1. Core Personas
  if (lower.includes("backpack") || lower.includes("hostel") || lower.includes("thrifty") || lower.includes("student")) return "🎒";
  if (lower.includes("family") || lower.includes("kid") || lower.includes("child") || lower.includes("toddler") || lower.includes("parent")) return "👨‍👩‍👧";
  if (lower.includes("couple") || lower.includes("romantic") || lower.includes("romance") || lower.includes("honeymoon") || lower.includes("partner") || lower.includes("anniversary")) return "✨";
  if (lower.includes("luxury") || lower.includes("5-star") || lower.includes("premium") || lower.includes("vip") || lower.includes("first class") || lower.includes("exclusive")) return "👑";
  if (lower.includes("solo") || lower.includes("single") || lower.includes("nomad") || lower.includes("independent") || lower.includes("wanderer")) return "🧭";

  // 2. Outdoor, Nature & Thrills
  if (lower.includes("dive") || lower.includes("diving") || lower.includes("scuba") || lower.includes("snorkel") || lower.includes("underwater")) return "🤿";
  if (lower.includes("surf") || lower.includes("surfing") || lower.includes("kayak") || lower.includes("rafting") || lower.includes("paddle")) return "🏄";
  if (lower.includes("camp") || lower.includes("camping") || lower.includes("glamping") || lower.includes("tent")) return "⛺";
  if (lower.includes("hike") || lower.includes("hiking") || lower.includes("trek") || lower.includes("trekking") || lower.includes("climb") || lower.includes("trail")) return "🥾";
  if (lower.includes("bike") || lower.includes("biking") || lower.includes("cycle") || lower.includes("cycling") || lower.includes("bicycle")) return "🚴";
  if (lower.includes("ski") || lower.includes("snow") || lower.includes("winter") || lower.includes("snowboard") || lower.includes("glacier")) return "🏂";
  if (lower.includes("adventure") || lower.includes("outdoor") || lower.includes("nature") || lower.includes("jungle") || lower.includes("forest") || lower.includes("eco")) return "🌿";

  // 3. Vehicles & Transit
  if (lower.includes("road") || lower.includes("drive") || lower.includes("driving") || lower.includes("car") || lower.includes("van") || lower.includes("camper")) return "🚗";
  if (lower.includes("cruise") || lower.includes("boat") || lower.includes("sail") || lower.includes("sailing") || lower.includes("yacht") || lower.includes("ferry")) return "🚢";
  if (lower.includes("train") || lower.includes("rail") || lower.includes("railway")) return "🚆";

  // 4. Food, Dining & Nightlife
  if (lower.includes("food") || lower.includes("foodie") || lower.includes("culinary") || lower.includes("dining") || lower.includes("street food") || lower.includes("michelin") || lower.includes("market") || lower.includes("gourmet") || lower.includes("coffee") || lower.includes("cafe") || lower.includes("wine") || lower.includes("beer")) return "🍜";
  if (lower.includes("nightlife") || lower.includes("club") || lower.includes("party") || lower.includes("festival") || lower.includes("bar") || lower.includes("pub") || lower.includes("cocktail") || lower.includes("dance")) return "🪩";

  // 5. Wellness, Relaxation & Tropical
  if (lower.includes("wellness") || lower.includes("spa") || lower.includes("massage") || lower.includes("onsen") || lower.includes("hot spring") || lower.includes("sauna") || lower.includes("yoga") || lower.includes("meditation") || lower.includes("retreat") || lower.includes("relax") || lower.includes("zen")) return "🧘";
  if (lower.includes("beach") || lower.includes("island") || lower.includes("tropical") || lower.includes("coastal") || lower.includes("resort") || lower.includes("sun")) return "🏖️";

  // 6. Culture, Art & Sightseeing
  if (lower.includes("photo") || lower.includes("photography") || lower.includes("camera") || lower.includes("sightseeing") || lower.includes("viewpoint") || lower.includes("scenic")) return "📸";
  if (lower.includes("history") || lower.includes("historic") || lower.includes("heritage") || lower.includes("museum") || lower.includes("temple") || lower.includes("shrine") || lower.includes("ancient") || lower.includes("monument") || lower.includes("castle")) return "🏛️";
  if (lower.includes("art") || lower.includes("gallery") || lower.includes("design") || lower.includes("craft") || lower.includes("architecture") || lower.includes("theater")) return "🎨";
  if (lower.includes("shop") || lower.includes("shopping") || lower.includes("mall") || lower.includes("fashion") || lower.includes("boutique") || lower.includes("souvenir")) return "🛍️";
  if (lower.includes("disney") || lower.includes("theme park") || lower.includes("amusement") || lower.includes("anime") || lower.includes("gaming")) return "🎡";
  if (lower.includes("music") || lower.includes("concert") || lower.includes("live music")) return "🎵";
  if (lower.includes("work") || lower.includes("workation") || lower.includes("business") || lower.includes("remote") || lower.includes("corporate") || lower.includes("digital nomad")) return "💼";

  return "✈️";
}

