import React from 'react';
import { School, User, GraduationCap, Calendar, Users, MapPin, X, Award } from 'lucide-react';
import { ClassMetadata, Student } from '../types';

interface ClassInfoModalProps {
  metadata?: ClassMetadata;
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
}

export const ClassInfoModal: React.FC<ClassInfoModalProps> = ({
  metadata,
  students,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const safeMetadata: ClassMetadata = {
    schoolName: metadata?.schoolName || 'THCS Phan Bội Châu',
    className: metadata?.className || 'Lớp 9A2',
    teacherName: metadata?.teacherName || 'Dương Thành Tín',
    headTeacher: metadata?.headTeacher || 'Dương Thành Tín',
    academicYear: metadata?.academicYear || '2026–2027',
  };

  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  const classOfficers = students.filter((s) => s.role !== 'Thành viên');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Thông tin hồ sơ Lớp 9A2</h3>
              <p className="text-xs text-slate-500">{safeMetadata.schoolName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Main info card */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex justify-between items-center text-xs text-blue-800">
              <span className="font-medium">Đơn vị:</span>
              <strong className="font-bold">{safeMetadata.schoolName}</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-blue-800">
              <span className="font-medium">Lớp:</span>
              <strong className="font-bold">{safeMetadata.className} (Khối 9 THCS)</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-blue-800">
              <span className="font-medium">Giáo viên chủ nhiệm:</span>
              <strong className="font-bold">{safeMetadata.headTeacher}</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-blue-800">
              <span className="font-medium">Năm học:</span>
              <strong className="font-bold">{safeMetadata.academicYear}</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-blue-800">
              <span className="font-medium">Sĩ số:</span>
              <strong className="font-bold">{students.length} học sinh ({maleCount} Nam / {femaleCount} Nữ)</strong>
            </div>
          </div>

          {/* Ban cán sự */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Ban cán sự lớp 9A2</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classOfficers.map((officer) => (
                <div
                  key={officer.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{officer.fullName}</span>
                    <span className="text-[11px] text-blue-600 font-semibold">{officer.role}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Tổ {officer.groupNumber}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sơ đồ phòng học */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Vị trí phòng học:</span>
            Phòng 204 - Dãy nhà B (Tầng 2), Trường THCS Phan Bội Châu.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all"
          >
            Đóng thông tin
          </button>
        </div>
      </div>
    </div>
  );
};
