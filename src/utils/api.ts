import type {
  LoginInput,
  PublicStudent,
  RegisterInput,
  UpdateProfileInput,
} from './studentLogic';

const TOKEN_STORAGE_KEY = 'rowad_auth_token';
const CACHED_STUDENT_KEY = 'rowad_cached_student';
const CACHED_STUDENTS_KEY = 'rowad_cached_students';

export function getStoredToken(): string {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string): void {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota/access errors
  }
}

function readCachedJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCachedJson(key: string, value: unknown): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors
  }
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      typeof data.error === 'string' ? data.error : 'حدث خطأ أثناء الاتصال بالخادم.',
      response.status,
      typeof data.fieldErrors === 'object' && data.fieldErrors ? data.fieldErrors : {},
    );
  }
  return data as T;
}

export async function loginStudentApi(
  payload: LoginInput,
): Promise<{ student: PublicStudent; token: string }> {
  const result = await apiRequest<{ student: PublicStudent; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredToken(result.token);
  writeCachedJson(CACHED_STUDENT_KEY, result.student);
  return result;
}

export async function registerStudentApi(
  payload: RegisterInput,
): Promise<{ student: PublicStudent; token: string }> {
  const result = await apiRequest<{ student: PublicStudent; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredToken(result.token);
  writeCachedJson(CACHED_STUDENT_KEY, result.student);
  return result;
}

export async function fetchCurrentStudentApi(): Promise<PublicStudent | null> {
  try {
    const result = await apiRequest<{ student: PublicStudent | null }>('/api/auth/me');
    if (!result.student) {
      setStoredToken('');
      writeCachedJson(CACHED_STUDENT_KEY, null);
      return null;
    }
    writeCachedJson(CACHED_STUDENT_KEY, result.student);
    return result.student;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network/offline fallback: return last cached authenticated student if token exists
    if (getStoredToken()) {
      return readCachedJson<PublicStudent>(CACHED_STUDENT_KEY);
    }
    return null;
  }
}

export async function updateCurrentStudentApi(
  payload: UpdateProfileInput,
): Promise<PublicStudent> {
  const result = await apiRequest<{ student: PublicStudent }>('/api/students/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  writeCachedJson(CACHED_STUDENT_KEY, result.student);
  return result.student;
}

export async function fetchAllStudentsApi(): Promise<PublicStudent[]> {
  try {
    const result = await apiRequest<{ students: PublicStudent[] }>('/api/students');
    writeCachedJson(CACHED_STUDENTS_KEY, result.students);
    return result.students;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    const cached = readCachedJson<PublicStudent[]>(CACHED_STUDENTS_KEY);
    if (cached) return cached;
    throw err;
  }
}

export async function logoutStudentApi(): Promise<void> {
  try {
    await apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  } finally {
    setStoredToken('');
    writeCachedJson(CACHED_STUDENT_KEY, null);
    writeCachedJson(CACHED_STUDENTS_KEY, null);
  }
}
