import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, GraduationCap } from 'lucide-react';
import {
  ACADEMIC_TRACKS,
  GRADE_LEVELS,
  SECTIONS,
  validateLoginInput,
  validateRegisterInput,
  type PublicStudent,
} from '../utils/studentLogic';
import { ApiError, loginStudentApi, registerStudentApi } from '../utils/api';
import { PWAInstallButton } from './PWAInstallButton';

const CAMPUS_IMAGE_URL = '/src/assets/images/rowad_campus_courtyard_1794898618341.jpg';
const CREST_IMAGE_URL = '/src/assets/images/rowad_school_crest_1794898618509.jpg';

export type AuthMode = 'login' | 'register';

interface AuthScreenProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (student: PublicStudent, isNewRegistration: boolean) => void;
}

export function AuthScreen({ mode, onModeChange, onAuthenticated }: AuthScreenProps) {
  const [campusImgFailed, setCampusImgFailed] = useState(false);
  const [crestImgFailed, setCrestImgFailed] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [grade, setGrade] = useState<string>(GRADE_LEVELS[3]);
  const [section, setSection] = useState<string>(SECTIONS[0]);
  const [track, setTrack] = useState<string>(ACADEMIC_TRACKS[0]);
  const [guardianPhone, setGuardianPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form feedback state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setFieldErrors({});
    setFormError('');
    onModeChange(nextMode);
  }

  function fillDemoCredentials() {
    setLoginIdentifier('student@rowad.edu.sa');
    setLoginPassword('Rowad2026');
    setFieldErrors({});
    setFormError('');
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const validation = validateLoginInput({
      identifier: loginIdentifier,
      password: loginPassword,
    });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const { student } = await loginStudentApi({
        identifier: loginIdentifier,
        password: loginPassword,
      });
      onAuthenticated(student, false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const payload = {
      fullName,
      email,
      studentCode: studentCode.trim() || undefined,
      grade,
      section,
      track,
      guardianPhone,
      city,
      notes,
      password,
      confirmPassword,
    };

    const validation = validateRegisterInput(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setFormError('يرجى استكمال الحقول المطلوبة بشكل صحيح قبل ترحيل البيانات.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const { student } = await registerStudentApi(payload);
      onAuthenticated(student, true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError('تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Form Column */}
        <section className="flex flex-col justify-center px-6 py-6 sm:px-10 lg:col-span-7 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            {/* School Header Lockup */}
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                {!crestImgFailed ? (
                  <img
                    src={CREST_IMAGE_URL}
                    alt="شعار مدرسة رواد العالم"
                    referrerPolicy="no-referrer"
                    onError={() => setCrestImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <GraduationCap className="h-7 w-7 text-emerald-800" aria-hidden="true" />
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  منصة طلبة مدرسة رواد العالم
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  بوابة الطالب الموحدة لتسجيل الحسابات وترحيل البيانات الأكاديمية
                </p>
              </div>
            </div>

            {/* Mode Segmented Control */}
            <div
              role="tablist"
              aria-label="اختيار نوع البوابة"
              className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`min-h-[40px] rounded-lg px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => switchMode('register')}
                className={`min-h-[40px] rounded-lg px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                  mode === 'register'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {/* Form Surface */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              {formError && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                >
                  {formError}
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      مرحباً بعودتك
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      أدخل بريدك الإلكتروني أو رقمك المدرسي للانتقال إلى صفحتك الخاصة.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="login-identifier"
                      className="mb-1.5 block text-sm font-medium text-slate-800"
                    >
                      البريد الإلكتروني أو الرقم المدرسي
                    </label>
                    <input
                      id="login-identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="student@rowad.edu.sa أو RA-2026-101"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                    />
                    {fieldErrors.identifier && (
                      <p className="mt-1.5 text-xs font-medium text-red-700">
                        {fieldErrors.identifier}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-1.5 block text-sm font-medium text-slate-800"
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        aria-label={showLoginPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        className="absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-xs font-medium text-red-700">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 whitespace-nowrap"
                    >
                      <span>{isSubmitting ? 'جارٍ تسجيل الدخول...' : 'دخول إلى صفحتي'}</span>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="min-h-[40px] rounded-lg px-3 py-2 text-xs font-medium text-emerald-800 underline-offset-4 hover:underline whitespace-nowrap"
                    >
                      تعبئة بيانات طالب تجريبي
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-5 text-sm text-slate-600">
                    <span>طالب جديد في مدرسة رواد العالم؟ </span>
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      أنشئ حسابك الآن
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      إنشاء حساب طالب جديد
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-600">
                      أكمل بياناتك ليتم حفظها وترحيلها مباشرة إلى صفحة الطالب الخاصة بك.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reg-fullname"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        الاسم الكامل للطالب
                      </label>
                      <input
                        id="reg-fullname"
                        name="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: سارة محمد العتيبي"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.fullName && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-email"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        البريد الإلكتروني
                      </label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@rowad.edu.sa"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-code"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        الرقم المدرسي (اختياري)
                      </label>
                      <input
                        id="reg-code"
                        name="studentCode"
                        type="text"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        placeholder="يُنشأ تلقائياً إن تُرك فارغاً"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.studentCode && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.studentCode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-grade"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        الصف الدراسي
                      </label>
                      <select
                        id="reg-grade"
                        name="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      >
                        {GRADE_LEVELS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.grade && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.grade}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-section"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        الشعبة
                      </label>
                      <select
                        id="reg-section"
                        name="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      >
                        {SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            شعبة {s}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.section && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.section}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reg-track"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        المسار الأكاديمي
                      </label>
                      <select
                        id="reg-track"
                        name="track"
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      >
                        {ACADEMIC_TRACKS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.track && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.track}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-phone"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        رقم هاتف ولي الأمر
                      </label>
                      <input
                        id="reg-phone"
                        name="guardianPhone"
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="0501234567"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.guardianPhone && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.guardianPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-city"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        المدينة / الحي
                      </label>
                      <input
                        id="reg-city"
                        name="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="مثال: الرياض"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.city && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reg-notes"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        اهتمامات أو ملاحظات الطالب (اختياري)
                      </label>
                      <input
                        id="reg-notes"
                        name="notes"
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="مثال: عضو النادي العلمي أو حفظ القرآن"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reg-password"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          name="password"
                          type={showRegPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="6 أحرف على الأقل"
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          aria-label={showRegPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                          className="absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
                        >
                          {showRegPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reg-confirm-password"
                        className="mb-1.5 block text-sm font-medium text-slate-800"
                      >
                        تأكيد كلمة المرور
                      </label>
                      <input
                        id="reg-confirm-password"
                        name="confirmPassword"
                        type={showRegPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 whitespace-nowrap"
                    >
                      <span>
                        {isSubmitting
                          ? 'جارٍ التسجيل وترحيل البيانات...'
                          : 'إنشاء الحساب وترحيل البيانات'}
                      </span>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <span>لديك حساب مسبقاً؟ </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      سجّل الدخول من هنا
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-4 flex justify-center">
              <PWAInstallButton variant="subtle" />
            </div>
          </div>
        </section>

        {/* Visual Showcase Column */}
        <aside className="relative hidden lg:block lg:col-span-5 bg-emerald-950">
          {!campusImgFailed ? (
            <img
              src={CAMPUS_IMAGE_URL}
              alt="مبنى ومكتبة مدرسة رواد العالم"
              referrerPolicy="no-referrer"
              onError={() => setCampusImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900 to-slate-900 p-12 text-white">
              <GraduationCap className="h-24 w-24 text-amber-300/70" aria-hidden="true" />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-xs font-medium tracking-wide text-amber-300">
              العام الدراسي 2026 – 2027
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-balance">
              ملفك المدرسي الموحد في مكان واحد
            </h2>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-200">
              بمجرد إنشاء حسابك، يتم توثيق رقمك المدرسي وترحيل جميع بياناتك الأكاديمية وبيانات
              التواصل تلقائياً إلى صفحتك الخاصة.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
