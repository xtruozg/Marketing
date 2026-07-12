import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HomeScreen } from './components/HomeScreen';
import { IntroductionScreen } from './components/IntroductionScreen';
import { BettingRoom } from './components/BettingRoom';
import { ProfileScreen } from './components/ProfileScreen';
import { FinancialReport } from './components/FinancialReport';
import { HistoriesScreen } from './components/HistoriesScreen';
import { FooterNav } from './components/FooterNav';
import { AdminScreen } from './components/AdminScreen';
import { DetailScreen } from './components/DetailScreen';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeScreen, recentResultNotice, dismissNotice, toast } = useApp();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <LoginScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'home':
        return <HomeScreen />;
      case 'introduction':
        return <IntroductionScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'financial_report':
        return <FinancialReport />;
      case 'histories':
        return <HistoriesScreen />;
      case 'admin':
        return <AdminScreen />;
      case 'detail_introduction':
        return <DetailScreen type="introduction" />;
      case 'detail_overview':
        return <DetailScreen type="overview" />;
      case 'detail_achievements':
        return <DetailScreen type="achievements" />;
      case 'detail_security':
        return <DetailScreen type="security" />;
      case 'detail_trends':
        return <DetailScreen type="trends" />;
      default:
        if (activeScreen.startsWith('betting_')) {
          const roomName = activeScreen.substring(8);
          return <BettingRoom room={roomName} />;
        }
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans transition-colors duration-300">
      
      {/* Active Screen Display */}
      <div className="flex-grow">
        {renderActiveScreen()}
      </div>

      {/* Floating Bottom Navigation */}
      <FooterNav />

      {/* REAL-TIME NOTIFICATION POPUP PANEL */}
      {recentResultNotice && recentResultNotice.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all scale-100">
            
            {/* Modal Heading decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            
            <button
              onClick={dismissNotice}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4 pt-2">
              <div className="flex justify-center">
                {recentResultNotice.result === 'Thắng' ? (
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">KỲ SỰ KIỆN KẾT THÚC</span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                  Kết quả Kỳ {recentResultNotice.period.slice(-8)} tại phòng {recentResultNotice.room}
                </h4>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bạn đã lựa chọn:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{recentResultNotice.choice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tiền đặt cược:</span>
                  <span className="font-semibold font-mono text-slate-850 dark:text-slate-105">{recentResultNotice.amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="border-t border-slate-200/50 dark:border-slate-800 my-1.5 pt-1.5 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100">KẾT QUẢ GHI NHẬN:</span>
                  {recentResultNotice.result === 'Thắng' ? (
                    <span className="text-emerald-500 font-extrabold font-mono uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                      CÓ LÃI (+{recentResultNotice.payout.toLocaleString('vi-VN')}đ)
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      THUA CƯỢC
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                {recentResultNotice.result === 'Thắng' 
                  ? 'Xin chúc mừng quý khách! Lợi nhuận đã được cộng liên tục tích lũy vào ví chính.'
                  : 'Hãy kiên nhẫn tích lũy. Lựa chọn phân bổ sự kiện tiếp theo để tăng doanh số.'}
              </p>

              <button
                onClick={dismissNotice}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                Xác Nhận Đồng Ý
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REAL-TIME TOAST NOTIFICATIONS */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-emerald-500 border-emerald-600 text-white' 
              : toast.type === 'error' 
                ? 'bg-rose-500 border-rose-600 text-white' 
                : 'bg-blue-600 border-blue-700 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
