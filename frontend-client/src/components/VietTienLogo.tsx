import React from 'react';
import { MEDIA } from '../assets/media';

interface VietTienLogoProps {
  className?: string;
  size?: number;
}

export const VietTienLogo: React.FC<VietTienLogoProps> = ({ className = '', size = 180 }) => {
  return (
    <div
      className={`flex items-center justify-center p-3 bg-white rounded-2xl shadow-md border border-slate-200/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={MEDIA.logo}
        alt="Logo Việt Tiến VTEC"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
