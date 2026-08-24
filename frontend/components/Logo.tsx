import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * COMPONENT: Logo
 * Official KelanaAI brand logo vector with circular compass badge (rounded-full).
 */

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 32, className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0 rounded-full", className)}
      {...props}
    >
      {/* Dark Slate Circular Badge Base */}
      <circle cx="16" cy="16" r="15.25" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />

      {/* Outer Compass Dial Ring */}
      <circle
        cx="16"
        cy="16"
        r="10.5"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        strokeDasharray="1.5 2"
      />

      {/* Cardinal Tick Marks */}
      <line
        x1="16"
        y1="4.5"
        x2="16"
        y2="7"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="25"
        x2="16"
        y2="27.5"
        stroke="#71717a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="4.5"
        y1="16"
        x2="7"
        y2="16"
        stroke="#71717a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="25"
        y1="16"
        x2="27.5"
        y2="16"
        stroke="#71717a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* North Needle (Vibrant Cyan-Blue) */}
      <polygon points="16,8 19.5,16 16,14.2 12.5,16" fill="#38bdf8" />

      {/* South Needle (Vibrant Coral-Red) */}
      <polygon
        points="16,24 19.5,16 16,17.8 12.5,16"
        fill="#f43f5e"
        opacity="0.9"
      />

      {/* Center Pivot Pin */}
      <circle cx="16" cy="16" r="2" fill="#ffffff" />
      <circle cx="16" cy="16" r="0.75" fill="#09090b" />
    </svg>
  );
}
