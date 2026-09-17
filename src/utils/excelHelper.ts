import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ParsedStudentRow {
  orderNumber?: number;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string; // YYYY-MM-DD
  parentPhone: string;
  parentName?: string;
  role: Student['role'];
  groupNumber: 1 | 2 | 3 | 4;
  address?: string;
  notes?: string;
  isValid: boolean;
  errors: string[];
}

// Convert common date formats or Excel numeric date into YYYY-MM-DD
export function normalizeDate(value: any): string {
  if (value === undefined || value === null || value === '') {
    return '2012-01-01';
  }

  // If it's an Excel serial date number (e.g. 40909)
  if (typeof value === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(value);
    if (dateObj) {
      const y = dateObj.y;
      const m = String(dateObj.m).padStart(2, '0');
      const d = String(dateObj.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(value).trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Try standard JS Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '2012-01-01';
}

// Normalize gender to 'Nam' | 'Nữ'
export function normalizeGender(val: any): 'Nam' | 'Nữ' {
  if (!val) return 'Nam';
  const str = String(val).trim().toLowerCase();
  if (str === 'nữ' || str === 'nu' || str === 'female' || str === 'f' || str === 'gái') {
    return 'Nữ';
  }
  return 'Nam';
}

// Normalize group (1-4)
export function normalizeGroup(val: any): 1 | 2 | 3 | 4 {
  if (!val) return 1;
  const str = String(val).replace(/[^0-9]/g, '');
  const num = parseInt(str, 10);
  if (num === 1 || num === 2 || num === 3 || num === 4) {
    return num;
  }
  return 1;
}

// Normalize role
export function normalizeRole(val: any): Student['role'] {
  if (!val) return 'Thành viên';
  const str = String(val).trim().toLowerCase();
  if (str.includes('lớp trưởng') || str === 'lt') return 'Lớp trưởng';
  if (str.includes('lớp phó') || str === 'lp') return 'Lớp phó';
  if (str.includes('bí thư') || str.includes('bi thu')) return 'Bí thư';
  if (str.includes('tổ trưởng') || str.includes('to truong')) return 'Tổ trưởng';
  return 'Thành viên';
}

// Clean phone string
export function normalizePhone(val: any): string {
  if (!val) return '';
  let str = String(val).trim();
  // Remove non-digit except possible '+'
  str = str.replace(/[^\d+]/g, '');
  if (str.startsWith('+84')) {
    str = '0' + str.substring(3);
  }
  // If Excel parsed leading 0 as number (e.g. 912345678 -> length 9), add leading 0
  if (/^\d{9}$/.test(str)) {
    str = '0' + str;
  }
  return str;
}

// Clean string
function getCellString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

// Match header key flexibly
function findColumnIndex(headers: string[], possibleKeywords: string[]): number {
  return headers.findIndex((h) => {
    if (!h) return false;
    const cleanHeader = h.toLowerCase().trim();
    return possibleKeywords.some((kw) => cleanHeader.includes(kw.toLowerCase()));
  });
}

/**
 * Parse Excel file (.xlsx, .xls, .csv) to list of students
 */
export async function parseStudentExcelFile(file: File): Promise<ParsedStudentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel không có trang dữ liệu (sheet) nào!');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('File Excel không đủ dữ liệu (ít nhất cần 1 dòng tiêu đề và 1 dòng học sinh).');
  }

  // Find header row (usually row 0 or within first 5 rows)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawRows.length, 6); i++) {
    const rowStr = rawRows[i].map((c) => String(c).toLowerCase()).join(' ');
    if (rowStr.includes('họ') || rowStr.includes('tên') || rowStr.includes('name') || rowStr.includes('stt')) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = rawRows[headerRowIndex].map((c) => String(c).trim());

  // Map column indexes
  const colStt = findColumnIndex(headerRow, ['stt', 'số thứ tự', 'thứ tự', 'no']);
  const colName = findColumnIndex(headerRow, ['họ và tên', 'họ tên', 'họ & tên', 'tên học sinh', 'họ tên học sinh', 'họ', 'tên', 'name', 'full name']);
  const colGender = findColumnIndex(headerRow, ['giới tính', 'giới', 'phái', 'gender', 'sex']);
  const colDob = findColumnIndex(headerRow, ['ngày sinh', 'sinh ngày', 'dob', 'năm sinh', 'birth']);
  const colPhone = findColumnIndex(headerRow, ['sđt phụ huynh', 'sđt', 'điện thoại', 'số điện thoại', 'phone', 'phụ huynh sđt', 'liên hệ']);
  const colParentName = findColumnIndex(headerRow, ['họ tên phụ huynh', 'tên phụ huynh', 'phụ huynh', 'người giám hộ', 'cha mẹ', 'parent']);
  const colGroup = findColumnIndex(headerRow, ['tổ', 'tổ sinh hoạt', 'group']);
  const colRole = findColumnIndex(headerRow, ['chức vụ', 'chức danh', 'role', 'vị trí']);
  const colAddress = findColumnIndex(headerRow, ['địa chỉ', 'nơi ở', 'thường trú', 'address']);
  const colNotes = findColumnIndex(headerRow, ['ghi chú', 'lưu ý', 'note', 'notes']);

  if (colName === -1) {
    throw new Error('Không tìm thấy cột "Họ và tên" trong file Excel. Vui lòng kiểm tra lại dòng tiêu đề!');
  }

  const parsedResults: ParsedStudentRow[] = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Check if entire row is empty
    const hasAnyValue = row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
    if (!hasAnyValue) continue;

    const rawFullName = colName !== -1 ? getCellString(row[colName]) : '';
    // Skip if no name
    if (!rawFullName) continue;

    const errors: string[] = [];

    const rawStt = colStt !== -1 ? parseInt(String(row[colStt]).replace(/\D/g, ''), 10) : undefined;
    const gender = colGender !== -1 ? normalizeGender(row[colGender]) : 'Nam';
    const dob = colDob !== -1 ? normalizeDate(row[colDob]) : '2012-01-01';
    const parentPhone = colPhone !== -1 ? normalizePhone(row[colPhone]) : '';
    const parentName = colParentName !== -1 ? getCellString(row[colParentName]) : undefined;
    const groupNumber = colGroup !== -1 ? normalizeGroup(row[colGroup]) : 1;
    const role = colRole !== -1 ? normalizeRole(row[colRole]) : 'Thành viên';
    const address = colAddress !== -1 ? getCellString(row[colAddress]) : undefined;
    const notes = colNotes !== -1 ? getCellString(row[colNotes]) : undefined;

    if (!rawFullName.trim()) {
      errors.push('Thiếu họ tên học sinh');
    }

    if (!parentPhone) {
      errors.push('Thiếu số điện thoại phụ huynh');
    }

    parsedResults.push({
      orderNumber: isNaN(rawStt as number) ? undefined : rawStt,
      fullName: rawFullName,
      gender,
      dob,
      parentPhone,
      parentName: parentName || undefined,
      role,
      groupNumber,
      address: address || undefined,
      notes: notes || undefined,
      isValid: errors.length === 0,
      errors,
    });
  }

  if (parsedResults.length === 0) {
    throw new Error('Không tìm thấy bản ghi học sinh hợp lệ nào trong file!');
  }

  return parsedResults;
}

/**
 * Download standard Excel Template for teachers
 */
export function downloadStudentExcelTemplate() {
  const sampleData = [
    {
      'STT': 1,
      'Họ và tên': 'Nguyễn Văn An',
      'Giới tính': 'Nam',
      'Ngày sinh': '15/05/2012',
      'SĐT phụ huynh': '0912345678',
      'Tên phụ huynh': 'Nguyễn Văn Bình (Bố)',
      'Tổ': 1,
      'Chức vụ': 'Lớp trưởng',
      'Địa chỉ': '123 Phan Bội Châu, TP. Buôn Ma Thuột',
      'Ghi chú': 'Học sinh gương mẫu',
    },
    {
      'STT': 2,
      'Họ và tên': 'Trần Thị Mai',
      'Giới tính': 'Nữ',
      'Ngày sinh': '20/10/2012',
      'SĐT phụ huynh': '0987654321',
      'Tên phụ huynh': 'Lê Thị Lan (Mẹ)',
      'Tổ': 2,
      'Chức vụ': 'Lớp phó',
      'Địa chỉ': '45 Lê Duẩn, TP. Buôn Ma Thuột',
      'Ghi chú': 'Phụ trách học tập',
    },
    {
      'STT': 3,
      'Họ và tên': 'Lê Hoàng Nam',
      'Giới tính': 'Nam',
      'Ngày sinh': '08/03/2012',
      'SĐT phụ huynh': '0905112233',
      'Tên phụ huynh': 'Lê Văn Cường (Bố)',
      'Tổ': 3,
      'Chức vụ': 'Bí thư',
      'Địa chỉ': '67 Nguyễn Tất Thành',
      'Ghi chú': 'Năng nổ phong trào Đội',
    },
    {
      'STT': 4,
      'Họ và tên': 'Phạm Thùy Linh',
      'Giới tính': 'Nữ',
      'Ngày sinh': '12/12/2012',
      'SĐT phụ huynh': '0934567890',
      'Tên phụ huynh': 'Phạm Văn Hùng (Bố)',
      'Tổ': 4,
      'Chức vụ': 'Tổ trưởng',
      'Địa chỉ': '89 Đinh Tiên Hoàng',
      'Ghi chú': '',
    },
    {
      'STT': 5,
      'Họ và tên': 'Đặng Quốc Huy',
      'Giới tính': 'Nam',
      'Ngày sinh': '25/08/2012',
      'SĐT phụ huynh': '0977889900',
      'Tên phụ huynh': 'Nguyễn Thị Hoa (Mẹ)',
      'Tổ': 1,
      'Chức vụ': 'Thành viên',
      'Địa chỉ': '12 Yersin',
      'Ghi chú': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ và tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 16 }, // SĐT phụ huynh
    { wch: 24 }, // Tên phụ huynh
    { wch: 8 },  // Tổ
    { wch: 16 }, // Chức vụ
    { wch: 32 }, // Địa chỉ
    { wch: 25 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');

  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh_Lop9A2.xlsx');
}

/**
 * Export current students to Excel file
 */
export function exportStudentsToExcel(students: Student[], className = '9A2') {
  const data = students.map((s, idx) => {
    // format dob YYYY-MM-DD to DD/MM/YYYY
    let dobVi = s.dob;
    const parts = s.dob.split('-');
    if (parts.length === 3) {
      dobVi = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return {
      'STT': s.orderNumber || idx + 1,
      'Họ và tên': s.fullName,
      'Giới tính': s.gender,
      'Ngày sinh': dobVi,
      'SĐT phụ huynh': s.parentPhone,
      'Tên phụ huynh': s.parentName || '',
      'Tổ': s.groupNumber,
      'Chức vụ': s.role,
      'Địa chỉ': s.address || '',
      'Ghi chú': s.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ và tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 16 }, // SĐT phụ huynh
    { wch: 24 }, // Tên phụ huynh
    { wch: 8 },  // Tổ
    { wch: 16 }, // Chức vụ
    { wch: 32 }, // Địa chỉ
    { wch: 25 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Lớp ${className}`);

  const fileName = `Danh_Sach_Hoc_Sinh_Lop_${className.replace(/\s+/g, '')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
