import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle2,
  Award,
  AlertTriangle,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Student, DailyAttendance, ConductRecord, RewardDisciplineRecord } from '../types';

interface StatsViewProps {
  students: Student[];
  attendanceRecords: Record<string, DailyAttendance>;
  conductList: ConductRecord[];
  awardsList: RewardDisciplineRecord[];
  onBackToHome: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  students,
  attendanceRecords,
  conductList,
  awardsList,
  onBackToHome,
}) => {
  const total = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercent = total > 0 ? 100 - malePercent : 0;

  // Conduct rating distribution
  const countTot = conductList.filter((c) => c.rank === 'Tốt').length;
  const countKha = conductList.filter((c) => c.rank === 'Khá').length;
  const countDat = conductList.filter((c) => c.rank === 'Đạt').length;
  const countChuaDat = conductList.filter((c) => c.rank === 'Chưa đạt').length;
  const totalConduct = conductList.length || 1;

  // Group breakdown
  const groupStats = [1, 2, 3, 4].map((g) => {
    const list = students.filter((s) => s.groupNumber === g);
    return {
      group: g,
      total: list.length,
      males: list.filter((s) => s.gender === 'Nam').length,
      females: list.filter((s) => s.gender === 'Nữ').length,
      leader: list.find((s) => s.role === 'Tổ trưởng')?.fullName || 'Chưa phân công',
    };
  });

  // Rewards & Violations
  const totalRewards = awardsList.filter((a) => a.type === 'reward').length;
  const totalDiscipline = awardsList.filter((a) => a.type === 'discipline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-slate-600"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Báo cáo & Thống kê tổng hợp lớp 9A2</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích cơ cấu dân số học sinh, tình hình rèn luyện và nề nếp chuyên cần
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs sm:text-sm rounded-xl transition-all"
        >
          Xuất báo cáo PDF / In
        </button>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Giới tính & Cơ cấu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Cơ cấu giới tính</span>
            </h3>
            <span className="text-xs font-bold text-blue-600">Sĩ số: {total}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
              <span className="text-xs font-semibold text-blue-600">Học sinh Nam</span>
              <p className="text-3xl font-black text-blue-700 mt-1">{maleCount}</p>
              <span className="text-xs text-blue-500 font-medium">{malePercent}% sĩ số</span>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100">
              <span className="text-xs font-semibold text-rose-600">Học sinh Nữ</span>
              <p className="text-3xl font-black text-rose-700 mt-1">{femaleCount}</p>
              <span className="text-xs text-rose-500 font-medium">{femalePercent}% sĩ số</span>
            </div>
          </div>

          {/* Progress bar visual */}
          <div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${malePercent}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`Nam: ${malePercent}%`}
              />
              <div
                style={{ width: `${femalePercent}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Nữ: ${femalePercent}%`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
              <span className="text-blue-600 font-semibold">Nam: {maleCount} em ({malePercent}%)</span>
              <span className="text-rose-600 font-semibold">Nữ: {femaleCount} em ({femalePercent}%)</span>
            </div>
          </div>
        </div>

        {/* 2. Thống kê xếp loại rèn luyện */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Phân bố xếp loại rèn luyện</span>
            </h3>
            <span className="text-xs text-slate-500">{conductList.length} lượt</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="text-emerald-700">Tốt:</span>
                <span>{countTot} ({Math.round((countTot / totalConduct) * 100)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(countTot / totalConduct) * 100}%` }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="text-blue-700">Khá:</span>
                <span>{countKha} ({Math.round((countKha / totalConduct) * 100)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(countKha / totalConduct) * 100}%` }}
                  className="bg-blue-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="text-amber-700">Đạt:</span>
                <span>{countDat} ({Math.round((countDat / totalConduct) * 100)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(countDat / totalConduct) * 100}%` }}
                  className="bg-amber-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span className="text-rose-700">Chưa đạt:</span>
                <span>{countChuaDat} ({Math.round((countChuaDat / totalConduct) * 100)}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(countChuaDat / totalConduct) * 100}%` }}
                  className="bg-rose-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Phong trào thi đua */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Chỉ số thi đua & nề nếp</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Chi đội xuất sắc
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700">Lượt khen thưởng</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{totalRewards}</p>
              <span className="text-[11px] text-emerald-600">Hoa điểm 10 & Việc tốt</span>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
              <span className="text-xs font-semibold text-amber-800">Lượt vi phạm</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{totalDiscipline}</p>
              <span className="text-[11px] text-amber-600">Cần uốn nắn kịp thời</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            💡 <strong>Nhận định của GVCN:</strong> Tập thể 9A2 duy trì tốt nề nếp đồng phục, tự giác trong 15 phút đầu giờ. Cần tăng cường bồi dưỡng thêm cho các học sinh có học lực trung bình môn Khoa học tự nhiên.
          </div>
        </div>
      </div>

      {/* Group Details Cards */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Tình hình 4 Tổ thi đua lớp 9A2</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groupStats.map((item) => (
            <div
              key={item.group}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-base">Tổ {item.group}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-lg">
                  {item.total} học sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Tổ trưởng: <strong className="text-slate-800">{item.leader}</strong>
              </p>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span className="text-blue-600 font-medium">{item.males} Nam</span>
                <span>•</span>
                <span className="text-rose-600 font-medium">{item.females} Nữ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
