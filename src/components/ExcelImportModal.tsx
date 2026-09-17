import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  Users
} from 'lucide-react';
import { Student } from '../types';
import {
  parseStudentExcelFile,
  downloadStudentExcelTemplate,
  ParsedStudentRow,
} from '../utils/excelHelper';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  onImportSuccess: (students: Omit<Student, 'id' | 'orderNumber'>[], mode: 'append' | 'replace') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  onImportSuccess,
  showToast,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt) {
      setErrorMsg('Vui lòng chọn định dạng file Excel (.xlsx, .xls) hoặc file .csv');
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const rows = await parseStudentExcelFile(selectedFile);
      setParsedRows(rows);
      showToast(`Đã đọc ${rows.length} dòng dữ liệu từ file Excel!`, 'success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.');
      setParsedRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const resetUpload = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    const validStudents = parsedRows.filter((r) => r.isValid);
    if (validStudents.length === 0) {
      showToast('Không có học sinh hợp lệ nào để thêm vào danh sách!', 'error');
      return;
    }

    const studentsToImport: Omit<Student, 'id' | 'orderNumber'>[] = validStudents.map((r) => ({
      fullName: r.fullName,
      gender: r.gender,
      dob: r.dob,
      parentPhone: r.parentPhone,
      parentName: r.parentName,
      role: r.role,
      groupNumber: r.groupNumber,
      address: r.address,
      notes: r.notes,
    }));

    onImportSuccess(studentsToImport, importMode);
    showToast(
      importMode === 'append'
        ? `Đã thêm thành công ${studentsToImport.length} học sinh mới vào danh sách lớp!`
        : `Đã thay thế toàn bộ danh sách lớp với ${studentsToImport.length} học sinh mới!`,
      'success'
    );
    resetUpload();
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Nhập danh sách học sinh từ file Excel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tải lên danh sách học sinh từ file Excel (.xlsx, .xls) hoặc CSV để thêm nhanh vào lớp
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetUpload();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Instructions & Template Download */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-emerald-950">
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <FileText className="w-4 h-4 text-emerald-600" />
                Quy cách các cột chuẩn trong file Excel:
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                STT | <strong>Họ và tên</strong> (bắt buộc) | Giới tính (Nam/Nữ) | Ngày sinh (DD/MM/YYYY) | <strong>SĐT phụ huynh</strong> (bắt buộc) | Tên phụ huynh | Tổ (1-4) | Chức vụ | Địa chỉ | Ghi chú
              </p>
            </div>
            <button
              type="button"
              onClick={downloadStudentExcelTemplate}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-3xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">
                Kéo & thả file Excel danh sách học sinh vào đây
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Hoặc bấm vào để chọn file từ máy tính (Hỗ trợ định dạng: .xlsx, .xls, .csv)
              </p>
              <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50">
                Chọn file từ thiết bị
              </span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Đang đọc và phân tích dữ liệu file Excel...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Không thể nhập dữ liệu</p>
                <p className="mt-0.5">{errorMsg}</p>
                <button
                  type="button"
                  onClick={resetUpload}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Chọn file khác
                </button>
              </div>
            </div>
          )}

          {/* Preview Parsed Data */}
          {file && !isLoading && parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* File details & Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-2xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • Tìm thấy {parsedRows.length} học sinh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validCount} hợp lệ
                  </span>
                  {invalidCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {invalidCount} thiếu thông tin
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="ml-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition-colors"
                  >
                    Đổi file
                  </button>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Tùy chọn ghi vào danh sách lớp:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'bg-white border-blue-500 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Thêm tiếp vào danh sách ({currentCount} học sinh hiện có)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Giữ nguyên các học sinh đã có và thêm các em mới vào sau cùng.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-rose-50/60 border-rose-500 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Thay thế toàn bộ danh sách lớp
                      </p>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        Xóa danh sách cũ và thiết lập lại danh sách lớp từ file Excel này.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>BẢNG XEM TRƯỚC DỮ LIỆU ({parsedRows.length} HỌC SINH)</span>
                  <span className="text-slate-500 font-normal">Cuộn để xem thêm các cột</span>
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">STT</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Giới tính</th>
                        <th className="py-2.5 px-3">Ngày sinh</th>
                        <th className="py-2.5 px-3">SĐT Phụ huynh</th>
                        <th className="py-2.5 px-3">Tổ</th>
                        <th className="py-2.5 px-3">Chức vụ</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row.isValid ? 'hover:bg-slate-50/70' : 'bg-rose-50/50 hover:bg-rose-50'}
                        >
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.fullName}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-2xs ${
                                row.gender === 'Nam'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.gender}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono">
                            {row.dob.split('-').reverse().join('/')}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {row.parentPhone || (
                              <span className="text-rose-500 italic">Chưa có</span>
                            )}
                          </td>
                          <td className="py-2 px-3">Tổ {row.groupNumber}</td>
                          <td className="py-2 px-3">{row.role}</td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-2xs">
                                <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-rose-600 font-bold text-2xs"
                                title={row.errors.join(', ')}
                              >
                                <AlertTriangle className="w-3 h-3" /> {row.errors.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              resetUpload();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all"
          >
            Đóng
          </button>

          {file && !isLoading && parsedRows.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>
                Lưu {validCount} học sinh vào lớp {importMode === 'append' ? '(Thêm mới)' : '(Thay thế)'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
