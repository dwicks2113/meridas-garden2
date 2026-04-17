interface BoxerLogoProps {
  size?: number;
  className?: string;
  showBee?: boolean;
  showButterfly?: boolean;
}

export default function BoxerLogo({
  size = 48,
  className = "",
  showBee = false,
  showButterfly = false,
}: BoxerLogoProps) {
  // Image is roughly square — boxer fills the frame
  const h = size;

  return (
    <div
      style={{ position: "relative", width: size, height: h, flexShrink: 0 }}
      className={className}
    >
      {/* The real boxer mascot image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/boxer-mascot.png"
        alt="Merida's Garden mascot — a cartoon Boxer dog"
        width={size}
        height={h}
        style={{ width: size, height: h, objectFit: "contain", display: "block" }}
      />

      {/* SVG overlay for animated bee + butterfly */}
      {(showBee || showButterfly) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          {/* ── ANIMATED BEE ── */}
          {showBee && (
            <g>
              <animateMotion
                dur="3.8s"
                repeatCount="indefinite"
                path="M 175 30 Q 195 10 178 -2 Q 160 -14 148 4 Q 136 22 155 34 Q 168 44 175 30 Z"
              />
              {/* Body */}
              <ellipse cx="0" cy="0" rx="8" ry="5" fill="#FFD700" stroke="#333" strokeWidth="0.9" />
              {/* Stripes */}
              <rect x="-5.5" y="-2.2" width="3"   height="4.4" fill="#333" rx="0.6" />
              <rect x="-1"   y="-2.2" width="3"   height="4.4" fill="#333" rx="0.6" />
              <rect x="3.5"  y="-2.2" width="2.5" height="4.4" fill="#333" rx="0.6" />
              {/* Wings */}
              <ellipse cx="-2" cy="-6" rx="7" ry="4" fill="rgba(210,235,255,0.85)" stroke="#bbb" strokeWidth="0.6">
                <animateTransform attributeName="transform" type="rotate" values="0;12;-12;0" dur="0.13s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="4"  cy="-6" rx="7" ry="4" fill="rgba(210,235,255,0.85)" stroke="#bbb" strokeWidth="0.6">
                <animateTransform attributeName="transform" type="rotate" values="0;-12;12;0" dur="0.13s" repeatCount="indefinite" />
              </ellipse>
              {/* Stinger */}
              <polygon points="8,0 14,0 10,3.5" fill="#333" />
              {/* Eye */}
              <circle cx="-6" cy="-1" r="1.5" fill="#333" />
              {/* Antennae */}
              <line x1="-5" y1="-4" x2="-9" y2="-9" stroke="#333" strokeWidth="1" />
              <circle cx="-9.5" cy="-9.5" r="1.2" fill="#333" />
              <line x1="-2" y1="-4.5" x2="-4" y2="-9" stroke="#333" strokeWidth="1" />
              <circle cx="-4.5" cy="-9.5" r="1.2" fill="#333" />
            </g>
          )}

          {/* ── ANIMATED BUTTERFLY ── */}
          {showButterfly && (
            <g>
              <animateMotion
                dur="5.5s"
                repeatCount="indefinite"
                path="M 15 75 Q -8 50 10 28 Q 28 6 48 28 Q 65 48 42 72 Q 24 90 15 75 Z"
              />
              {/* Upper wings */}
              <ellipse cx="-8" cy="-6" rx="13" ry="9" fill="#FF7043" stroke="#bf360c" strokeWidth="0.8" opacity="0.92">
                <animateTransform attributeName="transform" type="scale" values="1,1;0.15,1;1,1" dur="0.38s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="8"  cy="-6" rx="13" ry="9" fill="#FF7043" stroke="#bf360c" strokeWidth="0.8" opacity="0.92">
                <animateTransform attributeName="transform" type="scale" values="1,1;0.15,1;1,1" dur="0.38s" repeatCount="indefinite" />
              </ellipse>
              {/* Lower wings */}
              <ellipse cx="-7" cy="7" rx="9" ry="7" fill="#FF8A65" stroke="#bf360c" strokeWidth="0.8" opacity="0.88">
                <animateTransform attributeName="transform" type="scale" values="1,1;0.15,1;1,1" dur="0.38s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="7"  cy="7" rx="9" ry="7" fill="#FF8A65" stroke="#bf360c" strokeWidth="0.8" opacity="0.88">
                <animateTransform attributeName="transform" type="scale" values="1,1;0.15,1;1,1" dur="0.38s" repeatCount="indefinite" />
              </ellipse>
              {/* Wing spots */}
              <circle cx="-8" cy="-7" r="3" fill="black" opacity="0.25" />
              <circle cx="8"  cy="-7" r="3" fill="black" opacity="0.25" />
              {/* Body */}
              <ellipse cx="0" cy="0" rx="2" ry="10" fill="#3e2010" />
              {/* Antennae */}
              <line x1="-1" y1="-9" x2="-6" y2="-17" stroke="#3e2010" strokeWidth="1" />
              <circle cx="-6.5" cy="-17.5" r="1.5" fill="#3e2010" />
              <line x1="1"  y1="-9" x2="6"  y2="-17" stroke="#3e2010" strokeWidth="1" />
              <circle cx="6.5"  cy="-17.5" r="1.5" fill="#3e2010" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
