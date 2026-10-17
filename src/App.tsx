import React from 'react';
import { useQuiz } from './context/QuizContext';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { RegistrationPage } from './pages/RegistrationPage';
import { QuizPage } from './pages/QuizPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { StaffPortalPage } from './pages/StaffPortalPage';

export const App: React.FC = () => {
  const { page } = useQuiz();

  // Reactive staff route state supporting /staff, /staff/, #staff, and ?staff
  const [isStaffRoute, setIsStaffRoute] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path === '/staff' || hash === '#staff' || search.includes('staff');
  });

  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsStaffRoute(path === '/staff' || hash === '#staff' || search.includes('staff'));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (isStaffRoute) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-slate-100 flex flex-col relative overflow-hidden">
        <OfflineBanner />
        <main className="flex-1 flex flex-col w-full max-w-md mx-auto z-10 pb-[env(safe-area-inset-bottom,16px)]">
          <StaffPortalPage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-72 bg-gradient-to-b from-cyan-600/15 via-blue-700/10 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 pointer-events-none blur-3xl" />

      {/* Offline banner */}
      <OfflineBanner />

      {/* Header */}
      <Header showBoothInfo={page !== 'quiz'} />

      {/* Dynamic Page Switcher */}
      <main className={`flex-1 flex flex-col w-full max-w-md mx-auto z-10 ${page === 'quiz' ? '' : 'pb-[max(1rem,env(safe-area-inset-bottom,16px))]'}`}>
        {page === 'register' && <RegistrationPage />}
        {page === 'quiz' && <QuizPage />}
        {page === 'result' && <ThankYouPage />}
      </main>

      {/* Discreet footer staff link */}
      <footer className="text-center pb-2 z-10">
        <a
          href="/staff"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/staff');
            setIsStaffRoute(true);
          }}
          className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
        >
          Booth Staff Portal
        </a>
      </footer>
    </div>
  );
};

export default App;
