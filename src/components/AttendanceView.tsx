import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Save,
  Search,
  CheckCheck,
  UserCheck,
  Printer
} from 'lucide-react';
import { Student, DailyAttendance, AttendanceStatus } from '../types';
import { formatDateVi } from '../utils/storage';

interface AttendanceViewProps {
  students: Student[];
  attendanceRecords: Record<string, DailyAttendance>;
  onSaveAttendance: (date: string, records: DailyAttendance['records']) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
  onBackToHome,
  showToast,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Local working copy of records for selected date
  const [currentMap, setCurrentMap] = useState<Record<string, { status: AttendanceStatus; note?: string }>>(() => {
    const existing = attendanceRecords[selectedDate];
    if (existing) return { ...existing.records };
    // Default all present
    const init: Record<string, { status: AttendanceStatus; note?: string }> = {};
    students.forEach((s) => {
      init[s.id] = { status: 'present' };
    });
    return init;
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AttendanceStatus>('all');
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Handle date switch
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const existing = attendanceRecords[newDate];
    if (existing) {
      setCurrentMap({ ...existing.records });
    } else {
      const init: Record<string, { status: AttendanceStatus; note?: string }> = {};
      students.forEach((s) => {
        init[s.id] = { status: 'present' };
      });
      setCurrentMap(init);
    }
  };

  // Toggle or set status for a student
  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setCurrentMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Set all students to present
  const handleMarkAllPresent = () => {
    const next: Record<string, { status: AttendanceStatus; note?: string }> = {};
    students.forEach((s) => {
      next[s.id] = {
        status: 'present',
        note: currentMap[s.id]?.note,
      };
    });
    setCurrentMap(next);
    showToast('Đã đánh dấu tất cả học sinh CÓ MẶT.', 'info');
  };

  // Save changes
  const handleSave = () => {
    onSaveAttendance(selectedDate, currentMap);
    showToast(`Đã lưu dữ liệu điểm danh ngày ${formatDateVi(selectedDate)} thành công!`, 'success');
  };

  // Quick stats for current date
  const total = students.length;
  let countPresent = 0;
  let countExcused = 0;
  let countUnexcused = 0;
  let countLate = 0;

  students.forEach((s) => {
    const rec = currentMap[s.id];
    const st = rec?.status || 'present';
    if (st === 'present') countPresent++;
    else if (st === 'excused') countExcused++;
    else if (st === 'unexcused') countUnexcused++;
    else if (st === 'late') countLate++;
  });

  // Filter list
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.orderNumber.toString().includes(searchKeyword);
    if (!matchSearch) return false;

    if (filterStatus === 'all') return true;
    const currentStatus = currentMap[s.id]?.status || 'present';
    return currentStatus === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
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
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Sổ điểm danh chuyên cần</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lớp 9A2 • THCS Phan Bội Châu • Chạm để đổi trạng thái nhanh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs sm:text-sm transition-all"
            title="Đánh dấu cả lớp có mặt"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tất cả có mặt</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-all"
            title="In phiếu điểm danh"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In sổ</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-medium">Tổng sĩ số</span>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{total}</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'present' ? 'all' : 'present')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-center ${
            filterStatus === 'present'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Có mặt</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{countPresent}</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'excused' ? 'all' : 'excused')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-center ${
            filterStatus === 'excused'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Nghỉ có phép</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{countExcused}</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'unexcused' ? 'all' : 'unexcused')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-center ${
            filterStatus === 'unexcused'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-rose-600 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Nghỉ k.phép</span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-0.5">{countUnexcused}</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'late' ? 'all' : 'late')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-center col-span-2 sm:col-span-1 ${
            filterStatus === 'late'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-indigo-600 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Đi muộn</span>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-0.5">{countLate}</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc số thứ tự..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 shrink-0 font-medium">Lọc danh sách:</span>
          {(['all', 'present', 'excused', 'unexcused', 'late'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' && 'Tất cả'}
              {st === 'present' && 'Có mặt'}
              {st === 'excused' && 'Nghỉ phép'}
              {st === 'unexcused' && 'Không phép'}
              {st === 'late' && 'Đi muộn'}
            </button>
          ))}
        </div>
      </div>

      {/* Student List for Attendance */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student) => {
            const currentStatus = currentMap[student.id]?.status || 'present';
            const studentNote = currentMap[student.id]?.note || '';

            return (
              <div
                key={student.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Student info */}
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {student.orderNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{student.fullName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {student.gender}
                      </span>
                      {student.role !== 'Thành viên' && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200">
                          {student.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tổ {student.groupNumber} • SĐT PH: {student.parentPhone}
                    </p>
                  </div>
                </div>

                {/* Status Selection Buttons (Big 1-touch Pills) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {/* Có mặt */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'present')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Có mặt</span>
                  </button>

                  {/* Nghỉ phép */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'excused')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      currentStatus === 'excused'
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-2 ring-amber-300'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Nghỉ phép</span>
                  </button>

                  {/* Nghỉ không phép */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'unexcused')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      currentStatus === 'unexcused'
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25 ring-2 ring-rose-300'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Không phép</span>
                  </button>

                  {/* Đi muộn */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'late')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      currentStatus === 'late'
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-300'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Đi muộn</span>
                  </button>

                  {/* Note button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoteStudentId(student.id);
                      setTempNote(studentNote);
                    }}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      studentNote
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={studentNote ? `Ghi chú: ${studentNote}` : 'Thêm ghi chú điểm danh'}
                  >
                    📝 {studentNote ? 'Đã có ghi chú' : 'Ghi chú'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-base font-medium">Không tìm thấy học sinh nào phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {editingNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Ghi chú điểm danh: {students.find((s) => s.id === editingNoteStudentId)?.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập lý do nghỉ học, thời gian vào lớp trễ hoặc thông tin phụ huynh báo.
            </p>

            <textarea
              rows={3}
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Ví dụ: Phụ huynh gọi điện xin phép nghỉ ốm sốt..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingNoteStudentId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentMap((prev) => ({
                    ...prev,
                    [editingNoteStudentId]: {
                      ...prev[editingNoteStudentId],
                      note: tempNote,
                    },
                  }));
                  setEditingNoteStudentId(null);
                  showToast('Đã lưu ghi chú cho học sinh.', 'info');
                }}
                className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
