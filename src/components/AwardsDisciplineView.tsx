import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Student, RewardDisciplineRecord } from '../types';
import { formatDateVi, getTodayDateString } from '../utils/storage';

interface AwardsDisciplineViewProps {
  students: Student[];
  awardsList: RewardDisciplineRecord[];
  onAddRecord: (record: Omit<RewardDisciplineRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AwardsDisciplineView: React.FC<AwardsDisciplineViewProps> = ({
  students,
  awardsList,
  onAddRecord,
  onDeleteRecord,
  onBackToHome,
  showToast,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reward' | 'discipline'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [type, setType] = useState<'reward' | 'discipline'>('reward');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [content, setContent] = useState('');
  const [points, setPoints] = useState('5');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề khen thưởng / vi phạm!', 'error');
      return;
    }

    const p = parseInt(points, 10) || 0;
    const finalPoints = type === 'reward' ? Math.abs(p) : -Math.abs(p);

    onAddRecord({
      studentId: selectedStudentId,
      type,
      title: title.trim(),
      date,
      content: content.trim(),
      points: finalPoints,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setContent('');
    setNotes('');
    setShowAddModal(false);
    showToast(
      `Đã ghi nhận ${type === 'reward' ? 'khen thưởng' : 'vi phạm'} cho học sinh!`,
      'success'
    );
  };

  const filteredList = awardsList.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    const student = students.find((s) => s.id === item.studentId);
    const match =
      (student?.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false) ||
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.content.toLowerCase().includes(searchKeyword.toLowerCase());
    return match;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all text-slate-600"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-xl font-bold text-slate-900">Sổ thi đua: Khen thưởng & Vi phạm</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận gương việc tốt, hoa điểm 10 và nhắc nhở nề nếp kỷ luật lớp 9A2
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ghi nhận sự việc</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Tất cả ({awardsList.length})
          </button>
          <button
            onClick={() => setFilterType('reward')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'reward' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            Khen thưởng ({awardsList.filter((a) => a.type === 'reward').length})
          </button>
          <button
            onClick={() => setFilterType('discipline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'discipline' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            Vi phạm ({awardsList.filter((a) => a.type === 'discipline').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc nội dung..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item) => {
          const student = students.find((s) => s.id === item.studentId);
          const isReward = item.type === 'reward';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all bg-white flex flex-col justify-between ${
                isReward
                  ? 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-md'
                  : 'border-rose-200/90 hover:border-rose-400 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isReward
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isReward ? <Award className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          isReward ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isReward ? '⭐ Khen thưởng / Thành tích' : '⚠️ Vi phạm / Nhắc nhở'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có muốn xóa bản ghi này không?')) {
                        onDeleteRecord(item.id);
                        showToast('Đã xóa bản ghi.', 'info');
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Xóa bản ghi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span className="font-bold text-slate-800">
                    Học sinh: {student ? student.fullName : 'Học sinh'} (STT {student?.orderNumber || '—'})
                  </span>
                  <span className="text-slate-400">Ngày: {formatDateVi(item.date)}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  {item.content}
                </p>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic mt-2">
                    Biện pháp: {item.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Điểm thi đua cá nhân:</span>
                <span
                  className={`text-sm font-black px-3 py-1 rounded-xl ${
                    isReward
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isReward ? `+${item.points || 5}` : `${item.points || -2}`} điểm
                </span>
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="col-span-2 bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <p className="text-sm font-medium">Chưa có bản ghi thi đua nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Ghi nhận Khen thưởng hoặc Vi phạm
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Cập nhật vào sổ theo dõi nề nếp thi đua lớp 9A2
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hình thức *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('reward');
                      setPoints('5');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === 'reward'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Khen thưởng (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('discipline');
                      setPoints('2');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === 'discipline'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Vi phạm (-)</span>
                  </button>
                </div>
              </div>

              {/* Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Học sinh *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.orderNumber}. {s.fullName} (Tổ {s.groupNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tiêu đề sự việc *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đạt điểm 10 môn Hóa, Nhặt được của rơi trả lại..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Date & Points */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày ghi nhận
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Điểm thi đua ({type === 'reward' ? '+' : '-'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-amber-600 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mô tả cụ thể sự việc..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Biện pháp / Ghi chú xử lý
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Tuyên dương trước lớp, nhắc nhở riêng giờ ra chơi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-500/25"
                >
                  Lưu vào sổ thi đua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
