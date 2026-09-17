/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from './storage';

// Lấy biến môi trường từ Vite
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const rawSupabaseUrl: string | undefined = env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey: string | undefined = env.VITE_SUPABASE_ANON_KEY;

export const getCleanSupabaseUrl = (): string => {
  if (!rawSupabaseUrl) return '';
  let url = rawSupabaseUrl.trim();
  // Loại bỏ dấu gạch chéo thừa ở cuối (nếu người dùng vô tình copy thừa)
  url = url.replace(/\/+$/, '');
  // Loại bỏ phần đuôi /rest/v1 hoặc /auth/v1 nếu người dùng copy từ đường dẫn API
  url = url.replace(/\/(rest|auth)\/v\d+$/i, '');
  return url;
};

export const getCleanAnonKey = (): string => {
  return (rawSupabaseAnonKey || '').trim();
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

export const SUPABASE_SETUP_SQL = `-- BƯỚC TẠO BẢNG LƯU TRỮ DỮ LIỆU LỚP HỌC TRÊN SUPABASE
-- 1. Vào mục 'SQL Editor' ở menu bên trái Supabase
-- 2. Dán toàn bộ mã này vào và nhấn nút 'RUN' (màu xanh lá):

-- Tạo bảng class_data
CREATE TABLE IF NOT EXISTS public.class_data (
  id TEXT PRIMARY KEY DEFAULT 'main_class',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cấp quyền truy cập bảng cho vai trò công khai (anon) và người dùng xác thực (authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.class_data TO anon, authenticated, service_role;

-- Kích hoạt chính sách bảo mật hàng (Row Level Security)
ALTER TABLE public.class_data ENABLE ROW LEVEL SECURITY;

-- Cho phép ứng dụng đọc và lưu dữ liệu vào bảng
DROP POLICY IF EXISTS "Cho phep truy cap class_data" ON public.class_data;
CREATE POLICY "Cho phep truy cap class_data"
  ON public.class_data
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

