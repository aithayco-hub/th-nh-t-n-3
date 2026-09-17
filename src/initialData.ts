import {
  Student,
  DailyAttendance,
  ConductRecord,
  FinanceRecord,
  ContactRecord,
  RewardDisciplineRecord,
  ScheduleEvent,
  ClassMetadata,
} from './types';

export const INITIAL_METADATA: ClassMetadata = {
  schoolName: 'THCS Phan Bội Châu',
  className: 'Lớp 9A2',
  teacherName: 'Dương Thành Tín',
  headTeacher: 'Dương Thành Tín',
  academicYear: '2026–2027',
};

export const INITIAL_STUDENTS: Student[] = [
  { id: 'hs-01', orderNumber: 1, fullName: 'Nguyễn Hoàng An', gender: 'Nam', dob: '2012-03-15', parentPhone: '0912345678', parentName: 'Nguyễn Văn Hùng', role: 'Lớp trưởng', groupNumber: 1, address: 'Số 12 đường Trần Phú, P. Tân An', notes: 'Gương mẫu, học lực xuất sắc' },
  { id: 'hs-02', orderNumber: 2, fullName: 'Trần Thị Mai Anh', gender: 'Nữ', dob: '2012-05-20', parentPhone: '0983112233', parentName: 'Trần Văn Bình', role: 'Lớp phó', groupNumber: 1, address: '28 Lê Lợi, P. 2', notes: 'Phụ trách học tập, nhiệt tình' },
  { id: 'hs-03', orderNumber: 3, fullName: 'Lê Minh Bảo', gender: 'Nam', dob: '2012-01-10', parentPhone: '0905443322', parentName: 'Lê Quốc Tuấn', role: 'Bí thư', groupNumber: 1, address: '45 Quang Trung', notes: 'Năng động trong phong trào Đoàn Đội' },
  { id: 'hs-04', orderNumber: 4, fullName: 'Phạm Ngọc Bích', gender: 'Nữ', dob: '2012-08-14', parentPhone: '0976554433', parentName: 'Phạm Thị Thảo', role: 'Tổ trưởng', groupNumber: 1, address: '89 Hai Bà Trưng', notes: 'Tổ trưởng Tổ 1' },
  { id: 'hs-05', orderNumber: 5, fullName: 'Đỗ Tiến Cường', gender: 'Nam', dob: '2012-11-02', parentPhone: '0934112255', parentName: 'Đỗ Văn Cảnh', role: 'Thành viên', groupNumber: 1, address: '15 Nguyễn Trãi', notes: 'Chăm chỉ, trầm tính' },
  { id: 'hs-06', orderNumber: 6, fullName: 'Võ Thùy Dung', gender: 'Nữ', dob: '2012-07-09', parentPhone: '0918776655', parentName: 'Võ Ngọc Long', role: 'Thành viên', groupNumber: 1, address: '102 Phan Châu Trinh', notes: 'Hát hay, tích cực văn nghệ' },
  { id: 'hs-07', orderNumber: 7, fullName: 'Bùi Đức Duy', gender: 'Nam', dob: '2012-09-18', parentPhone: '0989223344', parentName: 'Bùi Minh Trí', role: 'Thành viên', groupNumber: 1, address: '76 Đinh Tiên Hoàng', notes: 'Cần chú ý bài tập môn Tiếng Anh' },
  { id: 'hs-08', orderNumber: 8, fullName: 'Đặng Thanh Hà', gender: 'Nữ', dob: '2012-02-28', parentPhone: '0943889900', parentName: 'Đặng Quốc Huy', role: 'Thành viên', groupNumber: 1, address: '12 Lý Tự Trọng', notes: 'Cẩn thận, chữ viết đẹp' },
  { id: 'hs-09', orderNumber: 9, fullName: 'Hoàng Quốc Hải', gender: 'Nam', dob: '2012-04-12', parentPhone: '0908771122', parentName: 'Hoàng Văn Sơn', role: 'Thành viên', groupNumber: 1, address: '34 Lê Duẩn', notes: 'Giỏi Toán và Tin học' },
  { id: 'hs-10', orderNumber: 10, fullName: 'Dương Khánh Hân', gender: 'Nữ', dob: '2012-12-05', parentPhone: '0915663344', parentName: 'Dương Minh Khang', role: 'Thành viên', groupNumber: 1, address: '56 Phan Đăng Lưu', notes: 'Lễ phép, hòa đồng' },
  
  { id: 'hs-11', orderNumber: 11, fullName: 'Phan Gia Huy', gender: 'Nam', dob: '2012-06-25', parentPhone: '0967332211', parentName: 'Phan Văn Phú', role: 'Tổ trưởng', groupNumber: 2, address: '68 Hoàng Hoa Thám', notes: 'Tổ trưởng Tổ 2' },
  { id: 'hs-12', orderNumber: 12, fullName: 'Lý Kim Huệ', gender: 'Nữ', dob: '2012-10-30', parentPhone: '0938445566', parentName: 'Lý Kiến Thành', role: 'Thành viên', groupNumber: 2, address: '19 Nguyễn Thị Minh Khai', notes: 'Ngoan ngoãn, tiến bộ nhanh' },
  { id: 'hs-13', orderNumber: 13, fullName: 'Trịnh Hữu Khang', gender: 'Nam', dob: '2012-04-03', parentPhone: '0981992288', parentName: 'Trịnh Văn Đức', role: 'Thành viên', groupNumber: 2, address: '90 Cách Mạng Tháng 8', notes: 'Đội tuyển Cầu lông trường' },
  { id: 'hs-14', orderNumber: 14, fullName: 'Ngô Thảo Linh', gender: 'Nữ', dob: '2012-08-22', parentPhone: '0947228811', parentName: 'Ngô Văn Nam', role: 'Thành viên', groupNumber: 2, address: '31 Lê Hồng Phong', notes: 'Học đều các môn' },
  { id: 'hs-15', orderNumber: 15, fullName: 'Vũ Đức Long', gender: 'Nam', dob: '2012-03-08', parentPhone: '0903119944', parentName: 'Vũ Hoàng Quân', role: 'Thành viên', groupNumber: 2, address: '52 Điện Biên Phủ', notes: 'Đôi lúc còn mất tập trung' },
  { id: 'hs-16', orderNumber: 16, fullName: 'Nguyễn Trúc Ly', gender: 'Nữ', dob: '2012-07-16', parentPhone: '0919001122', parentName: 'Nguyễn Thị Oanh', role: 'Thành viên', groupNumber: 2, address: '74 Ba Cu', notes: 'Yêu thích môn Ngữ văn' },
  { id: 'hs-17', orderNumber: 17, fullName: 'Hồ Tuấn Kiệt', gender: 'Nam', dob: '2012-05-11', parentPhone: '0975664422', parentName: 'Hồ Văn Lộc', role: 'Thành viên', groupNumber: 2, address: '11 Nguyễn Văn Trỗi', notes: 'Học sinh tiến bộ' },
  { id: 'hs-18', orderNumber: 18, fullName: 'Lê Ngọc Mỹ', gender: 'Nữ', dob: '2012-09-02', parentPhone: '0933557799', parentName: 'Lê Văn Hiền', role: 'Thành viên', groupNumber: 2, address: '23 Thống Nhất', notes: 'Nhiệt tình giúp đỡ bạn bè' },
  { id: 'hs-19', orderNumber: 19, fullName: 'Mai Hoàng Nam', gender: 'Nam', dob: '2012-11-20', parentPhone: '0982334466', parentName: 'Mai Đức Thịnh', role: 'Thành viên', groupNumber: 2, address: '48 Trương Công Định', notes: 'Hăng hái phát biểu' },
  { id: 'hs-20', orderNumber: 20, fullName: 'Đoàn Yến Nhi', gender: 'Nữ', dob: '2012-01-29', parentPhone: '0945778833', parentName: 'Đoàn Văn Tâm', role: 'Thành viên', groupNumber: 2, address: '85 Nguyễn Du', notes: 'Cần bồi dưỡng thêm môn Lý' },

  { id: 'hs-21', orderNumber: 21, fullName: 'Trương Tuấn Phong', gender: 'Nam', dob: '2012-02-14', parentPhone: '0909446688', parentName: 'Trương Hoài Nam', role: 'Tổ trưởng', groupNumber: 3, address: '109 Chu Văn An', notes: 'Tổ trưởng Tổ 3, tác phong nhanh nhẹn' },
  { id: 'hs-22', orderNumber: 22, fullName: 'Nguyễn Như Quỳnh', gender: 'Nữ', dob: '2012-06-18', parentPhone: '0914887755', parentName: 'Nguyễn Văn Đạt', role: 'Thành viên', groupNumber: 3, address: '36 Lê Quý Đôn', notes: 'Thành viên đội cờ vua trường' },
  { id: 'hs-23', orderNumber: 23, fullName: 'Phạm Minh Quân', gender: 'Nam', dob: '2012-10-10', parentPhone: '0972115599', parentName: 'Phạm Bá Hưng', role: 'Thành viên', groupNumber: 3, address: '62 Phan Chu Trinh', notes: 'Yêu thích Khoa học Tự nhiên' },
  { id: 'hs-24', orderNumber: 24, fullName: 'Lâm Hải Quỳnh', gender: 'Nữ', dob: '2012-08-05', parentPhone: '0937661133', parentName: 'Lâm Văn Hoàng', role: 'Thành viên', groupNumber: 3, address: '95 Trần Hưng Đạo', notes: 'Trách nhiệm, vẽ đẹp' },
  { id: 'hs-25', orderNumber: 25, fullName: 'Đinh Quốc Sang', gender: 'Nam', dob: '2012-03-27', parentPhone: '0984227744', parentName: 'Đinh Văn Thắng', role: 'Thành viên', groupNumber: 3, address: '17 Võ Thị Sáu', notes: 'Hay giúp giáo viên chuẩn bị máy chiếu' },
  { id: 'hs-26', orderNumber: 26, fullName: 'Tạ Minh Thư', gender: 'Nữ', dob: '2012-07-24', parentPhone: '0946338822', parentName: 'Tạ Quang Khải', role: 'Thành viên', groupNumber: 3, address: '41 Hoàng Diệu', notes: 'Chăm học, điểm số ổn định' },
  { id: 'hs-27', orderNumber: 27, fullName: 'Ngô Việt Thắng', gender: 'Nam', dob: '2012-12-15', parentPhone: '0901554477', parentName: 'Ngô Xuân Dũng', role: 'Thành viên', groupNumber: 3, address: '88 Nguyễn Hữu Cảnh', notes: 'Thành viên đội bóng đá lớp' },
  { id: 'hs-28', orderNumber: 28, fullName: 'Lê Phương Thảo', gender: 'Nữ', dob: '2012-04-19', parentPhone: '0916449933', parentName: 'Lê Thành Đô', role: 'Thành viên', groupNumber: 3, address: '26 Huỳnh Thúc Kháng', notes: 'Học lực Khá - Giỏi' },
  { id: 'hs-29', orderNumber: 29, fullName: 'Võ Thành Trung', gender: 'Nam', dob: '2012-09-30', parentPhone: '0978991155', parentName: 'Võ Quốc Huy', role: 'Thành viên', groupNumber: 3, address: '53 Pasteur', notes: 'Hòa nhã với bạn cùng bàn' },
  { id: 'hs-30', orderNumber: 30, fullName: 'Phan Thùy Trang', gender: 'Nữ', dob: '2012-11-08', parentPhone: '0939226688', parentName: 'Phan Thị Diệu', role: 'Thành viên', groupNumber: 3, address: '70 Nguyễn Thái Học', notes: 'Thủ quỹ lớp 9A2' },

  { id: 'hs-31', orderNumber: 31, fullName: 'Huỳnh Gia Tuấn', gender: 'Nam', dob: '2012-01-22', parentPhone: '0985116644', parentName: 'Huỳnh Văn Toàn', role: 'Tổ trưởng', groupNumber: 4, address: '14 Bến Vân Đồn', notes: 'Tổ trưởng Tổ 4, gương mẫu' },
  { id: 'hs-32', orderNumber: 32, fullName: 'Nguyễn Ngọc Uyên', gender: 'Nữ', dob: '2012-05-04', parentPhone: '0948337722', parentName: 'Nguyễn Tấn Tài', role: 'Thành viên', groupNumber: 4, address: '39 Nguyễn Bỉnh Khiêm', notes: 'Có khiếu viết văn nghị luận' },
  { id: 'hs-33', orderNumber: 33, fullName: 'Trần Đình Vinh', gender: 'Nam', dob: '2012-08-17', parentPhone: '0902663399', parentName: 'Trần Văn Kiên', role: 'Thành viên', groupNumber: 4, address: '81 Nam Kỳ Khởi Nghĩa', notes: 'Cần rèn thêm tính cẩn thận trong trình bày' },
  { id: 'hs-34', orderNumber: 34, fullName: 'Dương Cẩm Vân', gender: 'Nữ', dob: '2012-10-14', parentPhone: '0913775588', parentName: 'Dương Quốc Bảo', role: 'Thành viên', groupNumber: 4, address: '22 Ngô Quyền', notes: 'Trầm tĩnh, học tập rất tốt' },
  { id: 'hs-35', orderNumber: 35, fullName: 'Vũ Hạo Vũ', gender: 'Nam', dob: '2012-03-01', parentPhone: '0971224466', parentName: 'Vũ Hải Đăng', role: 'Thành viên', groupNumber: 4, address: '67 Lê Thánh Tôn', notes: 'Thành viên ban nề nếp' },
  { id: 'hs-36', orderNumber: 36, fullName: 'Phạm Tường Vy', gender: 'Nữ', dob: '2012-06-07', parentPhone: '0932884411', parentName: 'Phạm Thị Lan', role: 'Thành viên', groupNumber: 4, address: '93 Lý Thường Kiệt', notes: 'Năng nổ tham gia hoạt động lớp' },
  { id: 'hs-37', orderNumber: 37, fullName: 'Bùi Quốc Việt', gender: 'Nam', dob: '2012-12-28', parentPhone: '0987552233', parentName: 'Bùi Hoàng Hiệp', role: 'Thành viên', groupNumber: 4, address: '18 Hai Bà Trưng', notes: 'Có năng khiếu Tiếng Anh' },
  { id: 'hs-38', orderNumber: 38, fullName: 'Đặng Ngọc Xuân', gender: 'Nữ', dob: '2012-02-09', parentPhone: '0941995577', parentName: 'Đặng Quốc An', role: 'Thành viên', groupNumber: 4, address: '49 Trần Quốc Toản', notes: 'Chăm chỉ trực nhật' },
  { id: 'hs-39', orderNumber: 39, fullName: 'Lê Duy Khang', gender: 'Nam', dob: '2012-07-31', parentPhone: '0904338866', parentName: 'Lê Văn Trọng', role: 'Thành viên', groupNumber: 4, address: '77 Hàm Nghi', notes: 'Tiến bộ vượt bậc môn Hóa học' },
  { id: 'hs-40', orderNumber: 40, fullName: 'Nguyễn Thảo Yên', gender: 'Nữ', dob: '2012-09-12', parentPhone: '0917669944', parentName: 'Nguyễn Văn Minh', role: 'Thành viên', groupNumber: 4, address: '30 Pasteur', notes: 'Chăm chỉ, tích cực trong giờ học' },
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_ATTENDANCE: DailyAttendance = {
  date: getTodayDateString(),
  records: {
    'hs-01': { status: 'present' },
    'hs-02': { status: 'present' },
    'hs-03': { status: 'present' },
    'hs-04': { status: 'present' },
    'hs-05': { status: 'present' },
    'hs-06': { status: 'present' },
    'hs-07': { status: 'late', note: 'Đi trễ 10 phút do hỏng xe đạp' },
    'hs-08': { status: 'present' },
    'hs-09': { status: 'present' },
    'hs-10': { status: 'present' },
    'hs-11': { status: 'present' },
    'hs-12': { status: 'present' },
    'hs-13': { status: 'present' },
    'hs-14': { status: 'present' },
    'hs-15': { status: 'excused', note: 'Phụ huynh xin phép đi khám mắt' },
    'hs-16': { status: 'present' },
    'hs-17': { status: 'present' },
    'hs-18': { status: 'present' },
    'hs-19': { status: 'present' },
    'hs-20': { status: 'present' },
    'hs-21': { status: 'present' },
    'hs-22': { status: 'present' },
    'hs-23': { status: 'present' },
    'hs-24': { status: 'present' },
    'hs-25': { status: 'present' },
    'hs-26': { status: 'present' },
    'hs-27': { status: 'present' },
    'hs-28': { status: 'present' },
    'hs-29': { status: 'present' },
    'hs-30': { status: 'present' },
    'hs-31': { status: 'present' },
    'hs-32': { status: 'present' },
    'hs-33': { status: 'present' },
    'hs-34': { status: 'present' },
    'hs-35': { status: 'present' },
    'hs-36': { status: 'present' },
    'hs-37': { status: 'present' },
    'hs-38': { status: 'present' },
    'hs-39': { status: 'present' },
    'hs-40': { status: 'present' },
  },
};

export const INITIAL_CONDUCT: ConductRecord[] = [
  { id: 'cd-1', studentId: 'hs-01', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Tốt', feedback: 'Tác phong chỉ huy lớp xuất sắc, nhắc nhở các bạn học tập tốt.', createdDate: '2026-09-15' },
  { id: 'cd-2', studentId: 'hs-02', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Tốt', feedback: 'Theo dõi sổ đầu bài chu đáo, giúp đỡ các bạn học yếu.', createdDate: '2026-09-15' },
  { id: 'cd-3', studentId: 'hs-07', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Khá', feedback: 'Có tiến bộ trong nề nếp, cần chú ý đi học đúng giờ hơn.', createdDate: '2026-09-15' },
  { id: 'cd-4', studentId: 'hs-15', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Khá', feedback: 'Đôi lúc còn nói chuyện riêng trong giờ Sinh học.', createdDate: '2026-09-15' },
  { id: 'cd-5', studentId: 'hs-21', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Tốt', feedback: 'Tổ 3 duy trì thi đua đứng đầu lớp.', createdDate: '2026-09-15' },
  { id: 'cd-6', studentId: 'hs-30', periodType: 'Tháng', periodValue: 'Tháng 9', rank: 'Tốt', feedback: 'Quản lý quỹ lớp minh bạch, báo cáo đầy đủ.', createdDate: '2026-09-15' },
];

export const INITIAL_FINANCE: FinanceRecord[] = [
  { id: 'fn-1', type: 'thu', title: 'Thu quỹ lớp Học kỳ I (40 học sinh x 150.000đ)', amount: 6000000, date: '2026-09-05', category: 'Quỹ lớp', notes: 'Ban đại diện cha mẹ học sinh thống nhất đầu năm', payerOrReceiver: 'Học sinh lớp 9A2' },
  { id: 'fn-2', type: 'chi', title: 'Mua dụng cụ vệ sinh lớp (chổi, sọt rác, nước lau sàn)', amount: 320000, date: '2026-09-07', category: 'Vật tư lớp', notes: 'Mua tại Siêu thị CoopMart', payerOrReceiver: 'Ban cán sự lớp' },
  { id: 'fn-3', type: 'chi', title: 'Photo tài liệu ôn tập và phiếu rèn luyện nề nếp tháng 9', amount: 280000, date: '2026-09-10', category: 'Học tập', notes: 'In ấn tại tiệm photo cổng trường', payerOrReceiver: 'Cửa hàng photo Minh Khang' },
  { id: 'fn-4', type: 'chi', title: 'Mua bình nước khoáng 20L dự trữ (4 bình)', amount: 160000, date: '2026-09-12', category: 'Nước uống', notes: 'Nước uống Lavie cho học sinh', payerOrReceiver: 'Đại lý nước tinh khiết' },
  { id: 'fn-5', type: 'chi', title: 'Phần thưởng động viên học sinh đạt điểm 10 tuần 1, 2', amount: 450000, date: '2026-09-14', category: 'Khen thưởng', notes: 'Mua 15 cuốn vở và bút bi thưởng', payerOrReceiver: 'Nhà sách Phương Nam' },
];

export const INITIAL_CONTACTS: ContactRecord[] = [
  { id: 'ct-1', studentId: 'hs-07', date: '2026-09-14', content: 'Trao đổi về tình hình đi học trễ 2 lần trong tuần và nhắc nhở bài tập về nhà môn Tiếng Anh.', parentFeedback: 'Phụ huynh ghi nhận, cam kết đôn đốc con thức dậy sớm và kiểm tra góc học tập.', status: 'resolved', notes: 'Đã gọi điện trực tiếp' },
  { id: 'ct-2', studentId: 'hs-15', date: '2026-09-15', content: 'Thông báo kết quả kiểm tra 15 phút môn Toán và lưu ý sự tập trung trong giờ học.', parentFeedback: 'Phụ huynh cảm ơn thầy và xin phối hợp kèm con buổi tối.', status: 'resolved', notes: 'Nhắn tin qua Zalo' },
  { id: 'ct-3', studentId: 'hs-20', date: '2026-09-16', content: 'Hẹn phụ huynh trao đổi về kế hoạch bồi dưỡng thêm môn Vật lý chuẩn bị thi giữa kỳ.', parentFeedback: '', status: 'pending', notes: 'Cần gọi lại vào tối nay' },
];

export const INITIAL_AWARDS: RewardDisciplineRecord[] = [
  { id: 'aw-1', type: 'reward', studentId: 'hs-01', title: 'Đạt điểm 10 môn Toán khảo sát đầu năm', date: '2026-09-08', content: 'Làm bài nhanh nhất lớp, trình bày khoa học và chính xác.', points: 10, notes: 'Được tuyên dương trước lớp' },
  { id: 'aw-2', type: 'reward', studentId: 'hs-02', title: 'Tích cực phụ đạo bài cho bạn yếu', date: '2026-09-11', content: 'Tận tình hướng dẫn bạn Đỗ Tiến Cường hoàn thành bài tập Sinh học.', points: 5, notes: 'Cộng điểm phong trào' },
  { id: 'aw-3', type: 'discipline', studentId: 'hs-07', title: 'Đi học muộn', date: '2026-09-16', content: 'Vào lớp trễ 10 phút sau hiệu lệnh trống.', points: -2, notes: 'Đã ghi nhận vào sổ theo dõi nề nếp' },
  { id: 'aw-4', type: 'discipline', studentId: 'hs-15', title: 'Không thuộc bài cũ môn Lịch sử', date: '2026-09-12', content: 'Chưa soạn bài câu hỏi chuẩn bị ở nhà.', points: -3, notes: 'Yêu cầu viết bù và nộp lại' },
];

export const INITIAL_SCHEDULE: ScheduleEvent[] = [
  { id: 'sc-1', title: 'Sinh hoạt chủ nhiệm: Phổ biến nội quy và chia nhóm học tập', category: 'Chủ nhiệm', date: '2026-09-19', time: '07:30 - 08:15', location: 'Phòng học 9A2', content: 'Nhắc nhở nề nếp đồng phục, bình bầu học sinh tiêu biểu tuần 2.', completed: false },
  { id: 'sc-2', title: 'Họp Phụ huynh học sinh đầu năm học 2026–2027', category: 'Họp phụ huynh', date: '2026-09-20', time: '08:00 - 10:30', location: 'Phòng học 9A2 (Tầng 2)', content: 'Báo cáo phương hướng năm học, bầu Ban đại diện CMHS lớp, thông qua các khoản thu theo quy định.', completed: false },
  { id: 'sc-3', title: 'Kiểm tra khảo sát chất lượng giữa kỳ I môn Toán & Ngữ văn', category: 'Kiểm tra', date: '2026-10-15', time: 'Buổi sáng', location: 'Theo phân phòng thi trường', content: 'Ôn tập chương 1 Đại số và phần Văn học hiện đại.', completed: false },
  { id: 'sc-4', title: 'Hội thi Chào mừng ngày Nhà giáo Việt Nam 20/11', category: 'Ngoại khóa', date: '2026-11-18', time: '14:00 - 17:00', location: 'Sân trường THCS Phan Bội Châu', content: 'Lớp 9A2 đăng ký tiết mục kịch múa và báo tường.', completed: false },
];
