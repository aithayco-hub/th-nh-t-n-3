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
 * Lấy danh sách tài khoản đã đăng ký từ localStorage
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

  // Khởi tạo tài khoản mặc định nếu chưa có
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
 * Đăng nhập bằng Tên đăng nhập và Mật khẩu (Không cần email)
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
      error: 'Mật khẩu không chính xác. Thầy Cô vui lòng kiểm tra lại (hoặc liên hệ quản trị viên/dùng tài khoản admin: 123).',
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
 * Tạo tài khoản mới bằng Tên đăng nhập & Mật khẩu (Không cần email)
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

  // Tên đăng nhập tối thiểu 3 ký tự, không chứa dấu cách
  if (cleanUsername.length < 3) {
    return { error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }

  if (/\s/.test(cleanUsername)) {
    return { error: 'Tên đăng nhập không được chứa dấu cách (khoảng trắng).' };
  }

  // Mật khẩu tối thiểu 3 ký tự
  if (password.length < 3) {
    return { error: 'Mật khẩu phải có độ dài từ 3 ký tự trở lên.' };
  }

  const accounts = getStoredAccounts();
  const lowerUser = cleanUsername.toLowerCase();

  const isExisted = accounts.some((acc) => acc.username.toLowerCase() === lowerUser);
  if (isExisted) {
    return {
      error: `Tên đăng nhập "${cleanUsername}" đã có người đăng ký. Vui lòng chọn tên đăng nhập khác hoặc chuyển sang tab Đăng nhập.`,
    };
  }

  const newAccount: LocalUserAccount = {
    id: 'user_' + Date.now().toString(),
    username: cleanUsername,
    password: password,
    fullName: fullName?.trim() || cleanUsername,
    createdAt: new Date().toISOString(),
  };

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
    message: `Tạo tài khoản "${cleanUsername}" thành công! Đang tự động đăng nhập vào sổ điện tử...`,
  };
};

/**
 * Đổi / Khôi phục mật khẩu trực tiếp theo tên đăng nhập (Không cần email)
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

  const accounts = getStoredAccounts();
  const lowerUser = cleanUsername.toLowerCase();
  const idx = accounts.findIndex((acc) => acc.username.toLowerCase() === lowerUser);

  if (idx === -1) {
    return { error: `Không tìm thấy tài khoản "${cleanUsername}".` };
  }

  accounts[idx].password = newPassword;
  saveStoredAccounts(accounts);

  return {
    message: `Đã đổi mật khẩu cho tài khoản "${cleanUsername}" thành công! Thầy Cô có thể đăng nhập ngay với mật khẩu mới.`,
  };
};
