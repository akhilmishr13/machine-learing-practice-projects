import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { TodayScreen } from './screens/TodayScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { CreativeJournalScreen } from './screens/CreativeJournalScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LoginScreen } from './screens/LoginScreen';
import { useEffect, useState } from 'react';
import { useHabitStore } from './stores/habitStore';
import { useJournalStore } from './stores/journalStore';
import { useAuthStore } from './stores/authStore';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Today', icon: '📅' },
    { path: '/calendar', label: 'Calendar', icon: '📆' },
    { path: '/journal', label: 'Journal', icon: '✏️' },
    { path: '/profile', label: 'Profile', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-14 sm:h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full touch-manipulation ${
              location.pathname === item.path
                ? 'text-primary-600'
                : 'text-gray-500'
            }`}
          >
            <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{item.icon}</span>
            <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { loadHabits } = useHabitStore();
  const { loadEntries } = useJournalStore();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      if (isAuthenticated) {
        loadHabits();
        loadEntries();
      }
    };
    init();
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 pb-16">
                <TodayScreen />
                <Navigation />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 pb-16">
                <CalendarScreen />
                <Navigation />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 pb-16">
                <CreativeJournalScreen />
                <Navigation />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 pb-16">
                <ProfileScreen />
                <Navigation />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

