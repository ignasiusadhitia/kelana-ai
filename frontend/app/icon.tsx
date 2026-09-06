import { ImageResponse } from "next/og";

// ARCHITECTURE: Dynamic Next.js Favicon Generator
// Generates a pixel-perfect circular PNG icon matching the official KelanaAI compass logo.

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

/**
 * Generates dynamic circular PNG favicon matching the official KelanaAI compass logo badge.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#09090b",
          border: "1.5px solid #27272a",
          overflow: "hidden",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
        >
          {/* Outer Compass Ring */}
          <circle
            cx="16"
            cy="16"
            r="10.5"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeOpacity="0.5"
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

          {/* North Needle (Cyan-Blue) */}
          <polygon points="16,8 19.5,16 16,14.2 12.5,16" fill="#38bdf8" />

          {/* South Needle (Coral-Red) */}
          <polygon
            points="16,24 19.5,16 16,17.8 12.5,16"
            fill="#f43f5e"
            opacity="0.9"
          />

          {/* Center Pivot Pin */}
          <circle cx="16" cy="16" r="2" fill="#ffffff" />
          <circle cx="16" cy="16" r="0.75" fill="#09090b" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
