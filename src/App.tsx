import { useEffect, useState } from 'react';
import { AuthScreen, type AuthMode } from './components/AuthScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StudentDedicatedPage } from './components/StudentDedicatedPage';
import { StudentEditPage } from './components/StudentEditPage';
import { StudentsDirectoryPage } from './components/StudentsDirectoryPage';
import { TopNav, type PortalTab } from './components/TopNav';
import { fetchCurrentStudentApi, logoutStudentApi } from './utils/api';
import type { PublicStudent } from './utils/studentLogic';

function readInitialRoute(): { authMode: AuthMode; portalTab: PortalTab } {
  const path = window.location.pathname;
  if (path === '/register') return { authMode: 'register', portalTab: 'student' };
  if (path === '/edit') return { authMode: 'login', portalTab: 'edit' };
  if (path === '/records') return { authMode: 'login', portalTab: 'records' };
  return { authMode: 'login', portalTab: 'student' };
}

function pushPath(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
}

export default function App() {
  const initial = readInitialRoute();
  const [student, setStudent] = useState<PublicStudent | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>(initial.authMode);
  const [portalTab, setPortalTab] = useState<PortalTab>(initial.portalTab);
  const [justTransferred, setJustTransferred] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCurrentStudentApi()
      .then((loaded) => {
        if (!active) return;
        setStudent(loaded);
        if (loaded && (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/register')) {
          pushPath('/student');
        }
      })
      .catch(() => {
        if (!active) return;
        setStudent(null);
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });

    function handlePopState() {
      const next = readInitialRoute();
      setAuthMode(next.authMode);
      setPortalTab(next.portalTab);
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      active = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function handleAuthModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode);
    pushPath(nextMode === 'register' ? '/register' : '/login');
  }

  function handleAuthenticated(loggedInStudent: PublicStudent, isNewRegistration: boolean) {
    setStudent(loggedInStudent);
    setJustTransferred(isNewRegistration);
    setPortalTab('student');
    pushPath('/student');
  }

  function handlePortalNavigate(tab: PortalTab) {
    setPortalTab(tab);
    if (tab === 'student') pushPath('/student');
    else if (tab === 'edit') pushPath('/edit');
    else pushPath('/records');
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutStudentApi();
      setStudent(null);
      setJustTransferred(false);
      setAuthMode('login');
      pushPath('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-800" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            جارٍ تحميل منصة مدرسة رواد العالم...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <>
        <AuthScreen
          mode={authMode}
          onModeChange={handleAuthModeChange}
          onAuthenticated={handleAuthenticated}
        />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900">
      <TopNav
        activeTab={portalTab}
        onNavigate={handlePortalNavigate}
        onLogout={() => void handleLogout()}
        isLoggingOut={isLoggingOut}
      />

      {portalTab === 'student' && (
        <StudentDedicatedPage
          student={student}
          justTransferred={justTransferred}
          onDismissBanner={() => setJustTransferred(false)}
          onNavigate={handlePortalNavigate}
        />
      )}

      {portalTab === 'edit' && (
        <StudentEditPage
          student={student}
          onUpdated={(updated) => {
            setStudent(updated);
            setJustTransferred(false);
            handlePortalNavigate('student');
          }}
          onCancel={() => handlePortalNavigate('student')}
        />
      )}

      {portalTab === 'records' && (
        <StudentsDirectoryPage currentStudentId={student.id} />
      )}
      <OfflineIndicator />
    </div>
  );
}
