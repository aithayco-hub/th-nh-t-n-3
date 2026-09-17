import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Home,
  Users,
  CalendarDays,
  BookOpen,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { ActiveScreen, ClassMetadata } from '../types';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  metadata?: ClassMetadata;
  onUpdateMetadata?: (updated: Partial<ClassMetadata>) => void;
  onResetData?: () => void;
  onShowClassInfo?: () => void;
  onShowYearConfig?: () => void;
  onOpenClassInfo?: () => void;
  onOpenYearConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  metadata,
  onUpdateMetadata,
  onResetData,
  onShowClassInfo,
  onShowYearConfig,
  onOpenClassInfo,
  onOpenYearConfig,
}) => {
  const safeMetadata: ClassMetadata = metadata || {
    schoolName: 'THCS Phan Bội Châu',
    className: 'Lớp 9A2',
    teacherName: 'Dương Thành Tín',
    headTeacher: 'Dương Thành Tín',
    academicYear: '2026–2027',
  };

  const handleClassInfo = onShowClassInfo || onOpenClassInfo || (() => {});
  const handleYearConfig = onShowYearConfig || onOpenYearConfig || (() => {});
  const handleUpdate = onUpdateMetadata || (() => {});
  const handleReset = onResetData || (() => {});

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const availableYears = [
    '2024–2025',
    '2025–2026',
    '2026–2027',
    '2027–2028',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: App Title & Icon */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
              title="Về Trang chủ"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Sổ tay điện tử
                </span>
                <span className="block text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Giáo viên chủ nhiệm
                </span>
              </div>
            </button>
          </div>

          {/* Center: Main Navigation buttons */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === 'home'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Trang chủ</span>
            </button>

            <button
              id="nav-students"
              onClick={() => onNavigate('students')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === 'students'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Danh sách học sinh</span>
            </button>

            <button
              id="nav-year-config"
              onClick={handleYearConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-all"
              title="Cấu hình năm học & học kỳ"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden lg:inline">Cấu hình năm học</span>
            </button>

            <button
              id="nav-class-info"
              onClick={handleClassInfo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 transition-all"
              title="Thông tin lớp học 9A2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Lớp học</span>
            </button>
          </nav>

          {/* Right: School Year Dropdown & Teacher Info */}
          <div className="flex items-center gap-2">
            {/* Year Selector */}
            <div className="relative" ref={yearRef}>
              <button
                id="btn-select-year"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs"
              >
                <span>{safeMetadata.academicYear}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {yearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                    Chọn năm học
                  </div>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        handleUpdate({ academicYear: year });
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        safeMetadata.academicYear === year
                          ? 'text-blue-600 font-bold bg-blue-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>Năm học {year}</span>
                      {safeMetadata.academicYear === year && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Profile / Settings Menu */}
            <div className="relative" ref={userRef}>
              <button
                id="btn-teacher-profile"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all"
                title="Thông tin giáo viên & Tùy chọn"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  DTT
                </div>
                <div className="hidden xl:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-none">
                    Thầy {safeMetadata.teacherName}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    GVCN {safeMetadata.className}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Giáo viên chủ nhiệm</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{safeMetadata.teacherName}</p>
                    <p className="text-xs text-slate-500">{safeMetadata.className} • {safeMetadata.schoolName}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleClassInfo();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Thông tin lớp học chi tiết</span>
                    </button>

                    <button
                      onClick={() => {
                        handleYearConfig();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <CalendarDays className="w-4 h-4 text-indigo-500" />
                      <span>Cấu hình học kỳ & phân công</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        handleReset();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Đặt lại dữ liệu mẫu lớp 9A2</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
