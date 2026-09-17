import React, { useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ScheduleEvent } from '../types';
import { formatDateVi, getTodayDateString } from '../utils/storage';

interface ScheduleViewProps {
  scheduleList: ScheduleEvent[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  scheduleList,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
  onBackToHome,
  showToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleEvent['category']>('Chủ nhiệm');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('07:30 - 08:15');
  const [location, setLocation] = useState('Phòng học 9A2');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên công việc / sự kiện!', 'error');
      return;
    }

    onAddEvent({
      title: title.trim(),
      category,
      date,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      content: content.trim(),
      completed: false,
    });

    setTitle('');
    setContent('');
    setShowAddModal(false);
    showToast('Đã thêm kế hoạch công tác thành công!', 'success');
  };

  const filteredList = scheduleList.filter((ev) => {
    if (filterCategory !== 'all' && ev.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all text-slate-600"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">Lịch công tác chủ nhiệm</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kế hoạch sinh hoạt, họp phụ huynh, kiểm tra định kỳ và ngoại khóa lớp 9A2
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm sự kiện / Lịch mới</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất cả sự kiện' },
          { id: 'Chủ nhiệm', label: 'Công tác chủ nhiệm' },
          { id: 'Họp phụ huynh', label: 'Họp phụ huynh' },
          { id: 'Họp lớp', label: 'Họp lớp' },
          { id: 'Kiểm tra', label: 'Kiểm tra / Khảo sát' },
          { id: 'Ngoại khóa', label: 'Ngoại khóa & Đoàn Đội' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterCategory(item.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === item.id
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredList.map((ev) => (
          <div
            key={ev.id}
            className={`p-5 rounded-3xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              ev.completed
                ? 'border-slate-200 bg-slate-50/50 opacity-70'
                : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => {
                  onToggleComplete(ev.id);
                  showToast(
                    ev.completed ? 'Đã chuyển thành chưa hoàn thành' : 'Đã đánh dấu hoàn thành công việc!',
                    'info'
                  );
                }}
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  ev.completed
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-slate-300 hover:border-teal-500'
                }`}
                title="Đánh dấu hoàn thành"
              >
                {ev.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    {ev.category}
                  </span>
                  <h4
                    className={`font-bold text-base text-slate-900 ${
                      ev.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {ev.title}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {ev.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{formatDateVi(ev.date)}</span>
                  </span>
                  {ev.time && (
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{ev.time}</span>
                    </span>
                  )}
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa lịch này không?')) {
                    onDeleteEvent(ev.id);
                    showToast('Đã xóa sự kiện.', 'info');
                  }
                }}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Xóa sự kiện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <p className="text-sm font-medium">Chưa có sự kiện nào trong mục này.</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Thêm lịch công tác mới
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Lập kế hoạch công việc chủ nhiệm lớp 9A2
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên sự kiện / Công việc *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Họp ban cán sự lớp, Phổ biến thi giữa kỳ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phân loại
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="Chủ nhiệm">Chủ nhiệm</option>
                    <option value="Họp phụ huynh">Họp phụ huynh</option>
                    <option value="Họp lớp">Họp lớp</option>
                    <option value="Kiểm tra">Kiểm tra</option>
                    <option value="Ngoại khóa">Ngoại khóa</option>
                    <option value="Khác">Ghi chú khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày thực hiện
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thời gian (giờ)
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="07:30 - 08:15"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Phòng học 9A2..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ghi chú nội dung trọng tâm cần triển khai..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white"
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
                  className="px-6 py-2.5 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-500/25"
                >
                  Lưu vào lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
