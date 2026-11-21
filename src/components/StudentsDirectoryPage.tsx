import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
  GRADE_LEVELS,
  filterStudents,
  formatArabicDate,
  type PublicStudent,
} from '../utils/studentLogic';
import { fetchAllStudentsApi } from '../utils/api';

interface StudentsDirectoryPageProps {
  currentStudentId: string;
}

export function StudentsDirectoryPage({ currentStudentId }: StudentsDirectoryPageProps) {
  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  async function loadStudents() {
    setIsLoading(true);
    setError('');
    try {
      const list = await fetchAllStudentsApi();
      setStudents(list);
    } catch {
      setError('تعذر تحميل سجل الطلبة المرحّلين حالياً.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  const filtered = filterStudents(students, query, gradeFilter);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            سجل الطلبة المرحّلين
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            بيانات الطلبة المسجلين والموثقين في منصة مدرسة رواد العالم ({students.length} طالب).
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="directory-search" className="sr-only">
              بحث بالاسم أو الرقم المدرسي أو البريد
            </label>
            <input
              id="directory-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث بالاسم أو الرقم المدرسي..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pr-9 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20 sm:w-64"
            />
          </div>

          <div>
            <label htmlFor="directory-grade" className="sr-only">
              تصفية حسب الصف الدراسي
            </label>
            <select
              id="directory-grade"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700/20 sm:w-44"
            >
              <option value="all">جميع الصفوف</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="divide-y divide-slate-100 p-6">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex items-center justify-between py-4">
                <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadStudents()}
              className="mt-4 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">
              لا توجد نتائج مطابقة لبحثك
            </p>
            <p className="mt-1 text-xs text-slate-500">
              جرّب تعديل كلمة البحث أو اختيار جميع الصفوف الدراسية.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    الرقم المدرسي
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    اسم الطالب
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    الصف والشعبة
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    المسار
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    المدينة
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    تاريخ الترحيل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isMe = item.id === currentStudentId;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50/70 ${
                        isMe ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 text-xs font-semibold tracking-wide text-slate-800 tabular-nums whitespace-nowrap" dir="ltr">
                        {item.studentCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {item.fullName}
                          {isMe && (
                            <span className="mr-2 text-xs font-medium text-emerald-800">
                              (حسابك)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500" dir="ltr">
                          {item.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                        {item.grade} · شعبة {item.section}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{item.track}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {item.city}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatArabicDate(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
