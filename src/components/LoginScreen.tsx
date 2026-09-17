import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  CalendarDays,
  Users,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ClassMetadata } from '../types';

interface LoginScreenProps {
  metadata?: ClassMetadata;
  onLoginGoogle: () => Promise<void>;
  onEnterGuest: () => void;
  isSupabaseReady: boolean;
  onOpenDbSync?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  metadata,
  onLoginGoogle,
  onEnterGuest,
  isSupabaseReady,
  onOpenDbSync,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const safeMeta = metadata || {
    schoolName: 'THCS Phan Bội Châu',
    className: 'Lớp 9A2',
    teacherName: 'Dương Thành Tín',
    headTeacher: 'Dương Thành Tín',
    academicYear: '2026–2027',
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      await onLoginGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-indigo-50/50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-blue-600">
              Sổ tay điện tử
            </span>
            <span className="block text-sm font-bold text-slate-800">
              {safeMeta.schoolName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDbSync && (
            <button
              onClick={onOpenDbSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                isSupabaseReady
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseReady ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSupabaseReady ? 'Supabase đã kết nối' : 'Cấu hình Cloud'}
              </span>
            </button>
          )}

          <div className="px-3 py-1.5 bg-blue-100/70 text-blue-800 rounded-xl text-xs font-semibold">
            {safeMeta.academicYear}
          </div>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-200/80 p-6 sm:p-10 space-y-8">
          {/* Headline & Class Intro */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{safeMeta.className} • GVCN {safeMeta.teacherName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sổ Tay Điện Tử Giáo Viên Chủ Nhiệm
            </h1>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Quản lý toàn diện nề nếp, chuyên cần, liên lạc phụ huynh và quỹ lớp. Vui lòng đăng nhập để bắt đầu làm việc.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Google Sign In Button */}
            <button
              id="btn-login-screen-google"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-blue-400 font-bold text-sm sm:text-base transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {/* Google 4-Color Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng tài khoản Google'}</span>
            </button>

            {/* Guest / Direct Access Option */}
            <button
              id="btn-login-screen-guest"
              onClick={onEnterGuest}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] cursor-pointer"
            >
              <span>Vào sổ chủ nhiệm (Dữ liệu mẫu / Ngoại tuyến)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400 pt-1">
              Thầy cô có thể vào trực tiếp để trải nghiệm hoặc làm việc ngoại tuyến không bắt buộc đăng nhập.
            </p>
          </div>

          {/* Features highlight */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Các tính năng cốt lõi cho giáo viên
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Quản lý hồ sơ & danh sách 45 học sinh</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CalendarDays className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Điểm danh & thống kê chuyên cần</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Theo dõi nề nếp, thi đua & khen thưởng</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Sổ liên lạc & nhắn tin phụ huynh</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-4">
        <span>© {new Date().getFullYear()} Sổ tay điện tử Giáo viên chủ nhiệm • Bảo mật dữ liệu học đường</span>
      </footer>
    </div>
  );
};
