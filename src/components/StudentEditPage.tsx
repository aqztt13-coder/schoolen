import { useState, type FormEvent } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import {
  ACADEMIC_TRACKS,
  GRADE_LEVELS,
  SECTIONS,
  validateProfileUpdate,
  type PublicStudent,
} from '../utils/studentLogic';
import { ApiError, updateCurrentStudentApi } from '../utils/api';

interface StudentEditPageProps {
  student: PublicStudent;
  onUpdated: (updated: PublicStudent) => void;
  onCancel: () => void;
}

export function StudentEditPage({ student, onUpdated, onCancel }: StudentEditPageProps) {
  const [fullName, setFullName] = useState(student.fullName);
  const [grade, setGrade] = useState(student.grade);
  const [section, setSection] = useState(student.section);
  const [track, setTrack] = useState(student.track);
  const [guardianPhone, setGuardianPhone] = useState(student.guardianPhone);
  const [city, setCity] = useState(student.city);
  const [notes, setNotes] = useState(student.notes);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const payload = {
      fullName,
      grade,
      section,
      track,
      guardianPhone,
      city,
      notes,
    };

    const validation = validateProfileUpdate(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setFormError('يرجى مراجعة الحقول الموضحة قبل الحفظ.');
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const updated = await updateCurrentStudentApi(payload);
      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError('تعذر حفظ التعديلات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            تحديث بيانات الطالب
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            تُحدّث التعديلات مباشرة في صفحتك الخاصة وسجل طلبة مدرسة رواد العالم.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span>عودة لصفحتي</span>
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        {formError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="edit-fullname"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                الاسم الكامل للطالب
              </label>
              <input
                id="edit-fullname"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-grade"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                الصف الدراسي
              </label>
              <select
                id="edit-grade"
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
                <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.grade}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-section"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                الشعبة
              </label>
              <select
                id="edit-section"
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
                <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.section}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="edit-track"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                المسار الدراسي
              </label>
              <select
                id="edit-track"
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
                <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.track}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-phone"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                هاتف ولي الأمر
              </label>
              <input
                id="edit-phone"
                name="guardianPhone"
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 tabular-nums focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
              />
              {fieldErrors.guardianPhone && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  {fieldErrors.guardianPhone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-city"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                المدينة / الحي
              </label>
              <input
                id="edit-city"
                name="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
              />
              {fieldErrors.city && (
                <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.city}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="edit-notes"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                الملاحظات والأنشطة الطلابية
              </label>
              <textarea
                id="edit-notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 whitespace-nowrap"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              إلغاء
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
