import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface LocalUserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  createdAt: string;
}

export interface AuthTeacher {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

const STORAGE_ACCOUNTS_KEY = 'GVCN_REGISTERED_ACCOUNTS';
const STORAGE_CURRENT_USER_KEY = 'GVCN_CURRENT_USER';

// Default accounts to guarantee instant access if testing or first time
const DEFAULT_ACCOUNTS: LocalUserAccount[] = [
  {
    id: 'user_admin',
    username: 'admin',
    password: '123',
    fullName: 'Thầy Dương Thành Tín',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'user_giaovien',
    username: 'giaovien',
    password: '123',
    fullName: 'Giáo viên Chủ nhiệm',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

/**
 * Lấy danh sách tài khoản từ localStorage
 */
export const getStoredAccounts = (): LocalUserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Lỗi khi đọc danh sách tài khoản từ localStorage:', e);
  }

  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  } catch (e) {
    console.error('Lỗi khi lưu tài khoản mặc định:', e);
  }
  return DEFAULT_ACCOUNTS;
};

/**
 * Lưu danh sách tài khoản vào localStorage
 */
export const saveStoredAccounts = (accounts: LocalUserAccount[]) => {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Lỗi khi ghi danh sách tài khoản:', e);
  }
};

/**
 * Lấy người dùng hiện tại đang đăng nhập
 */
export const getCurrentAuthUser = (): AuthTeacher | null => {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (rawSession) return JSON.parse(rawSession);

    const rawLocal = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (rawLocal) return JSON.parse(rawLocal);
  } catch {
    return null;
  }
  return null;
};

/**
 * Lưu người dùng đăng nhập hiện tại
 */
export const setCurrentAuthUser = (user: AuthTeacher | null) => {
  try {
    if (user) {
      const dataStr = JSON.stringify(user);
      sessionStorage.setItem(STORAGE_CURRENT_USER_KEY, dataStr);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, dataStr);
      sessionStorage.setItem('entered_app', 'true');
    } else {
      sessionStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      sessionStorage.removeItem('entered_app');
    }
  } catch (e) {
    console.error('Lỗi khi lưu phiên đăng nhập:', e);
  }
};

/**
 * Đăng nhập bằng Tên đăng nhập và Mật khẩu:
 * Ưu tiên kiểm tra trực tiếp từ Supabase Database (bảng teacher_accounts),
 * nếu Supabase chưa cấu hình hoặc bảng chưa tạo thì dùng bộ nhớ cục bộ (localStorage).
 */
export const signInWithUsername = async (
  username: string,
  password: string
): Promise<{ error?: string; user?: AuthTeacher }> => {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { error: 'Vui lòng nhập tên đăng nhập của Thầy Cô.' };
  }
  if (!password) {
    return { error: 'Vui lòng nhập mật khẩu.' };
  }

  // 1. Kiểm tra trên Supabase Database nếu đã cấu hình
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data: dbUser, error } = await client
          .from('teacher_accounts')
          .select('id, username, password, full_name')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (!error && dbUser) {
          if (dbUser.password !== password) {
            return {
              error: 'Mật khẩu không chính xác. Thầy Cô vui lòng kiểm tra lại.',
            };
          }
          const user: AuthTeacher = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.full_name || dbUser.username,
          };
          setCurrentAuthUser(user);

          // Đồng bộ vào localStorage để dùng khi ngoại tuyến
          const localAccounts = getStoredAccounts();
          if (!localAccounts.some((a) => a.username.toLowerCase() === cleanUsername.toLowerCase())) {
            localAccounts.push({
              id: dbUser.id,
              username: dbUser.username,
              password: dbUser.password,
              fullName: dbUser.full_name || dbUser.username,
              createdAt: new Date().toISOString(),
            });
            saveStoredAccounts(localAccounts);
          }

          return { user };
        }
      }
    } catch (err) {
      console.warn('Không thể truy vấn Supabase teacher_accounts, chuyển sang lưu trữ cục bộ:', err);
    }
  }

  // 2. Dự phòng: Kiểm tra trong bộ nhớ cục bộ
  const accounts = getStoredAccounts();
  const lowerUser = cleanUsername.toLowerCase();
  const found = accounts.find((acc) => acc.username.toLowerCase() === lowerUser);

  if (!found) {
    return {
      error: `Tài khoản "${cleanUsername}" không tồn tại. Thầy Cô vui lòng bấm "Tạo tài khoản mới" bên cạnh để tạo tài khoản ngay.`,
    };
  }

  if (found.password !== password) {
    return {
      error: 'Mật khẩu không chính xác. Thầy Cô vui lòng kiểm tra lại.',
    };
  }

  const user: AuthTeacher = {
    id: found.id,
    username: found.username,
    name: found.fullName || found.username,
  };

  setCurrentAuthUser(user);
  return { user };
};

/**
 * Tạo tài khoản mới bằng Tên đăng nhập & Mật khẩu:
 * Tự động lưu vĩnh viễn vào Database Supabase (bảng teacher_accounts) và lưu cục bộ.
 */
export const signUpWithUsername = async (
  username: string,
  password: string,
  fullName?: string
): Promise<{ error?: string; user?: AuthTeacher; message?: string }> => {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { error: 'Vui lòng nhập tên đăng nhập muốn tạo.' };
  }

  if (cleanUsername.length < 3) {
    return { error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }

  if (/\s/.test(cleanUsername)) {
    return { error: 'Tên đăng nhập không được chứa dấu cách (khoảng trắng).' };
  }

  if (password.length < 3) {
    return { error: 'Mật khẩu phải có độ dài từ 3 ký tự trở lên.' };
  }

  const nowIso = new Date().toISOString();
  const newAccount: LocalUserAccount = {
    id: 'usr_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
    username: cleanUsername,
    password: password,
    fullName: fullName?.trim() || cleanUsername,
    createdAt: nowIso,
  };

  // 1. Nếu đã kết nối Supabase, kiểm tra trùng lặp và lưu vào bảng teacher_accounts
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        // Kiểm tra xem tên đăng nhập đã tồn tại trên Supabase chưa
        const { data: existingUser } = await client
          .from('teacher_accounts')
          .select('id, username')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return {
            error: `Tên đăng nhập "${cleanUsername}" đã có người sử dụng trên Database. Vui lòng chọn tên khác hoặc chuyển sang tab Đăng nhập.`,
          };
        }

        // Lưu vào bảng teacher_accounts trên Supabase
        const { error: insertError } = await client.from('teacher_accounts').insert({
          id: newAccount.id,
          username: newAccount.username,
          password: newAccount.password,
          full_name: newAccount.fullName,
          created_at: nowIso,
          updated_at: nowIso,
        });

        if (insertError) {
          console.warn('Không thể lưu vào Supabase teacher_accounts (có thể chưa chạy SQL tạo bảng):', insertError);
        }
      }
    } catch (err) {
      console.warn('Lỗi khi kết nối Supabase Database:', err);
    }
  }

  // 2. Lưu vào bộ nhớ cục bộ (đảm bảo hoạt động kể cả khi chưa có mạng)
  const accounts = getStoredAccounts();
  const lowerUser = cleanUsername.toLowerCase();
  const isExistedLocal = accounts.some((acc) => acc.username.toLowerCase() === lowerUser);

  if (isExistedLocal) {
    return {
      error: `Tên đăng nhập "${cleanUsername}" đã được đăng ký. Vui lòng chọn tên đăng nhập khác hoặc chuyển sang tab Đăng nhập.`,
    };
  }

  const updatedAccounts = [...accounts, newAccount];
  saveStoredAccounts(updatedAccounts);

  const authUser: AuthTeacher = {
    id: newAccount.id,
    username: newAccount.username,
    name: newAccount.fullName,
  };

  setCurrentAuthUser(authUser);

  return {
    user: authUser,
    message: `Tạo tài khoản "${cleanUsername}" thành công! Đang tự động vào sổ điện tử...`,
  };
};

/**
 * Đổi / Khôi phục mật khẩu trực tiếp theo tên đăng nhập:
 * Cập nhật cả trên Database Supabase và cục bộ.
 */
export const resetPasswordByUsername = async (
  username: string,
  newPassword: string
): Promise<{ error?: string; message?: string }> => {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { error: 'Vui lòng nhập tên đăng nhập cần đặt lại mật khẩu.' };
  }
  if (newPassword.length < 3) {
    return { error: 'Mật khẩu mới phải có ít nhất 3 ký tự.' };
  }

  let updatedInDb = false;

  // 1. Cập nhật trên Supabase Database nếu có kết nối
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client
          .from('teacher_accounts')
          .update({
            password: newPassword,
            updated_at: new Date().toISOString(),
          })
          .ilike('username', cleanUsername);

        if (!error) {
          updatedInDb = true;
        }
      }
    } catch (e) {
      console.warn('Lỗi khi cập nhật mật khẩu trên Supabase:', e);
    }
  }

  // 2. Cập nhật trong bộ nhớ cục bộ
  const accounts = getStoredAccounts();
  const lowerUser = cleanUsername.toLowerCase();
  const idx = accounts.findIndex((acc) => acc.username.toLowerCase() === lowerUser);

  if (idx !== -1) {
    accounts[idx].password = newPassword;
    saveStoredAccounts(accounts);
  } else if (!updatedInDb) {
    return { error: `Không tìm thấy tài khoản "${cleanUsername}".` };
  }

  return {
    message: `Đã đổi mật khẩu cho tài khoản "${cleanUsername}" thành công! Thầy Cô có thể đăng nhập ngay với mật khẩu mới.`,
  };
};
