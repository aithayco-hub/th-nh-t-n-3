import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Mail,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthTeacher, isSupabaseConfigured, signInWithGoogle, signOutSupabase } from '../utils/supabase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthTeacher | null;
  onSyncTeacherName?: (name: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSyncTeacherName,
  showToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!isConfigured) {
      showToast('Cần kết nối Supabase trước khi dùng đăng nhập Google.', 'error');
      return;
    }
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.error) {
      showToast(`Không thể đăng nhập Google: ${res.error}`, 'error');
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const res = await signOutSupabase();
    setLoading(false);
    if (res.error) {
      showToast(`Lỗi khi đăng xuất: ${res.error}`, 'error');
    } else {
      showToast('Đã đăng xuất tài khoản Google thành công.', 'info');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tài khoản giáo viên</h3>
              <p className="text-xs text-slate-500">Xác thực tài khoản Google & đồng bộ dữ liệu lớp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* Logged In State */
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 rounded-2xl">
                <div className="flex items-center gap-4">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name || 'Avatar'}
                      className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base truncate">
                        {currentUser.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Đã xác thực
                      </span>
                    </div>
                    {currentUser.email && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{currentUser.email}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Đăng nhập qua Google OAuth (Supabase)
                    </p>
                  </div>
                </div>

                {onSyncTeacherName && currentUser.name && (
                  <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-900 font-medium">
                      Đồng bộ tên Google vào sổ chủ nhiệm:
                    </span>
                    <button
                      onClick={() => {
                        if (currentUser.name) {
                          onSyncTeacherName(currentUser.name);
                          showToast(`Đã cập nhật tên GVCN thành: ${currentUser.name}`, 'success');
                        }
                      }}
                      className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-2xs"
                    >
                      Cập nhật tên GVCN
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Trạng thái tài khoản hoạt động bình thường</span>
                </div>
                <p>
                  Dữ liệu lớp học sẽ được tự động gắn với tài khoản giáo viên của thầy/cô, giúp truy cập an toàn từ điện thoại hoặc máy tính khác bất kỳ lúc nào.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-all disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất tài khoản Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not Logged In State */
            <div className="space-y-4">
              <div className="text-center py-3 space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <LogIn className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Đăng nhập tài khoản Google</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Đăng nhập giúp thầy cô lưu trữ vĩnh viễn sổ điểm danh, nề nếp và danh sách học sinh trên đám mây, mở được trên mọi thiết bị.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-start gap-2.5 text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Không lo mất dữ liệu:</strong> Toàn bộ 5 học sinh, quỹ lớp và điểm danh được lưu an toàn trên Cloud.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Đồng bộ đa thiết bị:</strong> Dùng được cả trên điện thoại di động lẫn máy tính giáo viên.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Chính chủ giáo viên:</strong> Hiển thị họ tên và ảnh đại diện Google của thầy cô trên sổ điện tử.</span>
                </div>
              </div>

              {/* Login Button */}
              <button
                id="btn-login-google"
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Đang chuyển hướng Google...' : 'Đăng nhập với Google'}</span>
              </button>

              {!isConfigured && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Chưa kích hoạt Supabase. Thầy cô vui lòng cấu hình <code>VITE_SUPABASE_URL</code> trên Vercel để tính năng đăng nhập hoạt động.
                  </span>
                </div>
              )}

              {/* Setup Guide for Google Provider in Supabase */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Hướng dẫn bật Google Provider trên Supabase (cho quản trị viên)
                  </span>
                  {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showGuide && (
                  <div className="p-4 bg-white text-xs text-slate-600 space-y-2 border-t border-slate-200 leading-relaxed">
                    <p className="font-medium text-slate-800">Để đăng nhập Google hoạt động với dự án Supabase của bạn:</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        Vào <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3 inline" /></a> ➔ chọn Project của bạn.
                      </li>
                      <li>
                        Vào mục <strong>Authentication</strong> ➔ chọn <strong>Providers</strong> ➔ tìm dòng <strong>Google</strong>.
                      </li>
                      <li>
                        Bật công tắc <strong>Enable Sign in with Google</strong>.
                      </li>
                      <li>
                        Dán <strong>Client ID</strong> và <strong>Client Secret</strong> từ Google Cloud Console (hoặc dùng mặc định nếu đã cấu hình) rồi bấm <strong>Save</strong>.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
