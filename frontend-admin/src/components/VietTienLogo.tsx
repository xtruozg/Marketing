import React from 'react';

interface VietTienLogoProps {
  className?: string;
  size?: number;
}

export const VietTienLogo: React.FC<VietTienLogoProps> = ({ className = '', size = 180 }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl shadow-md border border-slate-200/10 ${className}`} style={{ width: size }}>
      <svg
        viewBox="40 12 220 270"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red outer square container */}
        <rect
          x="50"
          y="20"
          width="200"
          height="200"
          fill="none"
          stroke="#E31A22"
          strokeWidth="6"
        />

        {/* Top block background: solid red */}
        <rect
          x="53"
          y="23"
          width="194"
          height="80"
          fill="#E31A22"
        />

        {/* Text "VTEC" inside the red top block */}
        <g fill="#FFFFFF">
          {/* V */}
          <path d="M 63 38 L 82 94 H 96 L 115 38 H 99 L 89 76 L 79 38 Z" />
          {/* T */}
          <path d="M 116 38 H 152 V 48 H 139 V 94 H 128 V 48 H 116 Z" />
          {/* E */}
          <path d="M 157 38 H 188 V 48 H 170 V 58 H 184 V 68 H 170 V 84 H 189 V 94 H 157 Z" />
          {/* C */}
          <path d="M 218 38 C 205 38 194 45 194 66 C 194 87 205 94 218 94 H 228 V 84 H 218 C 210 84 206 80 206 66 C 206 52 210 48 218 48 H 228 V 38 Z" />
        </g>

        {/* Bottom part: red horizontal stripes on white background */}
        <rect
          x="53"
          y="103"
          width="194"
          height="114"
          fill="#FFFFFF"
        />

        {/* Stripes: 6 horizontal red bars */}
        <rect x="53" y="113" width="194" height="6" fill="#E31A22" />
        <rect x="53" y="129" width="194" height="6" fill="#E31A22" />
        <rect x="53" y="145" width="194" height="6" fill="#E31A22" />
        <rect x="53" y="161" width="194" height="6" fill="#E31A22" />
        <rect x="53" y="177" width="194" height="6" fill="#E31A22" />
        <rect x="53" y="193" width="194" height="24" fill="#E31A22" />

        {/* Overlay the white shape (collar/sail/wing) that cuts through the stripes */}
        <path
          d="M 53 175 H 98 L 132 103 H 162 L 122 208 H 53 Z"
          fill="#FFFFFF"
        />

        {/* Brand name "viettien" below the red square */}
        <text
          x="150"
          y="272"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="48"
          fill="#1D3A6C"
          textAnchor="middle"
          letterSpacing="-1.5"
        >
          viettien
        </text>

        {/* Trademark symbol ® */}
        <text
          x="244"
          y="246"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          fontSize="22"
          fill="#1D3A6C"
        >
          ®
        </text>
      </svg>
    </div>
  );
};
