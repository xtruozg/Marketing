import React from 'react';

// 1. Premium Logo for "Rút tiền" (Withdrawal)
// An elegant combination of a gold bank-card, glossy coins, and an emerald-green secure arrow representing transactions.
export const WithdrawLogo: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-14 filter drop-shadow-[0_4px_8px_rgba(16,185,129,0.25)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Radial Gradient */}
        <radialGradient id="withdrawBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </radialGradient>
        {/* Gold gradients for card & coins */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF6F00" />
        </linearGradient>
        {/* Card gloss effect */}
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
        {/* Emerald green gradient for arrow */}
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Outer Glow Circle */}
      <circle cx="50" cy="50" r="46" fill="url(#withdrawBg)" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#34D399" strokeWidth="2" strokeDasharray="3 3" />

      {/* Credit Card representation in background */}
      <rect x="25" y="32" width="44" height="28" rx="4" fill="url(#goldGrad)" stroke="#E28900" strokeWidth="1" />
      {/* Magnetic stripe */}
      <rect x="25" y="38" width="44" height="5" fill="#3E2723" />
      {/* Card chip */}
      <rect x="30" y="47" width="6" height="5" rx="1" fill="#ECEFF1" stroke="#B0BEC5" strokeWidth="0.5" />

      {/* Glossy overlay on card */}
      <path d="M 25 32 L 69 32 L 47 60 L 25 60 Z" fill="url(#glassGrad)" opacity="0.4" />

      {/* Shiny Coins */}
      {/* Coin 1 */}
      <circle cx="36" cy="66" r="10" fill="url(#goldGrad)" stroke="#FF8F00" strokeWidth="1" />
      <circle cx="36" cy="66" r="7" fill="none" stroke="#FFE082" strokeWidth="1.5" />
      <path d="M 36 60 L 36 72 M 30 66 L 42 66" stroke="#FF8F00" strokeWidth="1" opacity="0.6" />
      {/* Coin 2 (Front) */}
      <circle cx="50" cy="70" r="11" fill="url(#goldGrad)" stroke="#E65100" strokeWidth="1" />
      <circle cx="50" cy="70" r="8" fill="none" stroke="#FFF59D" strokeWidth="1.5" />
      {/* Inner dollar symbol to look rich */}
      <text x="50" y="74" fontFamily="sans-serif" fontSize="11" fontWeight="900" fill="#E65100" textAnchor="middle">₫</text>

      {/* Large Secure Transaction Green Down-Arrow */}
      <g transform="translate(18, -4)">
        {/* Arrow Outer border */}
        <path
          d="M 46 22 L 46 44 L 38 44 L 50 58 L 62 44 L 54 44 L 54 22 Z"
          fill="#FFFFFF"
        />
        {/* Arrow Body */}
        <path
          d="M 48 24 L 48 42 L 41 42 L 50 54 L 59 42 L 52 42 L 52 24 Z"
          fill="url(#emeraldGrad)"
        />
      </g>
    </svg>
  );
};

// 2. Premium Logo for "Sự kiện" (Events)
// A high-gloss, ultra-luxurious golden trophy with a star, red ribbon, and shiny sparks symbolizing lucky events and high-reward campaigns.
export const EventsLogo: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-14 filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.3)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Radial Gradient */}
        <radialGradient id="eventsBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </radialGradient>
        {/* Deep luxurious Gold gradient */}
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="35%" stopColor="#FBC02D" />
          <stop offset="70%" stopColor="#F57F17" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
        {/* Red Ribbon Gradient */}
        <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>

      {/* Outer Glow Circle */}
      <circle cx="50" cy="50" r="46" fill="url(#eventsBg)" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="1.5" />

      {/* Red Festive Ribbons in background */}
      <path d="M 32 40 L 25 75 L 34 70 L 39 52 Z" fill="url(#ribbonRed)" opacity="0.9" />
      <path d="M 68 40 L 75 75 L 66 70 L 61 52 Z" fill="url(#ribbonRed)" opacity="0.9" />

      {/* Trophy Handles (Left & Right) */}
      <path d="M 30 38 C 22 38 22 52 32 54" fill="none" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 70 38 C 78 38 78 52 68 54" fill="none" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Trophy Main Cup */}
      <path
        d="M 32 30 
           H 68 
           C 68 46, 62 58, 50 58 
           C 38 58, 32 46, 32 30 Z"
        fill="url(#trophyGold)"
        stroke="#E65100"
        strokeWidth="1"
      />

      {/* Trophy Stem/Neck */}
      <rect x="46" y="56" width="8" height="12" fill="url(#trophyGold)" stroke="#E65100" strokeWidth="0.5" />

      {/* Trophy Base */}
      <path d="M 36 68 H 64 L 66 74 H 34 Z" fill="url(#trophyGold)" stroke="#E65100" strokeWidth="0.5" />
      <rect x="32" y="74" width="36" height="5" rx="1.5" fill="#3E2723" />

      {/* Embossed star on Cup */}
      <polygon
        points="50,34 53,40 60,41 55,46 56,53 50,49 44,53 45,46 40,41 47,40"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Sparkles (Glowing stars) */}
      <path d="M 22 24 L 24 28 L 28 30 L 24 32 L 22 36 L 20 32 L 16 30 L 20 28 Z" fill="#FFF" />
      <path d="M 74 20 L 75 23 L 78 24 L 75 25 L 74 28 L 73 25 L 70 24 L 73 23 Z" fill="#FFF" />
      <circle cx="28" cy="21" r="1.5" fill="#FFF" />
      <circle cx="71" cy="33" r="1.5" fill="#FFF" />
    </svg>
  );
};

// 3. Premium Logo for "Giới thiệu" (About / Brand Introduction)
// An elegant royal blue & gold wax-seal style badge representing official prestige, national championship, and reliable corporate background.
export const AboutLogo: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-14 filter drop-shadow-[0_4px_8px_rgba(59,130,246,0.3)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Radial Gradient */}
        <radialGradient id="aboutBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </radialGradient>
        {/* Royal Blue Inner Shield Gradient */}
        <linearGradient id="royalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        {/* Shiny gold for badge frame */}
        <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>

      {/* Outer Glow Circle */}
      <circle cx="50" cy="50" r="46" fill="url(#aboutBg)" />
      
      {/* Seal outer scalloped/starburst border */}
      <path
        d="M 50 15 L 54 18 L 59 16 L 62 20 L 67 19 L 69 24 L 74 24 L 75 29 L 79 30 L 79 35 L 83 37 L 82 42 L 85 45 L 83 50 L 85 55 L 82 58 L 83 63 L 79 65 L 79 70 L 75 71 L 74 76 L 69 76 L 67 81 L 62 80 L 59 84 L 54 82 L 50 85 L 46 82 L 41 84 L 38 80 L 33 81 L 31 76 L 26 76 L 25 71 L 21 70 L 21 65 L 17 63 L 18 58 L 15 55 L 17 50 L 15 45 L 18 42 L 17 37 L 21 35 L 21 30 L 25 29 L 26 24 L 31 24 L 33 19 L 38 20 L 41 16 L 46 18 Z"
        fill="url(#badgeGold)"
        stroke="#FF6F00"
        strokeWidth="0.5"
      />

      {/* Royal blue inner shield */}
      <circle cx="50" cy="50" r="28" fill="url(#royalBlue)" stroke="#FFE082" strokeWidth="1.5" />

      {/* Five Golden Stars of Quality */}
      <g fill="#FFC107">
        <polygon points="50,26 51.5,29 54.5,29.5 52,31.5 53,34.5 50,33 47,34.5 48,31.5 45.5,29.5 48.5,29" transform="scale(0.85) translate(8.5, 4)" />
        <polygon points="50,26 51.5,29 54.5,29.5 52,31.5 53,34.5 50,33 47,34.5 48,31.5 45.5,29.5 48.5,29" transform="scale(0.85) translate(0.5, 6.5)" />
        <polygon points="50,26 51.5,29 54.5,29.5 52,31.5 53,34.5 50,33 47,34.5 48,31.5 45.5,29.5 48.5,29" transform="scale(0.85) translate(16.5, 6.5)" />
      </g>

      {/* Inside official letter symbol "VTEC" style wing or "i" symbol inside badge */}
      <g transform="translate(50, 52) scale(0.9)">
        {/* Book / Certificate design inside the badge */}
        <path d="M -15 -6 H 15 V 16 H -15 Z" fill="#FFE082" rx="2" />
        <path d="M -13 -4 H 13 V 14 H -13 Z" fill="#FFF" />
        <line x1="-9" y1="1" x2="9" y2="1" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
        <line x1="-9" y1="5" x2="5" y2="5" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
        <line x1="-9" y1="9" x2="9" y2="9" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
        
        {/* Red ribbon coming out from the certificate */}
        <path d="M 5 12 L 11 22 L 5 19 L -1 22 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.5" />
      </g>

      {/* Decorative Golden Laurel Branch framing lower half inside shield */}
      <path
        d="M 28 50 A 22 22 0 0 0 50 72 A 22 22 0 0 0 72 50"
        fill="none"
        stroke="#FFC107"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
    </svg>
  );
};
