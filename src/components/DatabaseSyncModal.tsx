import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  X,
  KeyRound,
  Globe,
  Trash2
} from 'lucide-react';
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_SQL,
  loadDataFromSupabase,
  saveDataToSupabase,
  getCustomSupabaseConfig,
  setCustomSupabaseConfig,
  getCleanSupabaseUrl
} from '../utils/supabase';
import { syncLocalAccountsToSupabase } from '../utils/accountAuth';
import { AppState, saveStateToLocalStorage } from '../utils/storage';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onApplyRemoteState: (newState: AppState) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfigChanged?: () => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onApplyRemoteState,
  showToast,
  onConfigChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form input config
  const [inputUrl, setInputUrl] = useState('');
  const [inputAnonKey, setInputAnonKey] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const isConfigured = isSupabaseConfigured();
  const currentCleanUrl = getCleanSupabaseUrl();

  useEffect(() => {
    if (isOpen) {
      const cfg = getCustomSupabaseConfig();
      setInputUrl(cfg.url || '');
      setInputAnonKey(cfg.anonKey || '');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    showToast('Đã sao chép câu lệnh SQL vào clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanU = inputUrl.trim();
    const cleanK = inputAnonKey.trim();

    if (!cleanU) {
      showToast('Vui lòng nhập Project URL từ Supabase (bắt đầu bằng https://)', 'error');
      return;
    }
    if (!cleanU.startsWith('https://')) {
      showToast('Project URL phải bắt đầu bằng https:// (ví dụ https://xyz.supabase.co)', 'error');
      return;
    }
    if (!cleanK) {
      showToast('Vui lòng nhập Project API Key (anon / public)', 'error');
      return;
    }

    setIsSavingConfig(true);
    setErrorMessage(null);

    try {
      // 1. Lưu cấu hình vào localStorage
      setCustomSupabaseConfig(cleanU, cleanK);

      // 2. Tự động đồng bộ các tài khoản đã tạo trước đó (bao gồm Thaytin) lên bảng teacher_accounts
      const accSyncRes = await syncLocalAccountsToSupabase();

      // 3. Tải thử dữ liệu
      const testRes = await loadDataFromSupabase();

      if (onConfigChanged) onConfigChanged();

      if (accSyncRes.error && accSyncRes.error.includes('does not exist')) {
        setTableMissing(true);
        showToast(
          'Đã kết nối! Tuy nhiên bảng "teacher_accounts" hoặc "class_data" chưa được tạo trên Supabase. Vui lòng chạy đoạn mã SQL bên dưới.',
          'info'
        );
      } else {
        showToast(
          `Kết nối Supabase thành công! ${accSyncRes.count > 0 ? `Đã đồng bộ ${accSyncRes.count} tài khoản lên bảng teacher_accounts!` : ''}`,
          'success'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi khi kết nối Supabase.');
      showToast('Không thể kết nối Supabase, vui lòng kiểm tra lại URL và Key.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDisconnect = () => {
    setCustomSupabaseConfig('', '');
    setInputUrl('');
    setInputAnonKey('');
    if (onConfigChanged) onConfigChanged();
    showToast('Đã ngắt kết nối Supabase tùy chỉnh.', 'info');
  };

  const handleSyncAccountsNow = async () => {
    setSyncing(true);
    try {
      const res = await syncLocalAccountsToSupabase();
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(`Đã đồng bộ thành công các tài khoản lên bảng teacher_accounts (${res.count} tài khoản mới)!`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi đồng bộ tài khoản', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handlePushToCloud = async () => {
    if (!isConfigured) {
      showToast('Chưa có cấu hình kết nối Supabase!', 'error');
      return;
    }
    setSyncing(true);
    setErrorMessage(null);
    const res = await saveDataToSupabase(currentState);
    // Đồng bộ cả tài khoản
    await syncLocalAccountsToSupabase();
    setSyncing(false);

    if (res.success) {
      setTableMissing(false);
      showToast('Đã tải toàn bộ dữ liệu hiện tại lên Supabase Cloud thành công!', 'success');
    } else {
      if (res.isTableMissing) {
        setTableMissing(true);
      }
      setErrorMessage(res.error || 'Lỗi không xác định khi lưu lên Supabase');
      showToast(res.error || 'Không thể lưu lên Supabase', 'error');
    }
  };

  const handlePullFromCloud = async () => {
    if (!isConfigured) {
      showToast('Chưa có cấu hình kết nối Supabase!', 'error');
      return;
    }
    setSyncing(true);
    setErrorMessage(null);
    const res = await loadDataFromSupabase();
    setSyncing(false);

    if (res.error) {
      if (res.isTableMissing) {
        setTableMissing(true);
      }
      setErrorMessage(res.error);
      showToast(res.error, 'error');
      return;
    }

    if (!res.data) {
      setTableMissing(false);
      showToast('Chưa có dữ liệu nào trên bảng Supabase. Hãy bấm "Đẩy dữ liệu lên Cloud" trước!', 'info');
      return;
    }

    // Apply state
    setTableMissing(false);
    saveStateToLocalStorage(res.data);
    onApplyRemoteState(res.data);
    showToast('Đã đồng bộ thành công dữ liệu mới nhất từ Supabase Cloud!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Kết nối Cơ sở dữ liệu Supabase</h2>
              <p className="text-xs text-emerald-100">Đồng bộ tài khoản và dữ liệu lớp học vĩnh viễn trên đám mây</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Status card */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isConfigured
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}>
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {isConfigured ? 'Supabase đã được kết nối' : 'Đang lưu cục bộ (Chưa nối vào Supabase của Thầy)'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {isConfigured ? 'Đã kết nối' : 'Chưa kết nối'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isConfigured
                  ? `Đang kết nối tới: ${currentCleanUrl}. Mọi tài khoản tạo mới sẽ được lưu trực tiếp vào bảng teacher_accounts.`
                  : 'Bảng teacher_accounts trên Supabase đang trống vì ứng dụng chưa được điền thông tin Project URL và API Key để kết nối tới Supabase.'}
              </p>
            </div>
          </div>

          {/* Quick Connect Form */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Điền thông tin kết nối Supabase của Thầy Cô</span>
              </h3>
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa kết nối</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              👉 Trên trang Supabase Dashboard của Thầy, bấm vào nút xanh <strong>Connect</strong> ở trên cùng (hoặc vào <strong>Project Settings ➔ API</strong>) rồi dán 2 thông số vào bên dưới:
            </p>

            <form onSubmit={handleSaveAndConnect} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Project URL:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzabcdefghi.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Project API Key (loại anon / public):
                </label>
                <input
                  type="text"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputAnonKey}
                  onChange={(e) => setInputAnonKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingConfig ? 'Đang kết nối & Đồng bộ...' : 'Lưu kết nối & Đồng bộ tài khoản ngay'}</span>
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleSyncAccountsNow}
                    disabled={syncing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Đẩy tài khoản lên Supabase</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Missing Alert Banner */}
          {tableMissing && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Chưa chạy SQL tạo bảng "teacher_accounts" và "class_data" trên Supabase</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Supabase cần được tạo bảng và phân quyền trước khi ứng dụng có thể ghi tài khoản.
              </p>
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-amber-950 font-medium space-y-1">
                <p>👉 <strong>Cách xử lý (chỉ mất 10 giây):</strong></p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>Kéo xuống mục <strong>Đoạn mã SQL</strong> bên dưới, bấm nút <strong>"Sao chép SQL"</strong>.</li>
                  <li>Mở <strong>SQL Editor</strong> trên Supabase, dán mã vào và bấm <strong>RUN</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Other Error Message */}
          {!tableMissing && errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sync actions if configured */}
          {isConfigured && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                Thao tác đồng bộ dữ liệu lớp học
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handlePushToCloud}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Đẩy toàn bộ dữ liệu lên Cloud</span>
                </button>
                <button
                  onClick={handlePullFromCloud}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl text-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4 text-slate-600" />
                  <span>Tải dữ liệu mới nhất từ Cloud</span>
                </button>
              </div>
            </div>
          )}

          {/* SQL Setup Script */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Đoạn mã SQL tạo bảng (teacher_accounts & class_data)</span>
              </h3>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép SQL'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 max-h-48">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500">
              * Dán đoạn mã này vào <strong>SQL Editor</strong> trên Supabase và bấm <strong>RUN</strong> một lần duy nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
