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
  Building2,
  Wallet
} from 'lucide-react';
import { WithdrawLogo, EventsLogo, AboutLogo } from './QuickLinkIcons';

// Import real corporate images generated for the system
import img_slide1 from '../assets/images/input_file_6_1782294593448.jpg';
import img_slide2 from '../assets/images/input_file_4_1782294561336.jpg';
import img_slide3 from '../assets/images/input_file_1_1782294510873.jpg';
import img_slide4 from '../assets/images/input_file_5_1782294576058.jpg';
import img_achievements from '../assets/images/viettien_brand_trophy_1783068219731.jpg';
import img_vietnam_hq from '../assets/images/vietnam_high_quality_logo_1783068564687.jpg';

export const HomeScreen: React.FC = () => {
  const {
    user,
    setActiveScreen,
    setProfileActiveTab
  } = useApp();

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const bannerSlides = [
    {
      image: img_slide1,
      tag: 'TỔNG CÔNG TY MAY VIỆT TIẾN',
      title: 'HÀNH TRÌNH KIẾN TẠO THƯƠNG HIỆU',
      desc: 'Thương hiệu quốc gia vững mạnh hơn 50 năm phát triển bền bỉ.',
      sub: 'HOA HỒNG 30% • UY TÍN HÀNG ĐẦU'
    },
    {
      image: img_slide2,
      tag: 'HỆ THỐNG PHÂN PHỐI TOÀN QUỐC',
      title: 'KÊNH PHÂN PHỐI VỮNG MẠNH',
      desc: 'Mạng lưới showroom rộng khắp cả nước phục vụ hàng triệu khách hàng.',
      sub: 'KẾT NỐI TOÀN QUỐC • PHÁT TRIỂN VƯƠN XA'
    },
    {
      image: img_slide3,
      tag: 'CƠ SỞ HẠ TẦNG HIỆN ĐẠI',
      title: 'TIÊN PHONG CÔNG NGHỆ XANH',
      desc: 'Tòa nhà văn phòng hiện đại với kiến trúc mở, thân thiện môi trường.',
      sub: 'TẦM NHÌN TƯƠNG LAI • CHUYÊN NGHIỆP'
    },
    {
      image: img_slide4,
      tag: 'ĐỘI NGŨ NHÂN SỰ VTEC',
      title: 'SỨC MẠNH TỪ SỰ ĐOÀN KẾT',
      desc: 'Cán bộ công nhân viên gắn bó, kiến tạo các dòng sản phẩm tinh tế.',
      sub: 'ĐỒNG HÀNH SÁNG TẠO • VTEC VỮNG BỀN'
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

  // Navigating to withdraw directly
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
      className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* 1. Brand Header */}
      <HeaderNav />

      {/* 2. Compact User Balance and VIP Bar (keeps account info clearly visible) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Thành viên</p>
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{user.fullName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Số dư tài khoản</p>
              <span className="text-xs font-extrabold font-mono text-emerald-500 block mt-0.5">{formatVND(user.balance)}</span>
            </div>
            <button
              onClick={handleGoToWithdraw}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Rút tiền nhanh"
            >
              <Wallet className="w-4 h-4" />
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

          {/* Quick link 2: Sự kiện (opens list of events rooms Facebook/Youtube) */}
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

          {/* Quick link 3: Giới thiệu (opens Giới thiệu subpage) */}
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

        {/* 5. Section Header exactly as shown in Screenshot 8 */}
        <div className="text-center pt-2">
          <h2 className="text-[13px] font-black uppercase text-[#004AC6] dark:text-[#60a5fa] tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5">
            CHẤT LƯỢNG KHẲNG ĐỊNH THƯƠNG HIỆU
          </h2>
        </div>

        {/* 6. Grid of 4 Main Cards (2x2) matching Screenshot 8 */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1: Tổng quan */}
          <div
            onClick={() => setActiveScreen('detail_overview')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl p-2 pb-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center aspect-[10/11] group"
            id="grid-card-overview"
          >
            {/* Hàng Việt Nam Chất Lượng Cao Logo */}
            <div className="w-full h-28 flex flex-col items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={img_vietnam_hq} 
                alt="Hàng Việt Nam Chất Lượng Cao" 
                className="w-24 h-24 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 mt-1 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Tổng quan
            </span>
          </div>

          {/* Card 2: Thành tựu */}
          <div
            onClick={() => setActiveScreen('detail_achievements')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl p-2 pb-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center aspect-[10/11] group"
            id="grid-card-achievements"
          >
            {/* National Brand Trophy Logo representation - Expanded to fill top frame */}
            <div className="w-full h-28 flex flex-col items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={img_achievements} 
                alt="Thành tựu Việt Tiến"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 mt-1 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Thành tựu
            </span>
          </div>

          {/* Card 3: Bảo Mật */}
          <div
            onClick={() => setActiveScreen('detail_security')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl p-2 pb-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center aspect-[10/11] group"
            id="grid-card-security"
          >
            {/* Warning yellow sign - Enlarged and restructured to put text inside box */}
            <div className="w-full h-28 flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-xl bg-amber-50 dark:bg-amber-950/20 flex flex-col items-center justify-center border border-amber-200/50 p-2.5 shadow-xs">
                <svg viewBox="0 0 24 24" className="w-13 h-13 text-amber-500 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <p className="text-red-600 font-black text-[9.5px] tracking-widest uppercase">CẢNH BÁO</p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 mt-1 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Bảo Mật
            </span>
          </div>

          {/* Card 4: Xu hướng */}
          <div
            onClick={() => setActiveScreen('detail_trends')}
            className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-2xl p-2 pb-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center aspect-[10/11] group"
            id="grid-card-trends"
          >
            {/* Corporate subsidiary brand segmentation mindmap - Stretched to fill box */}
            <div className="w-full h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-200/30 rounded-xl p-1.5 shadow-xs overflow-hidden">
              <svg viewBox="0 0 160 100" className="w-full h-full">
                {/* Left Central Node */}
                <rect x="5" y="38" width="45" height="24" rx="4" fill="#00BCD4" stroke="#0097A7" strokeWidth="1" />
                <text x="27.5" y="52" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">viettien</text>
                
                {/* Branches */}
                <path d="M50,50 L75,18 M50,50 L75,34 M50,50 L75,50 M50,50 L75,66 M50,50 L75,82" stroke="#00BCD4" strokeWidth="1.2" fill="none" opacity="0.6" />
                
                {/* Right Subsidiary Nodes */}
                <text x="80" y="21" fontSize="7" fontWeight="black" fill="#374151" className="dark:fill-slate-300">viettien®</text>
                <text x="80" y="37" fontSize="7" fontWeight="black" fill="#EF4444">VIETLONG</text>
                <text x="80" y="53" fontSize="7" fontWeight="black" fill="#2563EB">TT-up®</text>
                <text x="80" y="69" fontSize="7" fontWeight="black" fill="#4B5563" className="dark:fill-slate-400">SAN SCIARO®</text>
                <text x="80" y="85" fontSize="7" fontWeight="black" fill="#0D9488">MANHATTAN®</text>
              </svg>
            </div>

            <span className="text-xs font-extrabold text-slate-755 dark:text-slate-200 mt-1 tracking-wide font-sans group-hover:text-[#00BCD4] transition-colors">
              Xu hướng
            </span>
          </div>

        </div>

        {/* 7. Corporate footer seal */}
        <div className="text-center opacity-40 py-6 space-y-1 select-none">
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
