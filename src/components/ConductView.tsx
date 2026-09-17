import React, { useState } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Student, ConductRecord, ConductRank } from '../types';
import { formatDateVi } from '../utils/storage';

interface ConductViewProps {
  students: Student[];
  conductList: ConductRecord[];
  onAddConduct: (record: Omit<ConductRecord, 'id' | 'createdDate'>) => void;
  onDeleteConduct: (id: string) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ConductView: React.FC<ConductViewProps> = ({
  students,
  conductList,
  onAddConduct,
  onDeleteConduct,
  onBackToHome,
  showToast,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [periodType, setPeriodType] = useState<ConductRecord['periodType']>('Tháng');
  const [periodValue, setPeriodValue] = useState<string>('Tháng 9');
  const [rank, setRank] = useState<ConductRank>('Tốt');
  const [feedback, setFeedback] = useState<string>('');
  
  // Filters & search for history
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRank, setFilterRank] = useState<'all' | ConductRank>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // Quick feedback phrase templates for teachers
  const sampleFeedbacks = [
    'Chăm ngoan, gương mẫu, tích cực phát biểu xây dựng bài trong giờ học.',
    'Có tiến bộ rõ rệt trong nề nếp xếp hàng và sinh hoạt tập thể.',
    'Hoàn thành xuất sắc nhiệm vụ được giao, hỗ trợ các bạn cùng tiến bộ.',
    'Cần tập trung hơn trong giờ tự quản, hạn chế làm việc riêng.',
    'Thực hiện tốt phong trào Đôi bạn cùng tiến, nhiệt tình tham gia văn nghệ.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Vui lòng chọn học sinh!', 'error');
      return;
    }
    if (!feedback.trim()) {
      showToast('Vui lòng nhập nhận xét rèn luyện!', 'error');
      return;
    }

    onAddConduct({
      studentId: selectedStudentId,
      periodType,
      periodValue,
      rank,
      feedback: feedback.trim(),
    });

    setFeedback('');
    showToast('Đã lưu đánh giá rèn luyện học sinh thành công!', 'success');
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Filtered history list
  const filteredConducts = conductList.filter((c) => {
    const student = students.find((s) => s.id === c.studentId);
    const matchSearch =
      (student?.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false) ||
      c.feedback.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.periodValue.toLowerCase().includes(searchKeyword.toLowerCase());
    if (!matchSearch) return false;

    if (filterRank !== 'all' && c.rank !== filterRank) return false;
    if (filterPeriod !== 'all' && c.periodValue !== filterPeriod) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-slate-600"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Đánh giá hạnh kiểm & rèn luyện</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi định kỳ tuần, tháng, học kỳ theo chuẩn Đánh giá học sinh THCS (TT 22)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Tổng số {conductList.length} lượt đánh giá đã lưu</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Evaluation Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <span>Nhập nhận xét rèn luyện mới</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn học sinh và mức độ xếp loại hạnh kiểm
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Choose Student */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Chọn học sinh
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.orderNumber}. {s.fullName} ({s.gender} - Tổ {s.groupNumber}{s.role !== 'Thành viên' ? ` - ${s.role}` : ''})
                  </option>
                ))}
              </select>

              {selectedStudent && (
                <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                  <span><strong>{selectedStudent.fullName}</strong> • Tổ {selectedStudent.groupNumber}</span>
                  <span className="font-medium text-blue-600">{selectedStudent.role}</span>
                </div>
              )}
            </div>

            {/* Period selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Kỳ đánh giá
                </label>
                <select
                  value={periodType}
                  onChange={(e) => {
                    const val = e.target.value as ConductRecord['periodType'];
                    setPeriodType(val);
                    if (val === 'Tuần') setPeriodValue('Tuần 3');
                    else if (val === 'Tháng') setPeriodValue('Tháng 9');
                    else if (val === 'Học kỳ I') setPeriodValue('Học kỳ I');
                    else if (val === 'Học kỳ II') setPeriodValue('Học kỳ II');
                    else setPeriodValue('Cả năm');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Tuần">Theo Tuần</option>
                  <option value="Tháng">Theo Tháng</option>
                  <option value="Học kỳ I">Học kỳ I</option>
                  <option value="Học kỳ II">Học kỳ II</option>
                  <option value="Cả năm">Cả năm học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên kỳ / Đợt
                </label>
                <input
                  type="text"
                  value={periodValue}
                  onChange={(e) => setPeriodValue(e.target.value)}
                  placeholder="Ví dụ: Tuần 2, Tháng 9..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Rank Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Xếp loại rèn luyện
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Tốt', 'Khá', 'Đạt', 'Chưa đạt'] as ConductRank[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRank(r)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      rank === r
                        ? r === 'Tốt'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : r === 'Khá'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : r === 'Đạt'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Nhận xét của giáo viên chủ nhiệm
                </label>
                <span className="text-[11px] text-slate-400">Rõ ràng, cụ thể</span>
              </div>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Nhập nhận xét về nề nếp, ý thức học tập, tinh thần đoàn kết, chấp hành nội quy trường lớp..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              />

              {/* Sample phrases quick-pick */}
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Gợi ý nhận xét nhanh (chạm để chọn):
                </span>
                <div className="space-y-1">
                  {sampleFeedbacks.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedback(phrase)}
                      className="block w-full text-left text-[11px] text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 p-1.5 rounded-lg transition-colors truncate"
                      title={phrase}
                    >
                      • {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Lưu đánh giá hạnh kiểm</span>
            </button>
          </form>
        </div>

        {/* Right column: Evaluation History & List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Lịch sử và sổ đánh giá rèn luyện</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp {filteredConducts.length} bản ghi rèn luyện
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={filterRank}
                  onChange={(e) => setFilterRank(e.target.value as any)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Tất cả xếp loại</option>
                  <option value="Tốt">Xếp loại Tốt</option>
                  <option value="Khá">Xếp loại Khá</option>
                  <option value="Đạt">Xếp loại Đạt</option>
                  <option value="Chưa đạt">Chưa đạt</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh hoặc nội dung nhận xét..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Conduct Cards */}
            <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredConducts.map((record) => {
                const st = students.find((s) => s.id === record.studentId);
                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all bg-white relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {st ? st.fullName : 'Học sinh'}
                          </span>
                          {st && (
                            <span className="text-xs text-slate-400 font-medium">
                              (STT {st.orderNumber} • Tổ {st.groupNumber})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {record.periodValue}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                              record.rank === 'Tốt'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : record.rank === 'Khá'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : record.rank === 'Đạt'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            Xếp loại: {record.rank}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDateVi(record.createdDate)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa bản ghi đánh giá này?')) {
                            onDeleteConduct(record.id);
                            showToast('Đã xóa bản ghi đánh giá.', 'info');
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Xóa bản ghi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      "{record.feedback}"
                    </p>
                  </div>
                );
              })}

              {filteredConducts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-medium">Chưa có đánh giá nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
