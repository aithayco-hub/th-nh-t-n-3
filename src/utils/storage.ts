import {
  Student,
  DailyAttendance,
  ConductRecord,
  FinanceRecord,
  ContactRecord,
  RewardDisciplineRecord,
  ScheduleEvent,
  ClassMetadata,
} from '../types';
import {
  INITIAL_METADATA,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_CONDUCT,
  INITIAL_FINANCE,
  INITIAL_CONTACTS,
  INITIAL_AWARDS,
  INITIAL_SCHEDULE,
} from '../initialData';

export interface AppState {
  metadata: ClassMetadata;
  students: Student[];
  attendance: Record<string, DailyAttendance>;
  conduct: ConductRecord[];
  finance: FinanceRecord[];
  contacts: ContactRecord[];
  awards: RewardDisciplineRecord[];
  schedule: ScheduleEvent[];
}

const STORAGE_KEY = 'GVCN_9A2_THCS_PBC_DATA';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        metadata: { ...INITIAL_METADATA, ...(parsed.metadata || {}) },
        students: Array.isArray(parsed.students) ? parsed.students : INITIAL_STUDENTS,
        attendance: parsed.attendance || { [INITIAL_ATTENDANCE.date]: INITIAL_ATTENDANCE },
        conduct: parsed.conduct || INITIAL_CONDUCT,
        finance: parsed.finance || INITIAL_FINANCE,
        contacts: parsed.contacts || INITIAL_CONTACTS,
        awards: parsed.awards || INITIAL_AWARDS,
        schedule: parsed.schedule || INITIAL_SCHEDULE,
      };
    }
  } catch (e) {
    console.error('Lỗi khi đọc dữ liệu từ localStorage', e);
  }

  return {
    metadata: INITIAL_METADATA,
    students: INITIAL_STUDENTS,
    attendance: { [INITIAL_ATTENDANCE.date]: INITIAL_ATTENDANCE },
    conduct: INITIAL_CONDUCT,
    finance: INITIAL_FINANCE,
    contacts: INITIAL_CONTACTS,
    awards: INITIAL_AWARDS,
    schedule: INITIAL_SCHEDULE,
  };
};

export const saveStateToLocalStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Lỗi khi lưu vào localStorage', e);
  }
};

export const resetToSampleData = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  const defaultState: AppState = {
    metadata: INITIAL_METADATA,
    students: INITIAL_STUDENTS,
    attendance: { [INITIAL_ATTENDANCE.date]: INITIAL_ATTENDANCE },
    conduct: INITIAL_CONDUCT,
    finance: INITIAL_FINANCE,
    contacts: INITIAL_CONTACTS,
    awards: INITIAL_AWARDS,
    schedule: INITIAL_SCHEDULE,
  };
  saveStateToLocalStorage(defaultState);
  return defaultState;
};

export const resetToDefaultData = resetToSampleData;

// Individual accessors for App.tsx
export const getStoredStudents = (): Student[] => loadInitialState().students;
export const setStoredStudents = (students: Student[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, students });
};

export const getStoredAttendance = (): Record<string, DailyAttendance> => loadInitialState().attendance;
export const setStoredAttendance = (attendance: Record<string, DailyAttendance>) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, attendance });
};

export const getStoredConduct = (): ConductRecord[] => loadInitialState().conduct;
export const setStoredConduct = (conduct: ConductRecord[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, conduct });
};

export const getStoredFinance = (): FinanceRecord[] => loadInitialState().finance;
export const setStoredFinance = (finance: FinanceRecord[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, finance });
};

export const getStoredContacts = (): ContactRecord[] => loadInitialState().contacts;
export const setStoredContacts = (contacts: ContactRecord[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, contacts });
};

export const getStoredAwards = (): RewardDisciplineRecord[] => loadInitialState().awards;
export const setStoredAwards = (awards: RewardDisciplineRecord[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, awards });
};

export const getStoredSchedule = (): ScheduleEvent[] => loadInitialState().schedule;
export const setStoredSchedule = (schedule: ScheduleEvent[]) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, schedule });
};

export const getStoredMetadata = (): ClassMetadata => loadInitialState().metadata;
export const setStoredMetadata = (metadata: ClassMetadata) => {
  const current = loadInitialState();
  saveStateToLocalStorage({ ...current, metadata });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateVi = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};
