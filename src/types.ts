export interface Student {
  id: string;
  orderNumber: number;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  parentPhone: string;
  parentName?: string;
  role: 'Lớp trưởng' | 'Lớp phó' | 'Bí thư' | 'Tổ trưởng' | 'Thành viên';
  groupNumber: 1 | 2 | 3 | 4;
  address?: string;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, { status: AttendanceStatus; note?: string }>;
  presentCount?: number;
  absentPermittedCount?: number;
  absentUnpermittedCount?: number;
  lateCount?: number;
}

export type ConductRank = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface ConductRecord {
  id: string;
  studentId: string;
  periodType: 'Tuần' | 'Tháng' | 'Học kỳ I' | 'Học kỳ II' | 'Cả năm';
  periodValue: string; // ví dụ "Tuần 3", "Tháng 10", "Học kỳ I"
  rank: ConductRank;
  feedback: string;
  createdDate: string;
}

export interface FinanceRecord {
  id: string;
  type: 'thu' | 'chi';
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  payerOrReceiver?: string;
}

export interface ContactRecord {
  id: string;
  studentId: string;
  date: string;
  content: string;
  parentFeedback?: string;
  status: 'pending' | 'resolved'; // Cần trao đổi / Đã trao đổi
  notes?: string;
}

export interface RewardDisciplineRecord {
  id: string;
  type: 'reward' | 'discipline'; // Khen thưởng / Vi phạm
  studentId: string;
  title: string;
  date: string;
  content: string;
  points?: number; // Điểm thi đua (+ hoặc -)
  notes?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  category: 'Họp lớp' | 'Họp phụ huynh' | 'Ngoại khóa' | 'Kiểm tra' | 'Chủ nhiệm' | 'Khác';
  date: string;
  time?: string;
  location?: string;
  content: string;
  completed?: boolean;
}

export interface ClassMetadata {
  schoolName: string;
  className: string;
  teacherName: string;
  headTeacher: string;
  academicYear: string;
}

export type ActiveScreen = 
  | 'home' 
  | 'students' 
  | 'conduct' 
  | 'finance' 
  | 'attendance' 
  | 'contacts' 
  | 'stats' 
  | 'awards' 
  | 'schedule';

export type ScreenType = ActiveScreen;
