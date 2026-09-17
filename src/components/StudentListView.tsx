import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  MapPin,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Sparkles,
  Info,
  Download,
  Upload,
  UserPlus,
  CheckSquare,
  Square,
  MinusSquare,
  X
} from 'lucide-react';
import { Student } from '../types';
import { formatDateVi } from '../utils/storage';
import { ExcelImportModal } from './ExcelImportModal';
import { exportStudentsToExcel } from '../utils/excelHelper';

interface StudentListViewProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'orderNumber'>) => void;
  onBatchAddStudents: (students: Omit<Student, 'id' | 'orderNumber'>[], mode: 'append' | 'replace') => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onBatchDeleteStudents?: (ids: string[]) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  onAddStudent,
  onBatchAddStudents,
  onUpdateStudent,
  onDeleteStudent,
  onBatchDeleteStudents,
  onBackToHome,
  showToast,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | 1 | 2 | 3 | 4>('all');

  // Selected student IDs for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formDob, setFormDob] = useState('2012-01-01');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formRole, setFormRole] = useState<Student['role']>('Thành viên');
  const [formGroupNumber, setFormGroupNumber] = useState<1 | 2 | 3 | 4>(1);
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setFormFullName('');
    setFormGender('Nam');
    setFormDob('2012-01-01');
    setFormParentPhone('');
    setFormParentName('');
    setFormRole('Thành viên');
    setFormGroupNumber(1);
    setFormAddress('');
    setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormFullName(s.fullName);
    setFormGender(s.gender);
    setFormDob(s.dob);
    setFormParentPhone(s.parentPhone);
    setFormParentName(s.parentName || '');
    setFormRole(s.role);
    setFormGroupNumber(s.groupNumber);
    setFormAddress(s.address || '');
    setFormNotes(s.notes || '');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh!', 'error');
      return;
    }
    if (!formParentPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại phụ huynh!', 'error');
      return;
    }

    onAddStudent({
      fullName: formFullName.trim(),
      gender: formGender,
      dob: formDob,
      parentPhone: formParentPhone.trim(),
      parentName: formParentName.trim() || undefined,
      role: formRole,
      groupNumber: formGroupNumber,
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
    });

    setShowAddModal(false);
    showToast('Đã thêm học sinh mới thành công!', 'success');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!formFullName.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh!', 'error');
      return;
    }

    onUpdateStudent(editingStudent.id, {
      fullName: formFullName.trim(),
      gender: formGender,
      dob: formDob,
      parentPhone: formParentPhone.trim(),
      parentName: formParentName.trim() || undefined,
      role: formRole,
      groupNumber: formGroupNumber,
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
    });

    setEditingStudent(null);
    showToast('Đã cập nhật thông tin học sinh thành công!', 'success');
  };

  const confirmDelete = () => {
    if (deletingStudent) {
      onDeleteStudent(deletingStudent.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deletingStudent.id));
      showToast(`Đã xóa học sinh ${deletingStudent.fullName} khỏi danh sách lớp!`, 'info');
      setDeletingStudent(null);
    }
  };

  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBatchDeleteStudents) {
      onBatchDeleteStudents(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteStudent(id));
    }
    showToast(`Đã xóa thành công ${selectedIds.length} học sinh khỏi danh sách lớp!`, 'info');
    setSelectedIds([]);
    setShowBatchDeleteModal(false);
  };

  // Filter logic
  const filteredStudents = students.filter((s) => {
    if (filterGender !== 'all' && s.gender !== filterGender) return false;
    if (filterGroup !== 'all' && s.groupNumber !== filterGroup) return false;

    const matchSearch =
      s.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.parentPhone.includes(searchKeyword) ||
      s.orderNumber.toString().includes(searchKeyword) ||
      (s.notes?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false);

    return matchSearch;
  });

  // Selection helpers
  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));
  const someFilteredSelected =
    filteredStudents.some((s) => selectedIds.includes(s.id)) && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all currently filtered
      const filteredIdSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Select all currently filtered
      const combined = new Set([...selectedIds, ...filteredStudents.map((s) => s.id)]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

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
              <h2 className="text-xl font-bold text-slate-900">Danh sách học sinh Lớp 9A2</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý hồ sơ sơ yếu lý lịch, ban cán sự, phân tổ và số điện thoại liên lạc phụ huynh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              exportStudentsToExcel(students, '9A2');
              showToast('Đã xuất file Excel danh sách học sinh Lớp 9A2!', 'success');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-all"
            title="Xuất danh sách học sinh ra file Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            id="btn-import-excel"
            onClick={() => setShowExcelModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold transition-all shadow-2xs"
            title="Nhập danh sách học sinh từ file Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-all"
            title="In danh sách lớp"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">In danh sách</span>
          </button>

          <button
            id="btn-add-student"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-blue-900">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            <strong>Dữ liệu mẫu:</strong> Danh sách bao gồm {students.length} học sinh mẫu mô phỏng lớp 9A2 (Trường THCS Phan Bội Châu). Thầy/Cô có thể chỉnh sửa, thêm mới hoặc xóa theo đúng sĩ số thực tế của lớp.
          </span>
        </div>
        <span className="shrink-0 ml-2 font-bold text-blue-700 hidden md:inline">Sĩ số: {students.length}</span>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, số ĐT hoặc ghi chú..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterGender('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterGender === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả giới tính
            </button>
            <button
              onClick={() => setFilterGender('Nam')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterGender === 'Nam' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Nam ({students.filter((s) => s.gender === 'Nam').length})
            </button>
            <button
              onClick={() => setFilterGender('Nữ')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterGender === 'Nữ' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Nữ ({students.filter((s) => s.gender === 'Nữ').length})
            </button>
          </div>

          {/* Group filter */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : (Number(e.target.value) as any))}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">Tất cả các tổ (1–4)</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500 text-white font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Đang chọn <strong className="text-white">{selectedIds.length}</strong> / {students.length} học sinh
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                exportStudentsToExcel(selectedStudents, '9A2_DaChon');
                showToast(`Đã xuất file Excel cho ${selectedStudents.length} học sinh được chọn!`, 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Excel ({selectedIds.length})</span>
            </button>

            <button
              id="btn-bulk-delete"
              onClick={() => setShowBatchDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-900/30 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedIds.length} học sinh đã chọn</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
              title="Bỏ chọn tất cả"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Modern Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-10">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="p-1 rounded-md text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                    title={allFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả trong danh sách'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : someFilteredSelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 text-center w-14">STT</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Giới tính</th>
                <th className="py-3.5 px-4">Ngày sinh</th>
                <th className="py-3.5 px-4">Tổ / Chức vụ</th>
                <th className="py-3.5 px-4">SĐT Phụ huynh</th>
                <th className="py-3.5 px-4">Ghi chú</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-blue-50/40'
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectStudent(student.id)}
                        className="p-1 rounded-md transition-colors inline-flex items-center justify-center text-slate-400 hover:text-blue-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                      {student.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {student.fullName}
                      </button>
                      {student.address && (
                        <span className="block text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                          {student.address}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-md font-semibold ${
                          student.gender === 'Nam'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {formatDateVi(student.dob)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          Tổ {student.groupNumber}
                        </span>
                        {student.role !== 'Thành viên' && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                            {student.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <a href={`tel:${student.parentPhone}`} className="hover:underline hover:text-blue-600">
                          {student.parentPhone}
                        </a>
                      </div>
                      {student.parentName && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          PH: {student.parentName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {student.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Hồ sơ học sinh</span>
                <h3 className="text-xl font-bold text-slate-900">{viewingStudent.fullName}</h3>
              </div>
              <span className="text-sm font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                STT: {viewingStudent.orderNumber}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-semibold text-slate-800">{viewingStudent.gender}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-semibold text-slate-800">{formatDateVi(viewingStudent.dob)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Tổ sinh hoạt:</span>
                <span className="font-semibold text-slate-800">Tổ {viewingStudent.groupNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Chức vụ trong lớp:</span>
                <span className="font-bold text-blue-600">{viewingStudent.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Số ĐT Phụ huynh:</span>
                <span className="font-semibold text-slate-800">{viewingStudent.parentPhone}</span>
              </div>
              {viewingStudent.parentName && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Họ tên Phụ huynh:</span>
                  <span className="font-semibold text-slate-800">{viewingStudent.parentName}</span>
                </div>
              )}
              {viewingStudent.address && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Địa chỉ cư trú:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-xs">{viewingStudent.address}</span>
                </div>
              )}
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Đặc điểm / Ghi chú của GVCN:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 text-xs leading-relaxed">
                  {viewingStudent.notes || 'Chưa có ghi chú đặc biệt.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Single Student) */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Xác nhận xóa học sinh
            </h3>

            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa học sinh{' '}
              <strong className="text-rose-600 font-bold">{deletingStudent.fullName}</strong> (STT{' '}
              {deletingStudent.orderNumber}) khỏi danh sách lớp 9A2 không?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/25 transition-all"
              >
                Xóa học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
              Xác nhận xóa hàng loạt học sinh
            </h3>

            <p className="text-sm text-slate-600 text-center leading-relaxed mb-4">
              Thầy/Cô có chắc chắn muốn xóa <strong className="text-rose-600 font-bold">{selectedIds.length}</strong> học sinh đã chọn khỏi danh sách lớp 9A2 không?
            </p>

            {/* List preview of selected students */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 max-h-48 overflow-y-auto mb-5 space-y-1.5 divide-y divide-slate-100">
              {selectedStudents.map((s) => (
                <div key={s.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-slate-400 font-bold text-center">{s.orderNumber}.</span>
                    <span className="font-semibold text-slate-900">{s.fullName}</span>
                    <span className="text-[11px] text-slate-400">({s.gender})</span>
                  </div>
                  <span className="text-slate-500 font-medium">Tổ {s.groupNumber}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-6 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Hệ thống sẽ tự động cập nhật lại số thứ tự (STT) cho các học sinh còn lại trong danh sách sau khi xóa.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-batch-delete"
                onClick={confirmBatchDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/30 transition-all"
              >
                Xác nhận xóa {selectedIds.length} em
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới vào lớp 9A2'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập đầy đủ thông tin để phục vụ công tác liên lạc và quản lý nề nếp
            </p>

            {/* Toggle tabs for Add Student */}
            {!editingStudent && (
              <div className="mb-4">
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-3">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Thêm từng em (Thủ công)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowExcelModal(true);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Nhập bằng file Excel
                  </button>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thầy/Cô có file Excel sĩ số?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowExcelModal(true);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors shrink-0"
                  >
                    Mở Nhập Excel &rarr;
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={editingStudent ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Group & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tổ sinh hoạt
                  </label>
                  <select
                    value={formGroupNumber}
                    onChange={(e) => setFormGroupNumber(Number(e.target.value) as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chức vụ
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Thành viên">Học sinh / Thành viên</option>
                    <option value="Lớp trưởng">Lớp trưởng</option>
                    <option value="Lớp phó">Lớp phó</option>
                    <option value="Bí thư">Bí thư Chi đội</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                  </select>
                </div>
              </div>

              {/* Parent Phone & Parent Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SĐT Phụ huynh *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Họ tên Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    placeholder="Bố/Mẹ học sinh..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú của GVCN
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Đặc điểm tính cách, học lực, năng khiếu hoặc vấn đề sức khỏe..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25 transition-all"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        currentCount={students.length}
        onImportSuccess={onBatchAddStudents}
        showToast={showToast}
      />
    </div>
  );
};
