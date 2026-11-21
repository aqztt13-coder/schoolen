import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterStudents,
  generateStudentCode,
  normalizeEmail,
  toPublicStudent,
  validateLoginInput,
  validateProfileUpdate,
  validateRegisterInput,
  type PublicStudent,
  type StoredStudent,
} from './studentLogic';

test('normalizeEmail trims whitespace and lowercases', () => {
  assert.equal(normalizeEmail('  Student@Rowad.Edu.Sa  '), 'student@rowad.edu.sa');
});

test('generateStudentCode increments from highest existing code for year', () => {
  assert.equal(generateStudentCode([], 2026), 'RA-2026-101');
  assert.equal(generateStudentCode(['RA-2026-101', 'RA-2026-104'], 2026), 'RA-2026-105');
});

test('validateRegisterInput catches empty fields and mismatched passwords', () => {
  const bad = validateRegisterInput({
    fullName: '',
    email: 'invalid-email',
    grade: '',
    section: '',
    track: '',
    guardianPhone: '123',
    city: '',
    password: '123',
    confirmPassword: '456',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.password);
  assert.ok(bad.errors.confirmPassword);
  assert.ok(bad.errors.guardianPhone);
});

test('validateRegisterInput passes for valid student data', () => {
  const ok = validateRegisterInput({
    fullName: 'سارة محمد العتيبي',
    email: 'sara@rowad.edu.sa',
    grade: 'الثاني الثانوي',
    section: 'ب',
    track: 'العلوم الطبيعية والهندسة',
    guardianPhone: '0559876543',
    city: 'الرياض',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  assert.equal(ok.valid, true);
  assert.deepEqual(ok.errors, {});
});

test('validateLoginInput requires identifier and password', () => {
  const empty = validateLoginInput({ identifier: '   ', password: '' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.identifier);
  assert.ok(empty.errors.password);

  const ok = validateLoginInput({ identifier: 'RA-2026-101', password: 'Rowad2026' });
  assert.equal(ok.valid, true);
});

test('validateProfileUpdate validates updated phone and name', () => {
  const bad = validateProfileUpdate({
    fullName: 'علي',
    grade: 'الأول الثانوي',
    section: 'أ',
    track: 'المسار العام',
    guardianPhone: 'abc',
    city: 'جدة',
    notes: '',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.guardianPhone);
});

test('toPublicStudent strips passwordHash', () => {
  const stored: StoredStudent = {
    id: 'stu-1',
    studentCode: 'RA-2026-101',
    fullName: 'أحمد خالد المنصور',
    email: 'student@rowad.edu.sa',
    grade: 'الثالث الثانوي',
    section: 'أ',
    track: 'العلوم الطبيعية والهندسة',
    guardianPhone: '0501234567',
    city: 'الرياض',
    notes: 'طالب متفوق',
    enrollmentStatus: 'مقيد ومُرحّل',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    passwordHash: 'secret:hash',
  };
  const pub = toPublicStudent(stored);
  assert.equal('passwordHash' in pub, false);
  assert.equal(pub.studentCode, 'RA-2026-101');
});

test('filterStudents filters by grade and search query', () => {
  const list: PublicStudent[] = [
    {
      id: '1',
      studentCode: 'RA-2026-101',
      fullName: 'أحمد خالد المنصور',
      email: 'ahmed@rowad.edu.sa',
      grade: 'الثالث الثانوي',
      section: 'أ',
      track: 'العلوم الطبيعية والهندسة',
      guardianPhone: '0501234567',
      city: 'الرياض',
      notes: '',
      enrollmentStatus: 'مقيد ومُرحّل',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: '2',
      studentCode: 'RA-2026-102',
      fullName: 'ليلى فهد الدوسري',
      email: 'layla@rowad.edu.sa',
      grade: 'الأول الثانوي',
      section: 'ب',
      track: 'علوم الحاسب والتقنية',
      guardianPhone: '0552223344',
      city: 'جدة',
      notes: '',
      enrollmentStatus: 'مقيد ومُرحّل',
      createdAt: '2026-09-02T08:00:00.000Z',
      updatedAt: '2026-09-02T08:00:00.000Z',
    },
  ];
  assert.equal(filterStudents(list, 'ليلى', 'all').length, 1);
  assert.equal(filterStudents(list, 'RA-2026-101', 'all').length, 1);
  assert.equal(filterStudents(list, '', 'الأول الثانوي').length, 1);
  assert.equal(filterStudents(list, 'ليلى', 'الثالث الثانوي').length, 0);
});
