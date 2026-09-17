import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Database,
  CalendarDays,
  Users,
  Sparkles,
  BookOpen,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { ClassMetadata } from '../types';
import {
  signInWithUsername,
  signUpWithUsername,
  resetPasswordByUsername,
  AuthTeacher,
} from '../utils/accountAuth';

interface LoginScreenProps {
  metadata?: ClassMetadata;
  onLoginGoogle: () => Promise<void>;
  onEnterGuest?: () => void;
  isSupabaseReady: boolean;
  onOpenDbSync?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  onAuthSuccess?: (user: AuthTeacher) => void;
}

type AuthTab = 'login' | 'register' | 'forgot_password';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  metadata,
  onLoginGoogle,
  isSupabaseReady,
  onOpenDbSync,
  showToast,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states (Username & Password - Không dùng Email)
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status/Alert message
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success' | 'info';
    text: string;
  } | null>(null);

  const safeMeta = metadata || {
    schoolName: 'THCS Phan Bội Châu',
    className: 'Lớp 9A2',
    teacherName: 'Dương Thành Tín',
    headTeacher: 'Dương Thành Tín',
    academicYear: '2026–2027',
  };

  const clearForm = () => {
    setStatusMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  // Google Login (Tùy chọn nhanh)
  const handleGoogleClick = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await onLoginGoogle();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Không thể đăng nhập bằng Google lúc này.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Đăng nhập bằng Tên đăng nhập & Mật khẩu (Không cần email)
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Tên đăng nhập của Thầy Cô.' });
      return;
    }
    if (!password) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Mật khẩu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await signInWithUsername(username, password);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
        if (showToast) showToast(res.error, 'error');
      } else if (res.user) {
        setStatusMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng vào sổ điện tử...' });
        if (showToast) showToast(`Chào mừng Thầy Cô ${res.user.name || res.user.username}!`, 'success');
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Có lỗi xảy ra khi xác thực tài khoản.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Tạo tài khoản mới bằng Tên đăng nhập & Mật khẩu (Không cần email gì cả)
  const handleUsernameRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Tên đăng nhập muốn tạo.' });
      return;
    }
    if (cleanUser.length < 3) {
      setStatusMessage({ type: 'error', text: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
      return;
    }
    if (/\s/.test(cleanUser)) {
      setStatusMessage({ type: 'error', text: 'Tên đăng nhập không được có khoảng cách (dấu cách).' });
      return;
    }
    if (password.length < 3) {
      setStatusMessage({ type: 'error', text: 'Mật khẩu phải có độ dài từ 3 ký tự trở lên.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await signUpWithUsername(cleanUser, password, fullName);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
        if (showToast) showToast(res.error, 'error');
      } else if (res.user) {
        setStatusMessage({
          type: 'success',
          text: `Tạo tài khoản "${res.user.username}" thành công! Đang vào sổ điện tử ngay...`,
        });
        if (showToast) {
          showToast(`Tạo tài khoản thành công! Xin chào ${res.user.name}`, 'success');
        }
        setTimeout(() => {
          if (onAuthSuccess && res.user) {
            onAuthSuccess(res.user);
          }
        }, 600);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Có lỗi xảy ra khi tạo tài khoản.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Đổi / Đặt lại mật khẩu theo Tên đăng nhập (Không cần email)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập Tên đăng nhập cần đổi mật khẩu.',
      });
      return;
    }
    if (password.length < 3) {
      setStatusMessage({
        type: 'error',
        text: 'Mật khẩu mới phải có ít nhất 3 ký tự.',
      });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Mật khẩu xác nhận không khớp.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await resetPasswordByUsername(cleanUser, password);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
        if (showToast) showToast(res.error, 'error');
      } else {
        setStatusMessage({
          type: 'success',
          text: res.message || 'Đã đổi mật khẩu thành công! Thầy Cô có thể đăng nhập ngay.',
        });
        if (showToast) {
          showToast('Đã đổi mật khẩu thành công!', 'success');
        }
        setTimeout(() => {
          setActiveTab('login');
          clearForm();
        }, 1500);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Lỗi khi đặt lại mật khẩu.',
      });
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
              id="btn-login-open-db-sync"
              onClick={onOpenDbSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                isSupabaseReady
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseReady ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSupabaseReady ? 'Supabase Cloud đã kết nối' : 'Cấu hình Cloud'}
              </span>
            </button>
          )}

          <div className="px-3 py-1.5 bg-blue-100/70 text-blue-800 rounded-xl text-xs font-semibold">
            {safeMeta.academicYear}
          </div>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="max-w-xl w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-200/80 p-6 sm:p-10 space-y-6">
          {/* Headline & Class Intro */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{safeMeta.className} • GVCN {safeMeta.teacherName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sổ Tay Điện Tử Giáo Viên Chủ Nhiệm
            </h1>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Tạo tài khoản hoặc đăng nhập dễ dàng chỉ với <strong>Tên đăng nhập</strong> và <strong>Mật khẩu</strong>, không cần tạo email.
            </p>
          </div>

          {/* Tab Navigation (Login vs Register vs Reset) */}
          {activeTab !== 'forgot_password' ? (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                id="tab-auth-login"
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  clearForm();
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
              <button
                id="tab-auth-register"
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  clearForm();
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo tài khoản mới</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  clearForm();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Đăng nhập</span>
              </button>
              <span className="text-xs font-bold text-slate-700">Đổi / Đặt lại mật khẩu</span>
            </div>
          )}

          {/* Status / Error / Success Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed border ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM (Tên đăng nhập & Mật khẩu) */}
          {activeTab === 'login' && (
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: admin, thaytin, giaovien9a2..."
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot_password');
                      clearForm();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Quên / Đổi mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập vào sổ</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM (Chỉ cần Tên đăng nhập & Mật khẩu - Không cần Email) */}
          {activeTab === 'register' && (
            <form onSubmit={handleUsernameRegister} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tên đăng nhập mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-register-username"
                    type="text"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Viết liền không dấu cách, ví dụ: thaytin, cohuong..."
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Không cần nhập địa chỉ email. Chỉ cần tên đăng nhập để truy cập bất kỳ lúc nào.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Họ và tên Thầy Cô <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-register-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Thầy Dương Thành Tín"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 3 ký tự)"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Xác nhận lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu giống bên trên"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo tài khoản & Vào sổ ngay</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: RESET PASSWORD BY USERNAME (Không cần email) */}
          {activeTab === 'forgot_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập Tên đăng nhập của Thầy Cô và đặt mật khẩu mới trực tiếp, không cần gửi email xác nhận.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Tên đăng nhập</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-forgot-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập đã đăng ký (ví dụ: admin, thaytin...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-forgot-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-forgot-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-forgot-password-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <span>Lưu mật khẩu mới</span>
                )}
              </button>
            </form>
          )}

          {/* Optional Divider & Google Quick Sign-in */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
              hoặc
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          <div>
            <button
              id="btn-login-screen-google"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 font-semibold text-sm transition-all shadow-2xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {/* Google 4-Color Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}</span>
            </button>
          </div>

          {/* Features highlight */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Các tính năng cốt lõi cho giáo viên
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Quản lý hồ sơ học sinh</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Điểm danh & chuyên cần</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Nề nếp, thi đua & kỷ luật</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Sổ liên lạc phụ huynh</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-2">
        <span>© {new Date().getFullYear()} Sổ tay điện tử Giáo viên chủ nhiệm • Bảo mật dữ liệu học đường</span>
      </footer>
    </div>
  );
};
