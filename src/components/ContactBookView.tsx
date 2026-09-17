import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Send,
  User,
  Sparkles
} from 'lucide-react';
import { Student, ContactRecord } from '../types';
import { formatDateVi, getTodayDateString } from '../utils/storage';

interface ContactBookViewProps {
  students: Student[];
  contactsList: ContactRecord[];
  onAddContact: (record: Omit<ContactRecord, 'id'>) => void;
  onUpdateContactStatus: (id: string, status: 'pending' | 'resolved') => void;
  onDeleteContact: (id: string) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ContactBookView: React.FC<ContactBookViewProps> = ({
  students,
  contactsList,
  onAddContact,
  onUpdateContactStatus,
  onDeleteContact,
  onBackToHome,
  showToast,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New record form
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [date, setDate] = useState(getTodayDateString());
  const [content, setContent] = useState('');
  const [parentFeedback, setParentFeedback] = useState('');
  const [status, setStatus] = useState<'pending' | 'resolved'>('resolved');
  const [notes, setNotes] = useState('');

  // Quick SMS/Zalo generator
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState<Student | null>(null);
  const [customMsgTopic, setCustomMsgTopic] = useState<'chuyen_can' | 'hoc_tap' | 'hop_ph' | 'khen_thuong'>('hoc_tap');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Vui lòng chọn học sinh!', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Vui lòng nhập nội dung trao đổi với phụ huynh!', 'error');
      return;
    }

    onAddContact({
      studentId: selectedStudentId,
      date,
      content: content.trim(),
      parentFeedback: parentFeedback.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });

    setContent('');
    setParentFeedback('');
    setNotes('');
    setShowAddModal(false);
    showToast('Đã lưu nội dung trao đổi vào sổ liên lạc!', 'success');
  };

  const filteredContacts = contactsList.filter((c) => {
    const student = students.find((s) => s.id === c.studentId);
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;

    const match =
      (student?.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false) ||
      (student?.parentPhone.includes(searchKeyword) ?? false) ||
      c.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (c.parentFeedback?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false);

    return match;
  });

  const generateQuickMessage = (student: Student) => {
    let msg = `Kính gửi Phụ huynh em ${student.fullName} (Lớp 9A2 - THCS Phan Bội Châu),\n`;
    msg += `Thầy Dương Thành Tín (GVCN) xin phép gửi thông báo:\n`;

    if (customMsgTopic === 'chuyen_can') {
      msg += `Hôm nay em có đi trễ/vắng học. Kính mong phụ huynh lưu ý, nhắc nhở và phối hợp cùng nhà trường đôn đốc giờ giấc của em.\n`;
    } else if (customMsgTopic === 'hoc_tap') {
      msg += `Về tình hình học tập tuần qua, em cần chú ý làm đầy đủ bài tập về nhà và tập trung hơn trong các tiết học ôn luyện.\n`;
    } else if (customMsgTopic === 'khen_thuong') {
      msg += `Thầy xin chúc mừng gia đình! Tuần qua em đã có thành tích học tập tốt và tích cực phát biểu xây dựng bài, được khen ngợi trước lớp.\n`;
    } else {
      msg += `Kính mời Phụ huynh tới tham dự buổi họp phụ huynh lớp 9A2 vào Chủ Nhật tuần này tại phòng học 204 lúc 08h00. Trân trọng!\n`;
    }

    msg += `Mọi trao đổi thêm xin liên hệ với thầy qua số ĐT của GVCN. Trân trọng cảm ơn Phụ huynh!`;
    return msg;
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép nội dung tin nhắn vào bộ nhớ đệm!', 'success');
  };

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
              <h2 className="text-xl font-bold text-slate-900">Sổ liên lạc & trao đổi phụ huynh</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhật ký trao đổi, phản hồi của phụ huynh và tin nhắn thông báo lớp 9A2
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận trao đổi mới</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng số lần liên lạc</span>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{contactsList.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
            filterStatus === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-xs text-amber-700 font-semibold">Chưa xử lý / Cần gọi lại</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {contactsList.filter((c) => c.status === 'pending').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
            filterStatus === 'resolved'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-xs text-emerald-700 font-semibold">Đã trao đổi xong</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {contactsList.filter((c) => c.status === 'resolved').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, số ĐT hoặc nội dung..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Chưa xử lý
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Đã xử lý
          </button>
        </div>
      </div>

      {/* Contacts List Cards */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => {
          const student = students.find((s) => s.id === contact.studentId);
          return (
            <div
              key={contact.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-300 hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {student ? student.orderNumber : '—'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {student ? student.fullName : 'Học sinh'}
                      </span>
                      {student && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          Tổ {student.groupNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        <span>PH: {student ? student.parentPhone : 'Chưa có SĐT'}</span>
                        {student?.parentName && ` (${student.parentName})`}
                      </span>
                      <span>•</span>
                      <span>Ngày: {formatDateVi(contact.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick message modal trigger */}
                  {student && (
                    <button
                      onClick={() => setSelectedStudentForMessage(student)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition-all"
                      title="Soạn tin nhắn Zalo/SMS nhanh"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Tin nhắn nhanh</span>
                    </button>
                  )}

                  {/* Status Toggle */}
                  <button
                    onClick={() => {
                      const next = contact.status === 'pending' ? 'resolved' : 'pending';
                      onUpdateContactStatus(contact.id, next);
                      showToast(
                        next === 'resolved'
                          ? 'Đã đánh dấu trao đổi: Đã xử lý!'
                          : 'Đã chuyển trạng thái: Cần trao đổi!',
                        'info'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                      contact.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {contact.status === 'resolved' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã xử lý</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Cần xử lý</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Xác nhận xóa bản ghi liên lạc này?')) {
                        onDeleteContact(contact.id);
                        showToast('Đã xóa bản ghi.', 'info');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Xóa bản ghi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exchange Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nội dung thầy trao đổi:
                  </span>
                  <p className="text-slate-800 leading-relaxed">{contact.content}</p>
                  {contact.notes && (
                    <span className="block mt-2 text-[11px] text-slate-400 italic">
                      Ghi chú: {contact.notes}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/80">
                  <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Ý kiến phản hồi của phụ huynh:
                  </span>
                  <p className="text-slate-800 leading-relaxed">
                    {contact.parentFeedback || (
                      <span className="text-slate-400 italic">Chưa có phản hồi từ phụ huynh.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <p className="text-sm font-medium">Chưa có nội dung trao đổi nào phù hợp bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Quick SMS / Zalo Generator Modal */}
      {selectedStudentForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Mẫu tin nhắn nhanh Zalo / SMS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gửi tới phụ huynh em <strong>{selectedStudentForMessage.fullName}</strong> (
                    {selectedStudentForMessage.parentPhone})
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chủ đề thông báo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomMsgTopic('hoc_tap')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      customMsgTopic === 'hoc_tap'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    📚 Kết quả học tập
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMsgTopic('chuyen_can')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      customMsgTopic === 'chuyen_can'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    ⏰ Chuyên cần / Đi trễ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMsgTopic('khen_thuong')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      customMsgTopic === 'khen_thuong'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    ⭐ Khen ngợi học sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMsgTopic('hop_ph')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      customMsgTopic === 'hop_ph'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    📅 Mời họp phụ huynh
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội dung xem trước
                </label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generateQuickMessage(selectedStudentForMessage)}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForMessage(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyMessage(generateQuickMessage(selectedStudentForMessage));
                    setSelectedStudentForMessage(null);
                  }}
                  className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao chép để gửi Zalo / SMS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Ghi nhận trao đổi với phụ huynh
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Lưu nhật ký cuộc gọi hoặc tin nhắn để theo dõi tiến độ
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Học sinh *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.orderNumber}. {s.fullName} — SĐT PH: {s.parentPhone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày liên lạc
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
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="resolved">Đã trao đổi xong</option>
                    <option value="pending">Cần gọi lại / Chưa phản hồi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung thầy trao đổi với phụ huynh *
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ví dụ: Nhắc phụ huynh đôn đốc con học bài cũ môn Hóa, thông báo điểm kiểm tra 1 tiết..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ý kiến / Phản hồi của phụ huynh (nếu có)
                </label>
                <textarea
                  rows={2}
                  value={parentFeedback}
                  onChange={(e) => setParentFeedback(e.target.value)}
                  placeholder="Ví dụ: Phụ huynh ghi nhận, nhờ thầy cô quan tâm hơn trên lớp..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hình thức & ghi chú
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Gọi điện trực tiếp, nhắn tin Zalo lúc 19h..."
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
                  Lưu vào sổ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
