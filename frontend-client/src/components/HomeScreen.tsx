import React from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { motion } from 'motion/react';
import {
  Trophy,
  ArrowDownToLine,
  Sparkles,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Wallet
} from 'lucide-react';
import { WithdrawLogo, EventsLogo, AboutLogo } from './QuickLinkIcons';

// Ảnh thương hiệu thật do khách hàng cung cấp (public_html/assets/images)
import { MEDIA } from '../assets/media';

export const HomeScreen: React.FC = () => {
  const {
    user,
    setActiveScreen,
    setProfileActiveTab,
  } = useApp();

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const bannerSlides = [
    {
      image: MEDIA.banners[0],
      tag: 'TỔNG CÔNG TY MAY VIỆT TIẾN',
      title: 'THƯƠNG HIỆU QUỐC GIA VỮNG MẠNH',
      desc: 'Hơn 50 năm kiến tạo giá trị, dẫn đầu ngành dệt may Việt Nam.',
      sub: 'HOA HỒNG 30% • UY TÍN HÀNG ĐẦU'
    },
    {
      image: MEDIA.banners[1],
      tag: 'CƠ SỞ HẠ TẦNG HIỆN ĐẠI',
      title: 'TOÀ NHÀ VĂN PHÒNG VTEC',
      desc: 'Trụ sở kiến trúc kính hiện đại, chuyên nghiệp và thân thiện.',
      sub: 'TẦM NHÌN TƯƠNG LAI • CHUYÊN NGHIỆP'
    },
    {
      image: MEDIA.banners[2],
      tag: 'HỘI NGHỊ SXKD 2024',
      title: 'ĐỊNH HƯỚNG PHÁT TRIỂN 2025',
      desc: 'Báo cáo kết quả hoạt động và các giải pháp chiến lược mới.',
      sub: 'ĐỒNG HÀNH SÁNG TẠO • VTEC VỮNG BỀN'
    },
    {
      image: MEDIA.banners[3],
      tag: 'CÔNG TY MAY VIỆT TIẾN',
      title: 'BỀ DÀY LỊCH SỬ THƯƠNG HIỆU',
      desc: 'Tổng Công ty Dệt May Việt Nam - đạt chuẩn ISO 9002, SA 8000.',
      sub: 'KẾT NỐI TOÀN QUỐC • PHÁT TRIỂN VƯƠN XA'
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  if (!user) return null;

  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  // Navigating to withdraw directly (mở tab Rút Tiền trong trang Cá nhân)
  const handleGoToWithdraw = () => {
    setProfileActiveTab('withdraw');
    setActiveScreen('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-24 bg-[#f3f6fa] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* 1. Brand Header */}
      <HeaderNav />

      {/* 2. Compact User Balance and VIP Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none">THÀNH VIÊN</p>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">{user.fullName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none">SỐ DƯ KHẢ DỤNG</p>
              <span className="text-sm font-black font-mono text-emerald-500 block mt-1 tracking-tight">{formatVND(user.balance)}</span>
            </div>
            <button
              onClick={handleGoToWithdraw}
              className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              title="Rút tiền nhanh"
            >
              <Wallet className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        
        {/* 3. Slider/Banner with real corporate images & auto-scrolling */}
        <div className="relative rounded-2xl overflow-hidden shadow-md h-48 bg-slate-200 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          {bannerSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                idx === currentSlide 
                  ? 'opacity-100 scale-100 pointer-events-auto' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
              
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white space-y-1.5 max-w-[260px] z-10">
                <span className="text-[7.5px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded-full w-fit block shadow-xs animate-pulse">
                  {slide.sub}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#00BCD4] block">
                  {slide.tag}
                </span>
                <h2 className="text-[14px] font-black uppercase tracking-tight leading-none text-white drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-[9px] text-white/90 font-medium leading-tight drop-shadow-xs">
                  {slide.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/20 px-2 py-1 rounded-full backdrop-blur-xs">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-4 bg-[#00BCD4]' : 'w-1.5 bg-white/50 hover:bg-white'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Left/Right Navigation buttons */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-xs text-xs font-bold transition-all z-20"
            title="Slide trước"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-xs text-xs font-bold transition-all z-20"
            title="Slide tiếp theo"
          >
            ›
          </button>
        </div>

        {/* 4. Three Circular Quick Links Row */}
        {/* 4. Three Circular Quick Links Row matching Screenshot 8 - BALANCED */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl py-5 px-4 shadow-[0_10px_30px_-8px_rgba(37,99,235,0.06)] border border-slate-200/60 dark:border-slate-800/80 flex justify-around items-center font-sans">
          
          {/* Quick link 1: Rút tiền */}
          <button
            onClick={handleGoToWithdraw}
            className="flex flex-col items-center justify-center space-y-2 group cursor-pointer transition-transform active:scale-95"
            id="quick-link-withdraw"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm border border-emerald-500/15 dark:border-emerald-500/25">
              <WithdrawLogo />
            </div>
            <span className="text-[12.5px] font-black text-slate-750 dark:text-slate-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors tracking-wide">Rút tiền</span>
          </button>

          {/* Quick link 2: Sự kiện */}
          <button
            onClick={() => setActiveScreen('introduction')}
            className="flex flex-col items-center justify-center space-y-2 group cursor-pointer transition-transform active:scale-95"
            id="quick-link-events"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/8 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm border border-amber-500/15 dark:border-amber-500/25">
              <EventsLogo />
            </div>
            <span className="text-[12.5px] font-black text-slate-750 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors tracking-wide">Sự kiện</span>
          </button>

          {/* Quick link 3: Giới thiệu */}
          <button
            onClick={() => setActiveScreen('detail_introduction')}
            className="flex flex-col items-center justify-center space-y-2 group cursor-pointer transition-transform active:scale-95"
            id="quick-link-about"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/8 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm border border-blue-500/15 dark:border-blue-500/25">
              <AboutLogo />
            </div>
            <span className="text-[12.5px] font-black text-slate-750 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors tracking-wide">Giới thiệu</span>
          </button>

        </div>

        {/* 5. Section Header */}
        <div className="text-center pt-2 font-sans">
          <h2 className="text-[13px] font-black uppercase text-[#004AC6] dark:text-[#60a5fa] tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5">
            CHẤT LƯỢNG KHẲNG ĐỊNH THƯƠNG HIỆU
          </h2>
        </div>

        {/* 6. Grid of 4 Main Cards (2x2) matching Screenshot 8 */}
        <div className="grid grid-cols-2 gap-4 font-sans">
          
          {/* Card 1: Tổng quan */}
          <div
            onClick={() => setActiveScreen('detail_overview')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col text-center aspect-[10/11] group"
            id="grid-card-overview"
          >
            {/* Hàng Việt Nam Chất Lượng Cao Logo - lấp đầy khung */}
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 p-3">
              <img
                src={MEDIA.overview}
                alt="Hàng Việt Nam Chất Lượng Cao"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 py-2.5 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Tổng quan
            </span>
          </div>

          {/* Card 2: Thành tựu */}
          <div
            onClick={() => setActiveScreen('detail_achievements')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col text-center aspect-[10/11] group"
            id="grid-card-achievements"
          >
            {/* Cúp Thương hiệu Quốc gia 2024 - lấp đầy khung */}
            <div className="relative flex-1 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
              <img
                src={MEDIA.achievement}
                alt="Thành tựu Việt Tiến - Thương hiệu Quốc gia 2024"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 py-2.5 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Thành tựu
            </span>
          </div>

          {/* Card 3: Bảo Mật */}
          <div
            onClick={() => setActiveScreen('detail_security')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col text-center aspect-[10/11] group"
            id="grid-card-security"
          >
            <div className="relative flex-1 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <img
                src={MEDIA.banners[4]}
                alt="Bảo Mật Việt Tiến"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left z-10">
                <span className="block text-[9px] uppercase tracking-[0.3em] text-emerald-300 font-bold">BẢO MẬT HỆ THỐNG</span>
                <h3 className="mt-2 text-sm font-black text-white leading-tight">Cảnh báo giả mạo</h3>
              </div>
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 py-2.5 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Bảo Mật
            </span>
          </div>

          {/* Card 4: Xu hướng */}
          <div
            onClick={() => setActiveScreen('detail_trends')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col text-center aspect-[10/11] group"
            id="grid-card-trends"
          >
            <div className="relative flex-1 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <img
                src={MEDIA.banners[5]}
                alt="Xu hướng phát triển Việt Tiến"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left z-10">
                <span className="block text-[9px] uppercase tracking-[0.3em] text-cyan-200 font-bold">VƯƠN XA QUỐC TẾ</span>
                <h3 className="mt-2 text-sm font-black text-white leading-tight">Xu hướng phát triển</h3>
              </div>
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 py-2.5 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Xu hướng
            </span>
          </div>

        </div>

        {/* 7. Corporate footer seal */}
        <div className="text-center opacity-40 py-6 space-y-1 select-none font-sans">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            HỆ THỐNG ỦY THÁC SỰ KIỆN PHÁT TRIỂN THƯƠNG HIỆU VIỆT TIẾN
          </p>
          <p className="text-[8px] text-slate-400">
            Chứng nhận mã hóa quốc tế SSL Secure - Toàn bộ thông tin tài khoản và số dư được lưu ký bảo mật nghiêm ngặt.
          </p>
        </div>

      </main>
    </motion.div>
  );
};
