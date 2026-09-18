/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from './storage';

// Lấy biến môi trường từ Vite hoặc cấu hình tùy chỉnh lưu trong localStorage
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const getCustomSupabaseConfig = (): { url: string; anonKey: string } => {
  try {
    const url = localStorage.getItem('CUSTOM_SUPABASE_URL') || '';
    const anonKey = localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || '';
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
};

export const setCustomSupabaseConfig = (url: string, anonKey: string) => {
  try {
    if (url && url.trim()) {
      localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
    } else {
      localStorage.removeItem('CUSTOM_SUPABASE_URL');
    }
    if (anonKey && anonKey.trim()) {
      localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', anonKey.trim());
    } else {
      localStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
    }
    clientInstance = null; // Reset cached client instance
  } catch (e) {
    console.error('Lỗi khi lưu cấu hình Supabase:', e);
  }
};

export const getCleanSupabaseUrl = (): string => {
  const custom = getCustomSupabaseConfig();
  const rawSupabaseUrl = custom.url || env.VITE_SUPABASE_URL || '';
  if (!rawSupabaseUrl) return '';
  let url = rawSupabaseUrl.trim();
  // Loại bỏ dấu gạch chéo thừa ở cuối (nếu người dùng vô tình copy thừa)
  url = url.replace(/\/+$/, '');
  // Loại bỏ phần đuôi /rest/v1 hoặc /auth/v1 nếu người dùng copy từ đường dẫn API
  url = url.replace(/\/(rest|auth)\/v\d+$/i, '');
  return url;
};

export const getCleanAnonKey = (): string => {
  const custom = getCustomSupabaseConfig();
  return (custom.anonKey || env.VITE_SUPABASE_ANON_KEY || '').trim();
};

export const isSupabaseConfigured = (): boolean => {
  const url = getCleanSupabaseUrl();
  const key = getCleanAnonKey();
  return Boolean(
    url &&
    key &&
    url.length > 0 &&
    key.length > 0 &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const cleanUrl = getCleanSupabaseUrl();
  const cleanKey = getCleanAnonKey();

  if (!clientInstance && cleanUrl && cleanKey) {
    clientInstance = createClient(cleanUrl, cleanKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

export interface AuthTeacher {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export const extractTeacherProfile = (user: any): AuthTeacher | null => {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: metadata.full_name || metadata.name || metadata.user_name || (user.email ? user.email.split('@')[0] : 'Giáo viên'),
    avatarUrl: metadata.avatar_url || metadata.picture,
  };
};

/**
 * Đăng nhập với tài khoản Google qua Supabase
 */
export const signInWithGoogle = async (): Promise<{ error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Chưa cấu hình Supabase URL và Anon Key trên ứng dụng.' };
  }
  try {
    const redirectUrl = window.location.origin;
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err?.message || 'Không thể mở cửa sổ đăng nhập Google' };
  }
};

/**
 * Đăng nhập bằng Email & Mật khẩu
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ error?: string; user?: AuthTeacher | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Chưa cấu hình Supabase URL và Anon Key trên ứng dụng.' };
  }
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials') || msg.toLowerCase().includes('invalid grant')) {
        msg = 'Email hoặc mật khẩu không chính xác. Thầy Cô vui lòng kiểm tra lại.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Email chưa được kích hoạt. Thầy Cô vui lòng kiểm tra hộp thư (kể cả mục Spam) để kích hoạt, hoặc tắt yêu cầu Confirm Email trong bảng điều khiển Supabase Auth.';
      }
      return { error: msg };
    }
    return { user: extractTeacherProfile(data?.user) };
  } catch (err: any) {
    return { error: err?.message || 'Lỗi khi đăng nhập bằng email.' };
  }
};

/**
 * Đăng ký tài khoản mới bằng Email & Mật khẩu
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName?: string
): Promise<{ error?: string; message?: string; user?: AuthTeacher | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Chưa cấu hình Supabase URL và Anon Key trên ứng dụng.' };
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
          name: fullName?.trim() || '',
        },
      },
    });
    if (error) {
      let msg = error.message;
      if (msg.includes('User already registered') || msg.includes('already exists')) {
        msg = 'Email này đã được đăng ký tài khoản. Thầy Cô vui lòng chuyển sang tab "Đăng nhập".';
      } else if (msg.includes('Password should be at least')) {
        msg = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
      }
      return { error: msg };
    }

    if (data.session) {
      return {
        user: extractTeacherProfile(data.user),
        message: 'Đăng ký tài khoản và tự động đăng nhập thành công!',
      };
    } else {
      return {
        user: extractTeacherProfile(data.user),
        message:
          'Đăng ký tài khoản thành công! Nếu dự án Supabase bật xác nhận email, Thầy Cô vui lòng mở hộp thư email để kích hoạt trước khi đăng nhập.',
      };
    }
  } catch (err: any) {
    return { error: err?.message || 'Lỗi khi tạo tài khoản mới.' };
  }
};

/**
 * Gửi email yêu cầu đặt lại mật khẩu
 */
export const resetPasswordForEmail = async (
  email: string
): Promise<{ error?: string; message?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Chưa cấu hình Supabase URL và Anon Key trên ứng dụng.' };
  }
  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) {
      return { error: error.message };
    }
    return {
      message:
        'Đã gửi liên kết đặt lại mật khẩu về email của Thầy Cô. Vui lòng kiểm tra hộp thư (kể cả mục Spam)!',
    };
  } catch (err: any) {
    return { error: err?.message || 'Lỗi khi gửi yêu cầu khôi phục mật khẩu.' };
  }
};

/**
 * Đăng xuất khỏi tài khoản Supabase
 */
export const signOutSupabase = async (): Promise<{ error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return {};
  try {
    const { error } = await client.auth.signOut();
    if (error) return { error: error.message };
    return {};
  } catch (err: any) {
    return { error: err?.message || 'Lỗi khi đăng xuất' };
  }
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
export const getAuthUser = async (): Promise<AuthTeacher | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getUser();
    return extractTeacherProfile(data?.user);
  } catch {
    return null;
  }
};

/**
 * Lắng nghe thay đổi trạng thái đăng nhập
 */
export const onAuthChange = (callback: (user: AuthTeacher | null) => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};
  try {
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      callback(extractTeacherProfile(session?.user));
    });
    return () => {
      subscription.unsubscribe();
    };
  } catch {
    return () => {};
  }
};

export const SUPABASE_SETUP_SQL = `-- BƯỚC TẠO BẢNG LƯU TRỮ DỮ LIỆU VÀ TÀI KHOẢN TRÊN SUPABASE
-- 1. Vào mục 'SQL Editor' ở menu bên trái Supabase Dashboard
-- 2. Dán toàn bộ đoạn mã này vào và nhấn nút 'RUN' (màu xanh lá):

-- 1. Tạo bảng lưu trữ dữ liệu lớp học (Học sinh, điểm danh, nề nếp, sổ liên lạc...)
CREATE TABLE IF NOT EXISTS public.class_data (
  id TEXT PRIMARY KEY DEFAULT 'main_class',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tạo bảng lưu trữ tài khoản giáo viên (Tên đăng nhập & Mật khẩu)
CREATE TABLE IF NOT EXISTS public.teacher_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cấp quyền truy cập bảng cho vai trò công khai (anon), authenticated và service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.class_data TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.teacher_accounts TO anon, authenticated, service_role;

-- Kích hoạt chính sách bảo mật hàng (Row Level Security)
ALTER TABLE public.class_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_accounts ENABLE ROW LEVEL SECURITY;

-- Cho phép ứng dụng đọc và ghi vào 2 bảng
DROP POLICY IF EXISTS "Cho phep truy cap class_data" ON public.class_data;
CREATE POLICY "Cho phep truy cap class_data"
  ON public.class_data
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Cho phep truy cap teacher_accounts" ON public.teacher_accounts;
CREATE POLICY "Cho phep truy cap teacher_accounts"
  ON public.teacher_accounts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Buộc Supabase PostgREST cập nhật lại bộ nhớ đệm (Schema Cache) ngay lập tức
NOTIFY pgrst, 'reload schema';
`;

/**
 * Xử lý lỗi từ Supabase / PostgREST thành thông báo dễ hiểu
 */
export const formatSupabaseError = (error: { code?: string; message?: string } | null | undefined): string => {
  if (!error) return 'Lỗi không xác định';
  if (
    error.code === 'PGRST205' ||
    error.code === 'PGRST125' ||
    error.message?.includes('schema cache') ||
    error.message?.includes('Invalid path specified in request URL')
  ) {
    return "Chưa tìm thấy bảng 'public.class_data' trên Supabase (hoặc chưa cấp quyền). Vui lòng vào 'SQL Editor' trên Supabase, dán lại câu lệnh SQL và bấm 'RUN'.";
  }
  if (error.code === '42P01' || error.message?.includes('does not exist')) {
    return "Bảng 'class_data' chưa tồn tại trên Supabase. Vui lòng chạy câu lệnh SQL để tạo bảng.";
  }
  if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    return "Khóa anon API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại VITE_SUPABASE_ANON_KEY.";
  }
  return error.message || JSON.stringify(error);
};

export const checkIsTableMissingError = (error: { code?: string; message?: string } | null | undefined): boolean => {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === 'PGRST125' ||
    error.code === '42P01' ||
    Boolean(error.message?.includes('schema cache')) ||
    Boolean(error.message?.includes('Invalid path')) ||
    Boolean(error.message?.includes('does not exist'))
  );
};

/**
 * Tải toàn bộ dữ liệu ứng dụng từ Supabase
 */
export const loadDataFromSupabase = async (): Promise<{ data: AppState | null; error?: string; isTableMissing?: boolean }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY' };
  }

  try {
    const { data, error } = await client
      .from('class_data')
      .select('data, updated_at')
      .eq('id', 'main_class')
      .maybeSingle();

    if (error) {
      console.warn('Lỗi khi truy vấn Supabase:', error);
      const isMissing = checkIsTableMissingError(error);
      return { data: null, error: formatSupabaseError(error), isTableMissing: isMissing };
    }

    if (data && data.data) {
      return { data: data.data as AppState };
    }

    return { data: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi kết nối Supabase';
    console.error('Lỗi khi tải từ Supabase:', err);
    return { data: null, error: message };
  }
};

/**
 * Lưu/Đồng bộ toàn bộ dữ liệu ứng dụng lên Supabase
 */
export const saveDataToSupabase = async (state: AppState): Promise<{ success: boolean; error?: string; isTableMissing?: boolean }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Chưa cấu hình thông tin Supabase' };
  }

  try {
    const payload = {
      id: 'main_class',
      data: state,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('class_data')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Lỗi khi lưu lên Supabase:', error);
      const isMissing = checkIsTableMissingError(error);
      return { success: false, error: formatSupabaseError(error), isTableMissing: isMissing };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu lên Supabase';
    console.error('Lỗi ngoại lệ khi lưu lên Supabase:', err);
    return { success: false, error: message };
  }
};

