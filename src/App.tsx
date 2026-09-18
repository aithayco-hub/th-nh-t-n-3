import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, Student, ClassMetadata, DailyAttendance, ConductRecord, FinanceRecord, ContactRecord, RewardDisciplineRecord, ScheduleEvent } from './types';
import {
  AppState,
  getStoredStudents,
  setStoredStudents,
  getStoredAttendance,
  setStoredAttendance,
  getStoredConduct,
  setStoredConduct,
  getStoredFinance,
  setStoredFinance,
  getStoredContacts,
  setStoredContacts,
  getStoredAwards,
  setStoredAwards,
  getStoredSchedule,
  setStoredSchedule,
  getStoredMetadata,
  setStoredMetadata,
  saveStateToLocalStorage,
  resetToSampleData,
  getTodayDateString,
} from './utils/storage';
import {
  isSupabaseConfigured,
  loadDataFromSupabase,
  saveDataToSupabase,
  getAuthUser,
  onAuthChange,
  signOutSupabase,
  signInWithGoogle,
  AuthTeacher
} from './utils/supabase';
import { getCurrentAuthUser, setCurrentAuthUser } from './utils/accountAuth';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { ClassHeader } from './components/ClassHeader';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { ConductView } from './components/ConductView';
import { FinanceView } from './components/FinanceView';
import { ContactBookView } from './components/ContactBookView';
import { StudentListView } from './components/StudentListView';
import { StatsView } from './components/StatsView';
import { AwardsDisciplineView } from './components/AwardsDisciplineView';
import { ScheduleView } from './components/ScheduleView';
import { YearConfigModal } from './components/YearConfigModal';
import { ClassInfoModal } from './components/ClassInfoModal';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  // App Data State initialized from localStorage
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, DailyAttendance>>(() => getStoredAttendance());
  const [conductList, setConductList] = useState<ConductRecord[]>(() => getStoredConduct());
  const [financeList, setFinanceList] = useState<FinanceRecord[]>(() => getStoredFinance());
  const [contactsList, setContactsList] = useState<ContactRecord[]>(() => getStoredContacts());
  const [awardsList, setAwardsList] = useState<RewardDisciplineRecord[]>(() => getStoredAwards());
  const [scheduleList, setScheduleList] = useState<ScheduleEvent[]>(() => getStoredSchedule());
  const [metadata, setMetadata] = useState<ClassMetadata>(() => getStoredMetadata());

  // UI Modals & Toasts
  const [isYearConfigOpen, setIsYearConfigOpen] = useState(false);
  const [isClassInfoOpen, setIsClassInfoOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthTeacher | null>(null);
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('entered_app') === 'true');
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [supabaseConfigVersion, setSupabaseConfigVersion] = useState(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  // Check current auth user on load & listen for auth state changes
  useEffect(() => {
    // Check local username auth user first
    const localUser = getCurrentAuthUser();
    if (localUser) {
      setCurrentUser(localUser);
      setHasEnteredApp(true);
    }

    if (isSupabaseConfigured()) {
      getAuthUser().then((user) => {
        if (user) {
          setCurrentUser(user);
          setHasEnteredApp(true);
        }
      });
      const unsubscribe = onAuthChange((user) => {
        if (user) {
          setCurrentUser(user);
          setHasEnteredApp(true);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Supabase sync tracking
  const isTableMissingRef = useRef(false);

  // Initial Load from Supabase (if configured)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadDataFromSupabase().then((res) => {
        if (res.data) {
          isTableMissingRef.current = false;
          const d = res.data;
          if (d.metadata) setMetadata(d.metadata);
          if (d.students) setStudents(d.students);
          if (d.attendance) setAttendanceRecords(d.attendance);
          if (d.conduct) setConductList(d.conduct);
          if (d.finance) setFinanceList(d.finance);
          if (d.contacts) setContactsList(d.contacts);
          if (d.awards) setAwardsList(d.awards);
          if (d.schedule) setScheduleList(d.schedule);
          saveStateToLocalStorage(d);
          showToast('Đã kết nối và tải dữ liệu từ Supabase Cloud!', 'success');
        } else if (res.isTableMissing) {
          isTableMissingRef.current = true;
          showToast('Chưa tạo bảng class_data trên Supabase. Bấm "Lưu trữ Cloud" để xem hướng dẫn tạo bảng.', 'info');
        } else if (!res.error) {
          // Initialize empty Supabase table with initial state
          const current: AppState = {
            metadata,
            students,
            attendance: attendanceRecords,
            conduct: conductList,
            finance: financeList,
            contacts: contactsList,
            awards: awardsList,
            schedule: scheduleList,
          };
          saveDataToSupabase(current).then((saveRes) => {
            if (saveRes.isTableMissing) {
              isTableMissingRef.current = true;
            }
          });
        }
      });
    }
  }, []);

  // Background Debounced Auto-Sync to Supabase when state changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isSupabaseConfigured()) return;
    if (isTableMissingRef.current) return;

    const timer = setTimeout(() => {
      saveDataToSupabase({
        metadata,
        students,
        attendance: attendanceRecords,
        conduct: conductList,
        finance: financeList,
        contacts: contactsList,
        awards: awardsList,
        schedule: scheduleList,
      }).then((res) => {
        if (res.isTableMissing) {
          isTableMissingRef.current = true;
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [students, attendanceRecords, conductList, financeList, contactsList, awardsList, scheduleList, metadata]);

  const handleApplyRemoteState = (newState: AppState) => {
    isTableMissingRef.current = false;
    if (newState.metadata) setMetadata(newState.metadata);
    if (newState.students) setStudents(newState.students);
    if (newState.attendance) setAttendanceRecords(newState.attendance);
    if (newState.conduct) setConductList(newState.conduct);
    if (newState.finance) setFinanceList(newState.finance);
    if (newState.contacts) setContactsList(newState.contacts);
    if (newState.awards) setAwardsList(newState.awards);
    if (newState.schedule) setScheduleList(newState.schedule);
  };

  // --- Student Handlers ---
  const handleAddStudent = (newS: Omit<Student, 'id' | 'orderNumber'>) => {
    const nextOrder = students.length > 0 ? Math.max(...students.map((s) => s.orderNumber)) + 1 : 1;
    const student: Student = {
      ...newS,
      id: 'hs_' + Date.now().toString(),
      orderNumber: nextOrder,
    };
    const updated = [...students, student];
    setStudents(updated);
    setStoredStudents(updated);
  };

  const handleBatchAddStudents = (
    newStudentsData: Array<Omit<Student, 'id' | 'orderNumber'>>,
    mode: 'append' | 'replace' = 'append'
  ) => {
    if (mode === 'replace') {
      const updated: Student[] = newStudentsData.map((s, idx) => ({
        ...s,
        id: 'hs_' + Date.now().toString() + '_' + idx,
        orderNumber: idx + 1,
      }));
      setStudents(updated);
      setStoredStudents(updated);
    } else {
      const currentMaxOrder = students.length > 0 ? Math.max(...students.map((s) => s.orderNumber)) : 0;
      const addedStudents: Student[] = newStudentsData.map((s, idx) => ({
        ...s,
        id: 'hs_' + Date.now().toString() + '_' + idx,
        orderNumber: currentMaxOrder + idx + 1,
      }));
      const updated = [...students, ...addedStudents];
      setStudents(updated);
      setStoredStudents(updated);
    }
  };

  const handleUpdateStudent = (id: string, updatedFields: Partial<Student>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    setStudents(updated);
    setStoredStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const remaining = students.filter((s) => s.id !== id);
    // Re-index order numbers
    const reindexed = remaining.map((s, idx) => ({ ...s, orderNumber: idx + 1 }));
    setStudents(reindexed);
    setStoredStudents(reindexed);
  };

  const handleBatchDeleteStudents = (idsToDelete: string[]) => {
    const idSet = new Set(idsToDelete);
    const remaining = students.filter((s) => !idSet.has(s.id));
    // Re-index order numbers
    const reindexed = remaining.map((s, idx) => ({ ...s, orderNumber: idx + 1 }));
    setStudents(reindexed);
    setStoredStudents(reindexed);
  };

  // --- Attendance Handlers ---
  const handleSaveAttendance = (date: string, records: DailyAttendance['records']) => {
    const recordsList = Object.values(records) as Array<{ status: string; note?: string }>;
    const presentCount = recordsList.filter((r) => r.status === 'present').length;
    const absentPermittedCount = recordsList.filter((r) => r.status === 'excused').length;
    const absentUnpermittedCount = recordsList.filter((r) => r.status === 'unexcused').length;
    const lateCount = recordsList.filter((r) => r.status === 'late').length;

    const newAttendance: DailyAttendance = {
      date,
      records,
      presentCount,
      absentPermittedCount,
      absentUnpermittedCount,
      lateCount,
    };

    const updated = { ...attendanceRecords, [date]: newAttendance };
    setAttendanceRecords(updated);
    setStoredAttendance(updated);
  };

  // --- Conduct Handlers ---
  const handleSaveConduct = (record: ConductRecord) => {
    const existingIndex = conductList.findIndex((c) => c.studentId === record.studentId);
    let updated: ConductRecord[];
    if (existingIndex >= 0) {
      updated = [...conductList];
      updated[existingIndex] = record;
    } else {
      updated = [...conductList, record];
    }
    setConductList(updated);
    setStoredConduct(updated);
  };

  const handleBatchUpdateConduct = (records: ConductRecord[]) => {
    // Merge into conductList
    const map = new Map<string, ConductRecord>();
    conductList.forEach((c) => map.set(c.studentId, c));
    records.forEach((c) => map.set(c.studentId, c));
    const updated = Array.from(map.values());
    setConductList(updated);
    setStoredConduct(updated);
  };

  // --- Finance Handlers ---
  const handleAddFinance = (record: Omit<FinanceRecord, 'id'>) => {
    const newRecord: FinanceRecord = {
      ...record,
      id: 'fin_' + Date.now().toString(),
    };
    const updated = [newRecord, ...financeList];
    setFinanceList(updated);
    setStoredFinance(updated);
  };

  const handleDeleteFinance = (id: string) => {
    const updated = financeList.filter((f) => f.id !== id);
    setFinanceList(updated);
    setStoredFinance(updated);
  };

  // --- Contact Handlers ---
  const handleAddContact = (record: Omit<ContactRecord, 'id'>) => {
    const newRecord: ContactRecord = {
      ...record,
      id: 'cnt_' + Date.now().toString(),
    };
    const updated = [newRecord, ...contactsList];
    setContactsList(updated);
    setStoredContacts(updated);
  };

  const handleUpdateContactStatus = (id: string, status: 'pending' | 'resolved') => {
    const updated = contactsList.map((c) => (c.id === id ? { ...c, status } : c));
    setContactsList(updated);
    setStoredContacts(updated);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contactsList.filter((c) => c.id !== id);
    setContactsList(updated);
    setStoredContacts(updated);
  };

  // --- Awards / Discipline Handlers ---
  const handleAddAward = (record: Omit<RewardDisciplineRecord, 'id'>) => {
    const newRecord: RewardDisciplineRecord = {
      ...record,
      id: 'awd_' + Date.now().toString(),
    };
    const updated = [newRecord, ...awardsList];
    setAwardsList(updated);
    setStoredAwards(updated);
  };

  const handleDeleteAward = (id: string) => {
    const updated = awardsList.filter((a) => a.id !== id);
    setAwardsList(updated);
    setStoredAwards(updated);
  };

  // --- Schedule Handlers ---
  const handleAddSchedule = (event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: 'sch_' + Date.now().toString(),
    };
    const updated = [newEvent, ...scheduleList];
    setScheduleList(updated);
    setStoredSchedule(updated);
  };

  const handleToggleSchedule = (id: string) => {
    const updated = scheduleList.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    setScheduleList(updated);
    setStoredSchedule(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = scheduleList.filter((s) => s.id !== id);
    setScheduleList(updated);
    setStoredSchedule(updated);
  };

  // --- Metadata / Reset ---
  const handleSaveMetadata = (updatedFields: Partial<ClassMetadata>) => {
    const updated = { ...metadata, ...updatedFields };
    setMetadata(updated);
    setStoredMetadata(updated);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Khôi phục dữ liệu mẫu ban đầu của Lớp 9A2 (Trường THCS Phan Bội Châu)? Dữ liệu mẫu sẽ được nạp lại.')) {
      resetToSampleData();
      setStudents(getStoredStudents());
      setAttendanceRecords(getStoredAttendance());
      setConductList(getStoredConduct());
      setFinanceList(getStoredFinance());
      setContactsList(getStoredContacts());
      setAwardsList(getStoredAwards());
      setScheduleList(getStoredSchedule());
      setMetadata(getStoredMetadata());
      showToast('Đã khôi phục dữ liệu mẫu thành công!', 'success');
    }
  };

  const handleLoginGoogle = async () => {
    if (!isSupabaseConfigured()) {
      setIsDbModalOpen(true);
      showToast('Thầy cô cần cấu hình kết nối Supabase Cloud để kích hoạt đăng nhập Google.', 'info');
      return;
    }
    const res = await signInWithGoogle();
    if (res.error) {
      showToast(`Không thể kết nối Google: ${res.error}`, 'error');
    }
  };

  const handleEnterGuest = () => {
    sessionStorage.setItem('entered_app', 'true');
    setHasEnteredApp(true);
    showToast('Chào mừng thầy cô vào Sổ tay điện tử Lớp 9A2!', 'success');
  };

  const handleLogout = async () => {
    if (currentUser) {
      await signOutSupabase();
    }
    setCurrentAuthUser(null);
    sessionStorage.removeItem('entered_app');
    setCurrentUser(null);
    setHasEnteredApp(false);
    showToast('Đã đăng xuất và quay về màn hình ngoài.', 'info');
  };

  // If user hasn't logged in or entered the app, display the external Login Screen
  if (!hasEnteredApp && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
        <Toast toasts={toasts} onRemove={removeToast} />
        <LoginScreen
          metadata={metadata}
          onLoginGoogle={handleLoginGoogle}
          isSupabaseReady={isSupabaseConfigured()}
          onOpenDbSync={() => setIsDbModalOpen(true)}
          showToast={showToast}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setCurrentAuthUser(user);
            setHasEnteredApp(true);
            sessionStorage.setItem('entered_app', 'true');
          }}
        />
        <DatabaseSyncModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onConfigChanged={() => setSupabaseConfigVersion((v) => v + 1)}
          currentState={{
            metadata,
            students,
            attendance: attendanceRecords,
            conduct: conductList,
            finance: financeList,
            contacts: contactsList,
            awards: awardsList,
            schedule: scheduleList,
          }}
          onApplyRemoteState={handleApplyRemoteState}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast notifications container */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        metadata={metadata}
        onUpdateMetadata={handleSaveMetadata}
        onResetData={handleResetSampleData}
        onOpenYearConfig={() => setIsYearConfigOpen(true)}
        onOpenClassInfo={() => setIsClassInfoOpen(true)}
        onOpenDbSync={() => setIsDbModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner always visible on home */}
        {currentScreen === 'home' && (
          <ClassHeader
            metadata={metadata}
            totalStudents={students.length}
            onOpenStudents={() => setCurrentScreen('students')}
          />
        )}

        {/* Dynamic Views */}
        {currentScreen === 'home' && (
          <DashboardView
            students={students}
            todayAttendance={attendanceRecords[getTodayDateString()] || Object.values(attendanceRecords)[0]}
            conductList={conductList}
            financeList={financeList}
            contactsList={contactsList}
            awardsList={awardsList}
            scheduleList={scheduleList}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'attendance' && (
          <AttendanceView
            students={students}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={handleSaveAttendance}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'conduct' && (
          <ConductView
            students={students}
            conductList={conductList}
            onSaveConduct={handleSaveConduct}
            onBatchUpdate={handleBatchUpdateConduct}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'finance' && (
          <FinanceView
            financeList={financeList}
            onAddFinance={handleAddFinance}
            onDeleteFinance={handleDeleteFinance}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'contacts' && (
          <ContactBookView
            students={students}
            contactsList={contactsList}
            onAddContact={handleAddContact}
            onUpdateContactStatus={handleUpdateContactStatus}
            onDeleteContact={handleDeleteContact}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'students' && (
          <StudentListView
            students={students}
            onAddStudent={handleAddStudent}
            onBatchAddStudents={handleBatchAddStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchDeleteStudents={handleBatchDeleteStudents}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'stats' && (
          <StatsView
            students={students}
            attendanceRecords={attendanceRecords}
            conductList={conductList}
            awardsList={awardsList}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'awards' && (
          <AwardsDisciplineView
            students={students}
            awardsList={awardsList}
            onAddRecord={handleAddAward}
            onDeleteRecord={handleDeleteAward}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'schedule' && (
          <ScheduleView
            scheduleList={scheduleList}
            onAddEvent={handleAddSchedule}
            onToggleComplete={handleToggleSchedule}
            onDeleteEvent={handleDeleteSchedule}
            onBackToHome={() => setCurrentScreen('home')}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-700">GIÁO VIÊN CHỦ NHIỆM – LỚP 9A2</span> | Trường THCS Phan Bội Châu
            <span className="block sm:inline sm:ml-2 text-slate-400">
              GVCN: {metadata?.headTeacher || 'Dương Thành Tín'} • Năm học {metadata?.academicYear || '2026–2027'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition-colors font-semibold flex items-center gap-1.5"
              title="Đăng xuất / Thoát ra màn hình ngoài"
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>{currentUser ? `Đăng xuất (${currentUser.name})` : 'Đăng xuất / Thoát ra ngoài'}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-slate-500 hover:text-emerald-700 transition-colors font-medium flex items-center gap-1.5"
              title="Xem thông tin và cấu hình đồng bộ Supabase"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{isSupabaseConfigured() ? 'Supabase Cloud: Đang kết nối' : 'Lưu trữ cục bộ (Bấm để kết nối Supabase)'}</span>
            </button>
            <span>•</span>
            <button
              onClick={handleResetSampleData}
              className="text-slate-400 hover:text-blue-600 transition-colors underline"
              title="Khôi phục lại dữ liệu mẫu lớp 9A2"
            >
              Nạp lại dữ liệu mẫu
            </button>
          </div>
        </div>
      </footer>

      {/* Configuration & Profile Modals */}
      <YearConfigModal
        metadata={metadata}
        isOpen={isYearConfigOpen}
        onClose={() => setIsYearConfigOpen(false)}
        onSave={handleSaveMetadata}
        showToast={showToast}
      />

      <ClassInfoModal
        metadata={metadata}
        students={students}
        isOpen={isClassInfoOpen}
        onClose={() => setIsClassInfoOpen(false)}
      />

      <DatabaseSyncModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConfigChanged={() => setSupabaseConfigVersion((v) => v + 1)}
        currentState={{
          metadata,
          students,
          attendance: attendanceRecords,
          conduct: conductList,
          finance: financeList,
          contacts: contactsList,
          awards: awardsList,
          schedule: scheduleList,
        }}
        onApplyRemoteState={handleApplyRemoteState}
        showToast={showToast}
      />

      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSyncTeacherName={(name) => handleSaveMetadata({ teacherName: name, headTeacher: name })}
        showToast={showToast}
      />
    </div>
  );
}
