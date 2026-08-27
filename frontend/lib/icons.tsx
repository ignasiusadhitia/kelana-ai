import React from "react";
import {
  Backpack,
  Compass,
  Users,
  Heart,
  Crown,
  Mountain,
  UtensilsCrossed,
  Flower2,
  Plane,
  Camera,
  Car,
  Bike,
  Waves,
  Landmark,
  ShoppingBag,
  Sparkles,
  Briefcase,
  Snowflake,
  Music,
  FerrisWheel,
  Ship,
  Train,
  Palmtree,
  MountainSnow,
  Building2,
  Castle,
  LucideProps,
} from "lucide-react";

/**
 * Returns a React Lucide Icon component for any given travel style or custom user text.
 * Covers 50+ custom keywords with a graceful default fallback.
 */
export function getTravelStyleIconComponent(
  style?: string | null,
  props: LucideProps = { className: "w-4 h-4" }
): React.ReactElement {
  if (!style) return <Compass {...props} />;
  const lower = style.toLowerCase().trim();

  // 1. Core Personas
  if (lower.includes("backpack") || lower.includes("hostel") || lower.includes("thrifty") || lower.includes("student")) {
    return <Backpack {...props} />;
  }
  if (lower.includes("family") || lower.includes("kid") || lower.includes("child") || lower.includes("toddler") || lower.includes("parent")) {
    return <Users {...props} />;
  }
  if (lower.includes("couple") || lower.includes("romantic") || lower.includes("romance") || lower.includes("honeymoon") || lower.includes("partner") || lower.includes("anniversary")) {
    return <Heart {...props} />;
  }
  if (lower.includes("luxury") || lower.includes("5-star") || lower.includes("premium") || lower.includes("vip") || lower.includes("first class") || lower.includes("exclusive")) {
    return <Crown {...props} />;
  }
  if (lower.includes("solo") || lower.includes("single") || lower.includes("nomad") || lower.includes("independent") || lower.includes("wanderer")) {
    return <Compass {...props} />;
  }

  // 2. Outdoor, Nature & Thrills
  if (lower.includes("dive") || lower.includes("diving") || lower.includes("scuba") || lower.includes("snorkel") || lower.includes("surf") || lower.includes("surfing") || lower.includes("ocean") || lower.includes("marine")) {
    return <Waves {...props} />;
  }
  if (lower.includes("adventure") || lower.includes("hike") || lower.includes("hiking") || lower.includes("trek") || lower.includes("climb") || lower.includes("mountain") || lower.includes("nature")) {
    return <Mountain {...props} />;
  }
  if (lower.includes("bike") || lower.includes("biking") || lower.includes("cycle") || lower.includes("cycling") || lower.includes("bicycle")) {
    return <Bike {...props} />;
  }
  if (lower.includes("ski") || lower.includes("snow") || lower.includes("winter") || lower.includes("snowboard") || lower.includes("glacier")) {
    return <Snowflake {...props} />;
  }

  // 3. Vehicles & Transit
  if (lower.includes("road") || lower.includes("drive") || lower.includes("driving") || lower.includes("car") || lower.includes("van") || lower.includes("camper")) {
    return <Car {...props} />;
  }
  if (lower.includes("cruise") || lower.includes("boat") || lower.includes("sail") || lower.includes("sailing") || lower.includes("yacht") || lower.includes("ferry")) {
    return <Ship {...props} />;
  }
  if (lower.includes("train") || lower.includes("rail") || lower.includes("railway")) {
    return <Train {...props} />;
  }

  // 4. Food & Dining
  if (lower.includes("food") || lower.includes("foodie") || lower.includes("culinary") || lower.includes("dining") || lower.includes("street food") || lower.includes("michelin") || lower.includes("market") || lower.includes("gourmet") || lower.includes("coffee") || lower.includes("cafe")) {
    return <UtensilsCrossed {...props} />;
  }

  // 5. Wellness & Relaxation
  if (lower.includes("wellness") || lower.includes("spa") || lower.includes("massage") || lower.includes("onsen") || lower.includes("hot spring") || lower.includes("yoga") || lower.includes("meditation") || lower.includes("retreat") || lower.includes("relax") || lower.includes("zen")) {
    return <Flower2 {...props} />;
  }

  // 6. Culture, Art & Sightseeing
  if (lower.includes("photo") || lower.includes("photography") || lower.includes("camera") || lower.includes("sightseeing") || lower.includes("viewpoint") || lower.includes("scenic")) {
    return <Camera {...props} />;
  }
  if (lower.includes("history") || lower.includes("historic") || lower.includes("heritage") || lower.includes("museum") || lower.includes("temple") || lower.includes("shrine") || lower.includes("ancient") || lower.includes("monument") || lower.includes("castle")) {
    return <Landmark {...props} />;
  }
  if (lower.includes("shop") || lower.includes("shopping") || lower.includes("mall") || lower.includes("fashion") || lower.includes("boutique") || lower.includes("souvenir")) {
    return <ShoppingBag {...props} />;
  }
  if (lower.includes("disney") || lower.includes("theme park") || lower.includes("amusement") || lower.includes("anime") || lower.includes("gaming")) {
    return <FerrisWheel {...props} />;
  }
  if (lower.includes("sparkle") || lower.includes("magic") || lower.includes("fantasy") || lower.includes("special")) {
    return <Sparkles {...props} />;
  }
  if (lower.includes("music") || lower.includes("concert") || lower.includes("live music") || lower.includes("party") || lower.includes("nightlife")) {
    return <Music {...props} />;
  }
  if (lower.includes("work") || lower.includes("workation") || lower.includes("business") || lower.includes("remote") || lower.includes("corporate") || lower.includes("digital nomad")) {
    return <Briefcase {...props} />;
  }

  return <Plane {...props} />;
}

export interface DestinationBadgeInfo {
  icon: React.ReactElement;
  containerClass: string;
}

/**
 * Returns a themed Lucide Vector icon and glassmorphic badge style for any destination.
 */
export function getDestinationVectorBadge(destination: string): DestinationBadgeInfo {
  if (!destination) {
    return {
      icon: <Plane className="w-5 h-5 text-blue-400" />,
      containerClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    };
  }
  const lower = destination.toLowerCase().trim();

  // Tropical / Island / Beach
  if (
    lower.includes("bali") ||
    lower.includes("maldives") ||
    lower.includes("phuket") ||
    lower.includes("hawaii") ||
    lower.includes("beach") ||
    lower.includes("island") ||
    lower.includes("komodo") ||
    lower.includes("lombok") ||
    lower.includes("cancun") ||
    lower.includes("boracay") ||
    lower.includes("raja ampat")
  ) {
    return {
      icon: <Palmtree className="w-5 h-5 text-emerald-400" />,
      containerClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    };
  }

  // Alpine / Mountain / Snow
  if (
    lower.includes("swiss") ||
    lower.includes("zurich") ||
    lower.includes("alps") ||
    lower.includes("fuji") ||
    lower.includes("hokkaido") ||
    lower.includes("banff") ||
    lower.includes("mountain") ||
    lower.includes("nepal") ||
    lower.includes("everest") ||
    lower.includes("iceland") ||
    lower.includes("norway")
  ) {
    return {
      icon: <MountainSnow className="w-5 h-5 text-sky-400" />,
      containerClass: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    };
  }

  // Heritage / Ancient / Historic Temples
  if (
    lower.includes("rome") ||
    lower.includes("italy") ||
    lower.includes("athens") ||
    lower.includes("greece") ||
    lower.includes("kyoto") ||
    lower.includes("egypt") ||
    lower.includes("cairo") ||
    lower.includes("petra") ||
    lower.includes("yogyakarta") ||
    lower.includes("temple") ||
    lower.includes("taj mahal")
  ) {
    return {
      icon: <Landmark className="w-5 h-5 text-amber-400" />,
      containerClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    };
  }

  // European Castles & Regal Heritage
  if (
    lower.includes("paris") ||
    lower.includes("france") ||
    lower.includes("prague") ||
    lower.includes("london") ||
    lower.includes("edinburgh") ||
    lower.includes("vienna") ||
    lower.includes("germany") ||
    lower.includes("spain") ||
    lower.includes("barcelona") ||
    lower.includes("castle")
  ) {
    return {
      icon: <Castle className="w-5 h-5 text-purple-400" />,
      containerClass: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    };
  }

  // Modern Megacities / Metropolises
  if (
    lower.includes("tokyo") ||
    lower.includes("new york") ||
    lower.includes("nyc") ||
    lower.includes("singapore") ||
    lower.includes("seoul") ||
    lower.includes("hong kong") ||
    lower.includes("dubai") ||
    lower.includes("shanghai") ||
    lower.includes("jakarta") ||
    lower.includes("kuala lumpur") ||
    lower.includes("sydney") ||
    lower.includes("chicago") ||
    lower.includes("city")
  ) {
    return {
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      containerClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    };
  }

  return {
    icon: <Plane className="w-5 h-5 text-blue-400" />,
    containerClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
}
