import React from "react";

interface IbmLogoProps {
  className?: string;
}

export default function IbmLogo({ className = "h-8 w-auto" }: IbmLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 283.5 113.4"
      className={className}
      fill="currentColor"
    >
      {/* Official IBM 8-Bar Vector Graphic */}
      {/* Bar 1 */}
      <rect x="0" y="0" width="66.1" height="9" />
      <rect x="85" y="0" width="93.5" height="9" />
      <rect x="204.1" y="0" width="23.4" height="9" />
      <rect x="237.5" y="0" width="8.5" height="9" />
      <rect x="260.1" y="0" width="23.4" height="9" />

      {/* Bar 2 */}
      <rect x="0" y="14.9" width="66.1" height="9" />
      <rect x="85" y="14.9" width="42.5" height="9" />
      <rect x="136" y="14.9" width="42.5" height="9" />
      <rect x="204.1" y="14.9" width="23.4" height="9" />
      <rect x="234.1" y="14.9" width="15.3" height="9" />
      <rect x="260.1" y="14.9" width="23.4" height="9" />

      {/* Bar 3 */}
      <rect x="21.3" y="29.8" width="23.4" height="9" />
      <rect x="85" y="29.8" width="42.5" height="9" />
      <rect x="136" y="29.8" width="42.5" height="9" />
      <rect x="204.1" y="29.8" width="23.4" height="9" />
      <rect x="230.7" y="29.8" width="22.1" height="9" />
      <rect x="260.1" y="29.8" width="23.4" height="9" />

      {/* Bar 4 */}
      <rect x="21.3" y="44.7" width="23.4" height="9" />
      <rect x="85" y="44.7" width="93.5" height="9" />
      <rect x="204.1" y="44.7" width="23.4" height="9" />
      <rect x="227.3" y="44.7" width="28.9" height="9" />
      <rect x="260.1" y="44.7" width="23.4" height="9" />

      {/* Bar 5 */}
      <rect x="21.3" y="59.6" width="23.4" height="9" />
      <rect x="85" y="59.6" width="93.5" height="9" />
      <rect x="204.1" y="59.6" width="23.4" height="9" />
      <rect x="223.9" y="59.6" width="14.7" height="9" />
      <rect x="244.9" y="59.6" width="14.7" height="9" />
      <rect x="260.1" y="59.6" width="23.4" height="9" />

      {/* Bar 6 */}
      <rect x="21.3" y="74.5" width="23.4" height="9" />
      <rect x="85" y="74.5" width="42.5" height="9" />
      <rect x="136" y="74.5" width="42.5" height="9" />
      <rect x="204.1" y="74.5" width="23.4" height="9" />
      <rect x="220.5" y="74.5" width="11.3" height="9" />
      <rect x="251.7" y="74.5" width="11.3" height="9" />
      <rect x="260.1" y="74.5" width="23.4" height="9" />

      {/* Bar 7 */}
      <rect x="0" y="89.4" width="66.1" height="9" />
      <rect x="85" y="89.4" width="42.5" height="9" />
      <rect x="136" y="89.4" width="42.5" height="9" />
      <rect x="204.1" y="89.4" width="23.4" height="9" />
      <rect x="260.1" y="89.4" width="23.4" height="9" />

      {/* Bar 8 */}
      <rect x="0" y="104.4" width="66.1" height="9" />
      <rect x="85" y="104.4" width="93.5" height="9" />
      <rect x="204.1" y="104.4" width="23.4" height="9" />
      <rect x="260.1" y="104.4" width="23.4" height="9" />
    </svg>
  );
}
