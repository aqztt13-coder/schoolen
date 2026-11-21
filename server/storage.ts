import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  generateStudentCode,
  normalizeEmail,
  normalizeStudentCode,
  toPublicStudent,
  type PublicStudent,
  type RegisterInput,
  type StoredStudent,
  type UpdateProfileInput,
} from '../src/utils/studentLogic';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface SessionRecord {
  token: string;
  studentId: string;
  createdAt: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function ensureDataFiles(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STUDENTS_FILE)) {
    const now = new Date('2026-09-01T08:00:00.000Z').toISOString();
    const seededStudents: StoredStudent[] = [
      {
        id: 'stu-seed-101',
        studentCode: 'RA-2026-101',
        fullName: 'أحمد خالد المنصور',
        email: 'student@rowad.edu.sa',
        grade: 'الثالث الثانوي',
        section: 'أ',
        track: 'العلوم الطبيعية والهندسة',
        guardianPhone: '0501234567',
        city: 'الرياض',
        notes: 'مشارك في نادي الروبوت والابتكار العلمي.',
        enrollmentStatus: 'مقيد ومُرحّل',
        createdAt: now,
        updatedAt: now,
        passwordHash: hashPassword('Rowad2026'),
      },
      {
        id: 'stu-seed-102',
        studentCode: 'RA-2026-102',
        fullName: 'سارة فهد الدوسري',
        email: 'sara.fahad@rowad.edu.sa',
        grade: 'الثاني الثانوي',
        section: 'ب',
        track: 'علوم الحاسب والتقنية',
        guardianPhone: '0554321987',
        city: 'الرياض',
        notes: 'عضو فريق الأولمبياد الوطني للبرمجة.',
        enrollmentStatus: 'مقيد ومُرحّل',
        createdAt: '2026-09-03T09:15:00.000Z',
        updatedAt: '2026-09-03T09:15:00.000Z',
        passwordHash: hashPassword('Rowad2026'),
      },
      {
        id: 'stu-seed-103',
        studentCode: 'RA-2026-103',
        fullName: 'عمر عبد الله السبيعي',
        email: 'omar.abdullah@rowad.edu.sa',
        grade: 'الأول الثانوي',
        section: 'ج',
        track: 'المسار العام',
        guardianPhone: '0548765432',
        city: 'الدمام',
        notes: 'منسق الأنشطة الثقافية للصف الأول الثانوي.',
        enrollmentStatus: 'مقيد ومُرحّل',
        createdAt: '2026-09-05T10:30:00.000Z',
        updatedAt: '2026-09-05T10:30:00.000Z',
        passwordHash: hashPassword('Rowad2026'),
      },
    ];
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(seededStudents, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readStudents(): StoredStudent[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStudents(students: StoredStudent[]): void {
  ensureDataFiles();
  fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
}

function readSessions(): SessionRecord[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: SessionRecord[]): void {
  ensureDataFiles();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

export function createSession(studentId: string): string {
  const sessions = readSessions();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.push({
    token,
    studentId,
    createdAt: new Date().toISOString(),
  });
  writeSessions(sessions);
  return token;
}

export function deleteSession(token: string): void {
  if (!token) return;
  const sessions = readSessions().filter((s) => s.token !== token);
  writeSessions(sessions);
}

export function getStudentByToken(token: string): PublicStudent | null {
  if (!token) return null;
  const session = readSessions().find((s) => s.token === token);
  if (!session) return null;
  const student = readStudents().find((s) => s.id === session.studentId);
  return student ? toPublicStudent(student) : null;
}

export function registerStudent(input: RegisterInput): {
  ok: true;
  student: PublicStudent;
  token: string;
} | {
  ok: false;
  error: string;
  field?: string;
} {
  const students = readStudents();
  const email = normalizeEmail(input.email);

  if (students.some((s) => normalizeEmail(s.email) === email)) {
    return {
      ok: false,
      error: 'هذا البريد الإلكتروني مسجل مسبقاً في منصة المدرسة.',
      field: 'email',
    };
  }

  let studentCode = input.studentCode ? normalizeStudentCode(input.studentCode) : '';
  if (studentCode) {
    if (students.some((s) => normalizeStudentCode(s.studentCode) === studentCode)) {
      return {
        ok: false,
        error: 'الرقم المدرسي المدخل مسجل لطالب آخر.',
        field: 'studentCode',
      };
    }
  } else {
    studentCode = generateStudentCode(students.map((s) => s.studentCode));
  }

  const now = new Date().toISOString();
  const newRecord: StoredStudent = {
    id: `stu-${crypto.randomUUID()}`,
    studentCode,
    fullName: input.fullName.trim(),
    email,
    grade: input.grade.trim(),
    section: input.section.trim(),
    track: input.track.trim(),
    guardianPhone: input.guardianPhone.trim(),
    city: input.city.trim(),
    notes: (input.notes ?? '').trim(),
    enrollmentStatus: 'مقيد ومُرحّل',
    createdAt: now,
    updatedAt: now,
    passwordHash: hashPassword(input.password),
  };

  students.unshift(newRecord);
  writeStudents(students);
  const token = createSession(newRecord.id);

  return {
    ok: true,
    student: toPublicStudent(newRecord),
    token,
  };
}

export function authenticateStudent(identifier: string, password: string): {
  ok: true;
  student: PublicStudent;
  token: string;
} | {
  ok: false;
  error: string;
} {
  const students = readStudents();
  const normalizedId = identifier.trim().toLowerCase();
  const match = students.find(
    (s) =>
      normalizeEmail(s.email) === normalizedId ||
      s.studentCode.toLowerCase() === normalizedId,
  );

  if (!match || !verifyPassword(password, match.passwordHash)) {
    return {
      ok: false,
      error: 'بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني أو الرقم المدرسي وكلمة المرور.',
    };
  }

  const token = createSession(match.id);
  return {
    ok: true,
    student: toPublicStudent(match),
    token,
  };
}

export function updateStudentProfile(
  studentId: string,
  updates: UpdateProfileInput,
): PublicStudent | null {
  const students = readStudents();
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) return null;

  const current = students[idx];
  const updated: StoredStudent = {
    ...current,
    fullName: updates.fullName.trim(),
    grade: updates.grade.trim(),
    section: updates.section.trim(),
    track: updates.track.trim(),
    guardianPhone: updates.guardianPhone.trim(),
    city: updates.city.trim(),
    notes: updates.notes.trim(),
    updatedAt: new Date().toISOString(),
  };

  students[idx] = updated;
  writeStudents(students);
  return toPublicStudent(updated);
}

export function listAllPublicStudents(): PublicStudent[] {
  return readStudents().map(toPublicStudent);
}
