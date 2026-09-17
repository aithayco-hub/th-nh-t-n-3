import React from 'react';
import {
  ClipboardCheck,
  Wallet,
  UserCheck2,
  MessageSquare,
  Users,
  BarChart3,
  Award,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';
import {
  Student,
  DailyAttendance,
  AttendanceStatus,
  ConductRecord,
  FinanceRecord,
  ContactRecord,
  RewardDisciplineRecord,
  ScheduleEvent,
  ActiveScreen
} from '../types';
import { formatCurrency } from '../utils/storage';

interface DashboardViewProps {
  students: Student[];
  todayAttendance?: DailyAttendance;
  conductList: ConductRecord[];
  financeList: FinanceRecord[];
  contactsList: ContactRecord[];
  awardsList: RewardDisciplineRecord[];
  scheduleList: ScheduleEvent[];
  onNavigate: (screen: ActiveScreen) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  todayAttendance,
  conductList,
  financeList,
  contactsList,
  awardsList,
  scheduleList,
  onNavigate,
}) => {
  // Compute Mini-Card Stats
  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let lateCount = 0;

  if (todayAttendance && todayAttendance.records) {
    (Object.values(todayAttendance.records) as Array<{ status: AttendanceStatus; note?: string }>).forEach((r) => {
      if (r.status === 'present') presentCount++;
      if (r.status === 'excused') excusedCount++;
      if (r.status === 'unexcused') unexcusedCount++;
      if (r.status === 'late') lateCount++;
    });
  } else {
    presentCount = totalStudents;
  }

  const totalRewards = awardsList.filter((a) => a.type === 'reward').length;
  const totalViolations = awardsList.filter((a) => a.type === 'discipline').length;
  const pendingContacts = contactsList.filter((c) => c.status === 'pending').length;

  // Need attention count = unexcused absences today + late today + pending parent contacts + violations
  const needAttentionCount = unexcusedCount + lateCount + pendingContacts + totalViolations;

  // Finance calculation
  const totalIncome = financeList
    .filter((f) => f.type === 'thu')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = financeList
    .filter((f) => f.type === 'chi')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Mini-Cards (Dashboard Trang chủ) */}
      <section aria-label="Thống kê nhanh">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Chỉ số tổng quan hôm nay</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Cập nhật theo thời gian thực</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Mini-Card 1: Tổng học sinh */}
          <div
            onClick={() => onNavigate('students')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng học sinh</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</span>
              <span className="text-xs text-slate-500">em</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
              <span>{maleCount} Nam</span>
              <span>•</span>
              <span>{femaleCount} Nữ</span>
            </div>
          </div>

          {/* Mini-Card 2: Chuyên cần hôm nay */}
          <div
            onClick={() => onNavigate('attendance')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chuyên cần hôm nay</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {presentCount}
                <span className="text-base font-medium text-slate-400">/{totalStudents}</span>
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {excusedCount > 0 && <span className="text-amber-600 font-medium">{excusedCount} phép </span>}
              {unexcusedCount > 0 && <span className="text-rose-600 font-medium">{unexcusedCount} k.phép </span>}
              {lateCount > 0 && <span className="text-indigo-600 font-medium">{lateCount} trễ</span>}
              {excusedCount === 0 && unexcusedCount === 0 && lateCount === 0 && (
                <span className="text-emerald-600 font-medium">100% đúng giờ</span>
              )}
            </div>
          </div>

          {/* Mini-Card 3: Khen thưởng */}
          <div
            onClick={() => onNavigate('awards')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Khen thưởng</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{totalRewards}</span>
              <span className="text-xs text-slate-500">lượt tuyên dương</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-700/80 font-medium truncate">
              Tích cực phong trào lớp
            </div>
          </div>

          {/* Mini-Card 4: Cần theo dõi */}
          <div
            onClick={() => onNavigate('contacts')}
            className="group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cần theo dõi</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{needAttentionCount}</span>
              <span className="text-xs text-slate-500">vấn đề</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-600 font-medium">
              {pendingContacts > 0 ? `${pendingContacts} cần gọi phụ huynh` : 'Nề nếp ổn định'}
            </div>
          </div>

          {/* Mini-Card 5: Số dư tài chính */}
          <div
            onClick={() => onNavigate('finance')}
            className="col-span-2 lg:col-span-1 group cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Số dư quỹ lớp</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-700">
                {formatCurrency(currentBalance)}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 truncate">
              Thu: {formatCurrency(totalIncome)}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CÁC CHỨC NĂNG CHÍNH (4 Large Cards according to prompt) */}
      <section aria-label="Chức năng chính">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chức năng quản lý chính</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Các công cụ thiết yếu dành cho giáo viên chủ nhiệm xử lý hằng ngày
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: 📋 ĐÁNH GIÁ HẠNH KIỂM */}
          <div className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {conductList.length} hồ sơ rèn luyện
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                📋 ĐÁNH GIÁ HẠNH KIỂM
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Theo dõi, nhận xét và tổng hợp đánh giá rèn luyện của học sinh theo tuần, tháng và học kỳ.
              </p>

              {/* Mini feature tags */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Chọn tuần/tháng</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Xếp loại Tốt/Khá/Đạt</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Lịch sử đánh giá</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Chuẩn Thông tư 22/BGDĐT</span>
              <button
                id="btn-open-conduct"
                onClick={() => onNavigate('conduct')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
              >
                <span>Mở</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: 💰 TÀI CHÍNH LỚP */}
          <div className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Wallet className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dư: {formatCurrency(currentBalance)}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                💰 TÀI CHÍNH LỚP
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Quản lý các khoản thu, chi và theo dõi tình hình tài chính của lớp minh bạch, rõ ràng.
              </p>

              {/* Mini feature tags */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Khoản thu/chi</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Tự động tính số dư</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Phiếu thu chi</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Thu: {formatCurrency(totalIncome)}</span>
              <button
                id="btn-open-finance"
                onClick={() => onNavigate('finance')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
              >
                <span>Mở</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: ✅ ĐIỂM DANH */}
          <div className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <UserCheck2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {presentCount}/{totalStudents} có mặt
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                ✅ ĐIỂM DANH
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Theo dõi chuyên cần, nghỉ học và tình hình đi học của học sinh chỉ với 1 chạm nhanh chóng.
              </p>

              {/* Mini feature tags */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">1 chạm điểm danh</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Nghỉ phép / Không phép</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Thống kê ngày</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Tự động lưu hằng ngày</span>
              <button
                id="btn-open-attendance"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all"
              >
                <span>Mở</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: 📨 SỔ LIÊN LẠC */}
          <div className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingContacts > 0 ? `${pendingContacts} cần xử lý` : 'Đã phản hồi hết'}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                📨 SỔ LIÊN LẠC
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Quản lý nhận xét, ghi chú và nội dung trao đổi với phụ huynh, gửi tin nhắn SMS/Zalo tiện lợi.
              </p>

              {/* Mini feature tags */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Trao đổi 2 chiều</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">Mẫu tin nhắn nhanh</span>
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">SĐT phụ huynh</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Kết nối gia đình & nhà trường</span>
              <button
                id="btn-open-contacts"
                onClick={() => onNavigate('contacts')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all"
              >
                <span>Mở</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CÁC CHỨC NĂNG BỔ SUNG (4 Complementary Cards) */}
      <section aria-label="Chức năng bổ sung">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chức năng mở rộng lớp 9A2</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Hồ sơ học sinh, báo cáo phân tích, phong trào thi đua và lịch công tác
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Sub Card 1: 👥 DANH SÁCH HỌC SINH */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                👥 DANH SÁCH HỌC SINH
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Hồ sơ chi tiết 40 học sinh: họ tên, ngày sinh, chức vụ, tổ, số điện thoại phụ huynh.
              </p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="mt-4 w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
            >
              <span>Quản lý hồ sơ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub Card 2: 📊 THỐNG KÊ LỚP */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                📊 THỐNG KÊ LỚP
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Biểu đồ tỉ lệ nam/nữ, chỉ số chuyên cần, cơ cấu tổ và phân bố rèn luyện học kỳ.
              </p>
            </div>
            <button
              onClick={() => onNavigate('stats')}
              className="mt-4 w-full py-2.5 px-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
            >
              <span>Xem thống kê</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub Card 3: 🏆 KHEN THƯỞNG – VI PHẠM */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-amber-300 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                🏆 KHEN THƯỞNG – VI PHẠM
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Ghi nhận hoa điểm 10, gương người tốt việc tốt và nhắc nhở vi phạm nề nếp thi đua.
              </p>
            </div>
            <button
              onClick={() => onNavigate('awards')}
              className="mt-4 w-full py-2.5 px-3 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sổ thi đua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub Card 4: 📅 LỊCH CÔNG TÁC */}
          <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 mb-3 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-600 transition-colors">
                📅 LỊCH CÔNG TÁC
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Kế hoạch họp phụ huynh, hoạt động ngoại khóa, đợt thi học kỳ và sinh hoạt chủ nhiệm.
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="mt-4 w-full py-2.5 px-3 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
            >
              <span>Xem lịch tuần</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Upcoming schedule glimpse & notice for teacher */}
      <section className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Nhắc việc chủ nhiệm tuần này:
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {scheduleList[0]?.title || 'Chuẩn bị nội dung sinh hoạt lớp cuối tuần.'}
              {scheduleList[0]?.time && ` (${scheduleList[0].time} ngày ${scheduleList[0].date})`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('schedule')}
          className="shrink-0 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-2xs hover:shadow-xs transition-all"
        >
          Xem toàn bộ lịch công tác &rarr;
        </button>
      </section>
    </div>
  );
};
