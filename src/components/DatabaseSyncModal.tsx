import React, { useState } from 'react';
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
  Code
} from 'lucide-react';
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_SQL,
  loadDataFromSupabase,
  saveDataToSupabase
} from '../utils/supabase';
import { AppState, saveStateToLocalStorage } from '../utils/storage';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onApplyRemoteState: (newState: AppState) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onApplyRemoteState,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    showToast('Đã sao chép câu lệnh SQL vào clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePushToCloud = async () => {
    if (!isConfigured) {
      showToast('Chưa có cấu hình biến môi trường Supabase!', 'error');
      return;
    }
    setSyncing(true);
    setErrorMessage(null);
    const res = await saveDataToSupabase(currentState);
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
      showToast('Chưa có cấu hình biến môi trường Supabase!', 'error');
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
              <p className="text-xs text-emerald-100">Đồng bộ dữ liệu học sinh, điểm danh, nề nếp vĩnh viễn trên đám mây</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Status card */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isConfigured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {isConfigured ? 'Đã nhận diện thông số Supabase' : 'Đang lưu cục bộ (Chưa kết nối Supabase)'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  isConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {isConfigured ? 'Online' : 'Local Storage'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isConfigured
                  ? 'Ứng dụng đã sẵn sàng kết nối và tự động đồng bộ dữ liệu hai chiều với tài khoản Supabase của bạn.'
                  : 'Hiện tại dữ liệu chỉ được lưu trên trình duyệt của máy tính này. Khi bạn deploy lên Vercel hoặc mở ở máy khác, hãy làm theo các bước bên dưới để lưu trữ vĩnh viễn.'}
              </p>
            </div>
          </div>

          {/* Table Missing Alert Banner */}
          {tableMissing && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Chưa tìm thấy bảng "class_data" trên Supabase (Lỗi PGRST205 / PGRST125)</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Supabase thông báo: <em>"Could not find the table 'public.class_data' in the schema cache"</em>. Điều này xảy ra do bảng <strong>class_data</strong> chưa được tạo hoặc chưa được cấp quyền (GRANT) cho vai trò anon trong Supabase.
              </p>
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-amber-950 font-medium space-y-1">
                <p>👉 <strong>Cách xử lý (chỉ mất 10 giây):</strong></p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>Kéo xuống <strong>Bước 2</strong> bên dưới, bấm nút <strong>"Sao chép SQL"</strong>.</li>
                  <li>Mở <strong>SQL Editor</strong> trên Supabase, dán mã vào và bấm <strong>RUN</strong>.</li>
                  <li>Quay lại đây bấm <strong>"Đẩy dữ liệu hiện tại lên Cloud"</strong> là xong ngay!</li>
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
                Thao tác đồng bộ dữ liệu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handlePushToCloud}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Đẩy dữ liệu hiện tại lên Cloud</span>
                </button>
                <button
                  onClick={handlePullFromCloud}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl text-xs transition-colors shadow-2xs disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4 text-slate-600" />
                  <span>Tải dữ liệu mới nhất từ Cloud</span>
                </button>
              </div>
            </div>
          )}

          {/* Setup Guide */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Hướng dẫn thiết lập Supabase cho Vercel (chỉ cần làm 1 lần)
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-800">Tạo Project Supabase:</strong> Truy cập{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 font-semibold underline inline-flex items-center gap-0.5 hover:text-teal-700"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  và tạo một project mới (chọn Region Singapore).
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">2</span>
                <div className="flex-1">
                  <strong className="text-slate-800">Tạo bảng lưu trữ:</strong> Mở mục <strong>SQL Editor</strong> ở menu bên trái của Supabase, dán đoạn mã sau và bấm <strong>RUN</strong>:
                  <div className="mt-2 relative">
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                      {SUPABASE_SETUP_SQL}
                    </pre>
                    <button
                      onClick={handleCopySQL}
                      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium backdrop-blur-md transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã chép' : 'Sao chép SQL'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-800">Cài đặt trên Vercel:</strong> Vào <strong>Project Settings ➔ Environment Variables</strong> trên Vercel, thêm 2 biến:
                  <ul className="list-disc pl-5 mt-1 space-y-1 font-mono text-[11px] text-slate-700">
                    <li>
                      <strong>VITE_SUPABASE_URL</strong>: (Project URL trong Supabase ➔ Project Settings ➔ API)
                    </li>
                    <li>
                      <strong>VITE_SUPABASE_ANON_KEY</strong>: (Project API Key loại <code>anon / public</code>)
                    </li>
                  </ul>
                  Sau đó nhấn <strong>Redeploy</strong> trên Vercel là hoàn tất!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
