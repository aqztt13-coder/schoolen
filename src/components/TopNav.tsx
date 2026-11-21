import { LogOut } from 'lucide-react';

export type PortalTab = 'student' | 'edit' | 'records';

interface TopNavProps {
  activeTab: PortalTab;
  onNavigate: (tab: PortalTab) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function TopNav({ activeTab, onNavigate, onLogout, isLoggingOut }: TopNavProps) {
  const navItems: { id: PortalTab; label: string }[] = [
    { id: 'student', label: 'صفحة الطالب' },
    { id: 'edit', label: 'تحديث البيانات' },
    { id: 'records', label: 'سجل الطلبة' },
  ];

  return (
    <header className="md:sticky md:top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('student')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        >
          مدرسة رواد العالم
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${
                  isActive
                    ? 'text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-emerald-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <LogOut className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>{isLoggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <nav
        aria-label="التنقل على الجوال"
        className="flex md:hidden items-center justify-around border-t border-slate-100 px-2 py-1.5"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
