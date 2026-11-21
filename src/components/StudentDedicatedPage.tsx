import { CheckCircle2, Edit3, Printer, Users } from 'lucide-react';
import { formatArabicDate, type PublicStudent } from '../utils/studentLogic';
import { PWAInstallButton } from './PWAInstallButton';
import type { PortalTab } from './TopNav';

const CREST_IMAGE_URL = '/src/assets/images/rowad_school_crest_1794898618509.jpg';

interface StudentDedicatedPageProps {
  student: PublicStudent;
  justTransferred: boolean;
  onDismissBanner: () => void;
  onNavigate: (tab: PortalTab) => void;
}

export function StudentDedicatedPage({
  student,
  justTransferred,
  onDismissBanner,
  onNavigate,
}: StudentDedicatedPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Transfer Confirmation Notice */}
      {justTransferred && (
        <div
          role="status"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between print:hidden"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">
                تم إنشاء حسابك وترحيل بياناتك بنجاح إلى صفحتك الخاصة
              </p>
              <p className="mt-0.5 text-xs text-emerald-800">
                رقمك المدرسي المعتمد هو{' '}
                <span className="font-semibold tracking-wide tabular-nums" dir="ltr">{student.studentCode}</span>{' '}
                ويمكنك استخدامه مستقبلاً لتسجيل الدخول.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissBanner}
            className="self-start rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 sm:self-center whitespace-nowrap"
          >
            إخفاء التنبيه
          </button>
        </div>
      )}

      {/* Main Dedicated Student Data Sheet */}
      <section
        aria-labelledby="student-profile-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        {/* Header Row */}
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={CREST_IMAGE_URL}
              alt="شعار مدرسة رواد العالم"
              referrerPolicy="no-referrer"
              className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover"
            />
            <div>
              <p className="text-xs font-medium text-slate-500">
                بطاقة الطالب المرحّلة · مدرسة رواد العالم
              </p>
              <h1
                id="student-profile-heading"
                className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl"
              >
                {student.fullName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>{student.grade}</span>
                <span aria-hidden="true">·</span>
                <span>شعبة {student.section}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>{student.enrollmentStatus}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => onNavigate('edit')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              <span>تحديث البيانات</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <Printer className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>طباعة البطاقة</span>
            </button>
            <PWAInstallButton variant="subtle" />
          </div>
        </div>

        {/* Structured Two-Column Transferred Data Grid (no nested cards) */}
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              البيانات الأكاديمية
            </h2>
            <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">الرقم المدرسي</dt>
                <dd className="font-semibold tracking-wide text-slate-900 tabular-nums" dir="ltr">
                  {student.studentCode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">الصف الدراسي</dt>
                <dd className="font-medium text-slate-900">{student.grade}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">الشعبة</dt>
                <dd className="font-medium text-slate-900">شعبة {student.section}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">المسار الدراسي</dt>
                <dd className="font-medium text-slate-900">{student.track}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">حالة القيد</dt>
                <dd className="font-medium text-emerald-800">{student.enrollmentStatus}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              بيانات التواصل والتسجيل
            </h2>
            <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">البريد الإلكتروني</dt>
                <dd className="text-slate-900 truncate" dir="ltr">
                  {student.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">هاتف ولي الأمر</dt>
                <dd className="font-medium tracking-wide text-slate-900 tabular-nums" dir="ltr">
                  {student.guardianPhone}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">المدينة / الحي</dt>
                <dd className="font-medium text-slate-900">{student.city}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">تاريخ الترحيل</dt>
                <dd className="text-slate-900 tabular-nums">
                  {formatArabicDate(student.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-slate-500">آخر تحديث</dt>
                <dd className="text-slate-900 tabular-nums">
                  {formatArabicDate(student.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            الملاحظات والأنشطة الطلابية
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {student.notes ? student.notes : 'لا توجد ملاحظات مسجلة حالياً.'}
          </p>
        </div>

        {/* Bottom Directory Link */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <p className="text-xs text-slate-500">
            تُحفظ جميع التعديلات في قاعدة بيانات مدرسة رواد العالم وتظهر فوراً في السجل العام للطلبة.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('records')}
            className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 sm:self-auto whitespace-nowrap"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>عرض سجل الطلبة المرحّلين</span>
          </button>
        </div>
      </section>
    </main>
  );
}
