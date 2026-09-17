import React from 'react';
import { School, User, Calendar, ShieldCheck, Sparkles, MapPin, Clock } from 'lucide-react';
import { ClassMetadata } from '../types';

interface ClassHeaderProps {
  metadata?: ClassMetadata;
  totalStudents: number;
  onOpenStudents?: () => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({ metadata, totalStudents }) => {
  const safeMetadata: ClassMetadata = {
    schoolName: metadata?.schoolName || 'THCS Phan Bội Châu',
    className: metadata?.className || 'Lớp 9A2',
    teacherName: metadata?.teacherName || 'Dương Thành Tín',
    headTeacher: metadata?.headTeacher || 'Dương Thành Tín',
    academicYear: metadata?.academicYear || '2026–2027',
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-600/15 mb-8 border border-blue-500/30">
      {/* Decorative subtle background accents */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold tracking-wide uppercase mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống quản lý chủ nhiệm điện tử</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>{safeMetadata.className}</span>
            <span className="text-blue-200 text-2xl sm:text-3xl font-normal">—</span>
            <span className="text-xl sm:text-2xl font-medium text-blue-100">{safeMetadata.schoolName}</span>
          </h1>

          <p className="mt-2 text-blue-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            Bảng điều khiển công tác chủ nhiệm số hóa hằng ngày của thầy giáo <strong className="text-white font-semibold">{safeMetadata.teacherName}</strong>. Theo dõi chuyên cần, đánh giá nề nếp, quỹ lớp và liên lạc phụ huynh nhanh chóng.
          </p>
        </div>

        {/* Informative Badges */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <School className="w-4 h-4 text-blue-200" />
            <span>{safeMetadata.schoolName}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <User className="w-4 h-4 text-blue-200" />
            <span>GVCN: <strong>{safeMetadata.teacherName}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-semibold text-amber-200">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Năm học: {safeMetadata.academicYear}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-300/30 text-emerald-200 text-xs sm:text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Sĩ số: {totalStudents} học sinh</span>
          </div>
        </div>
      </div>

      {/* Classroom Quick Meta Strip */}
      <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-blue-100/80">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-200" />
          <span>Phòng học: P.204 (Khu A)</span>
        </div>
        <span className="hidden sm:inline text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-200" />
          <span>Ca học: Buổi Sáng (07:00 – 11:30)</span>
        </div>
        <span className="hidden sm:inline text-white/30">•</span>
        <div className="flex items-center gap-1.5 text-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Trạng thái: Hoạt động bình thường</span>
        </div>
      </div>
    </section>
  );
};
