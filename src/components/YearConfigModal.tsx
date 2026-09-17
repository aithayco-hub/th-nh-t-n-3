import React, { useState } from 'react';
import { Calendar, CheckCircle2, X, Settings, Sparkles } from 'lucide-react';
import { ClassMetadata } from '../types';

interface YearConfigModalProps {
  metadata?: ClassMetadata;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<ClassMetadata>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const YearConfigModal: React.FC<YearConfigModalProps> = ({
  metadata,
  isOpen,
  onClose,
  onSave,
  showToast,
}) => {
  if (!isOpen) return null;

  const [academicYear, setAcademicYear] = useState(metadata?.academicYear || '2026–2027');
  const [semester, setSemester] = useState<'Học kỳ I' | 'Học kỳ II'>('Học kỳ I');
  const [week, setWeek] = useState('Tuần 3');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ academicYear });
    showToast(`Đã cấu hình năm học ${academicYear}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cấu hình năm học</h3>
              <p className="text-xs text-slate-500">Thiết lập chu kỳ quản lý lớp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Năm học hiện tại
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="2024–2025">Năm học 2024–2025</option>
              <option value="2025–2026">Năm học 2025–2026</option>
              <option value="2026–2027">Năm học 2026–2027 (Mặc định)</option>
              <option value="2027–2028">Năm học 2027–2028</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Học kỳ công tác
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSemester('Học kỳ I')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  semester === 'Học kỳ I'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Học kỳ I (09/2026 – 01/2027)
              </button>
              <button
                type="button"
                onClick={() => setSemester('Học kỳ II')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  semester === 'Học kỳ II'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Học kỳ II (01/2027 – 05/2027)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tuần thực học hiện tại
            </label>
            <input
              type="text"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-800">
            📌 <strong>Lưu ý:</strong> Năm học mặc định của hệ thống là <strong>2026–2027</strong> theo đúng phân công chuyên môn của Trường THCS Phan Bội Châu.
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
