export const GRADE_LEVELS = [
  'الأول المتوسط',
  'الثاني المتوسط',
  'الثالث المتوسط',
  'الأول الثانوي',
  'الثاني الثانوي',
  'الثالث الثانوي',
] as const;

export const SECTIONS = ['أ', 'ب', 'ج', 'د'] as const;

export const ACADEMIC_TRACKS = [
  'المسار العام',
  'العلوم الطبيعية والهندسة',
  'علوم الحاسب والتقنية',
  'الإدارة والعلوم الإنسانية',
] as const;

export interface PublicStudent {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  grade: string;
  section: string;
  track: string;
  guardianPhone: string;
  city: string;
  notes: string;
  enrollmentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredStudent extends PublicStudent {
  passwordHash: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  studentCode?: string;
  grade: string;
  section: string;
  track: string;
  guardianPhone: string;
  city: string;
  notes?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface UpdateProfileInput {
  fullName: string;
  grade: string;
  section: string;
  track: string;
  guardianPhone: string;
  city: string;
  notes: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeStudentCode(code: string): string {
  return code.trim().toUpperCase();
}

export function generateStudentCode(existingCodes: string[], year = 2026): string {
  const prefix = `RA-${year}-`;
  let maxNumber = 100;
  for (const code of existingCodes) {
    if (code.startsWith(prefix)) {
      const parsed = Number.parseInt(code.slice(prefix.length), 10);
      if (Number.isFinite(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }
  return `${prefix}${maxNumber + 1}`;
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?\d{9,15}|05\d{8}|07\d{9})$/.test(cleaned);
}

export function validateRegisterInput(input: RegisterInput): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = input.fullName.trim();
  if (!fullName) {
    errors.fullName = 'يرجى إدخال الاسم الكامل للطالب.';
  } else if (fullName.length < 4) {
    errors.fullName = 'يجب أن يتكون الاسم الكامل من 4 أحرف على الأقل.';
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    errors.email = 'يرجى إدخال البريد الإلكتروني.';
  } else if (!isValidEmail(email)) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة.';
  }

  if (!input.grade.trim()) {
    errors.grade = 'يرجى اختيار الصف الدراسي.';
  }

  if (!input.section.trim()) {
    errors.section = 'يرجى اختيار الشعبة.';
  }

  if (!input.track.trim()) {
    errors.track = 'يرجى اختيار المسار الدراسي.';
  }

  const phone = input.guardianPhone.trim();
  if (!phone) {
    errors.guardianPhone = 'يرجى إدخال رقم هاتف ولي الأمر.';
  } else if (!isValidPhone(phone)) {
    errors.guardianPhone = 'رقم الهاتف غير صالح (مثال: 0501234567).';
  }

  if (!input.city.trim()) {
    errors.city = 'يرجى إدخال المدينة أو الحي السكني.';
  }

  if (!input.password) {
    errors.password = 'يرجى إدخال كلمة المرور.';
  } else if (input.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.';
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = 'يرجى تأكيد كلمة المرور.';
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(input: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.identifier.trim()) {
    errors.identifier = 'يرجى إدخال البريد الإلكتروني أو الرقم المدرسي.';
  }

  if (!input.password) {
    errors.password = 'يرجى إدخال كلمة المرور.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProfileUpdate(input: UpdateProfileInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName.trim() || input.fullName.trim().length < 4) {
    errors.fullName = 'يجب أن يتكون الاسم الكامل من 4 أحرف على الأقل.';
  }
  if (!input.grade.trim()) {
    errors.grade = 'يرجى تحديد الصف الدراسي.';
  }
  if (!input.section.trim()) {
    errors.section = 'يرجى تحديد الشعبة.';
  }
  if (!input.track.trim()) {
    errors.track = 'يرجى تحديد المسار الدراسي.';
  }
  if (!input.guardianPhone.trim() || !isValidPhone(input.guardianPhone)) {
    errors.guardianPhone = 'رقم هاتف ولي الأمر غير صالح.';
  }
  if (!input.city.trim()) {
    errors.city = 'يرجى إدخال المدينة.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function toPublicStudent(record: StoredStudent): PublicStudent {
  const { passwordHash: _removed, ...publicFields } = record;
  return publicFields;
}

export function filterStudents(
  students: PublicStudent[],
  query: string,
  gradeFilter: string,
): PublicStudent[] {
  const q = query.trim().toLowerCase();
  return students.filter((student) => {
    const matchesGrade = !gradeFilter || gradeFilter === 'all' || student.grade === gradeFilter;
    if (!matchesGrade) return false;
    if (!q) return true;
    return (
      student.fullName.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q) ||
      student.studentCode.toLowerCase().includes(q) ||
      student.city.toLowerCase().includes(q)
    );
  });
}

export function formatArabicDate(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}
