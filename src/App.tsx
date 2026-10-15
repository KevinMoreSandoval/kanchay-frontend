import { lazy, Suspense, useState } from 'react';
import { useAuth } from './hooks/use-auth';
import LoginPage from './app/auth/login/page';
import RegisterPage from './app/auth/register/page';
import ClientPage from './app/protected/client/page';
import ReceptionDashboard from './app/protected/recepcionist/page';
const AdminPage = lazy(() => import('./app/protected/admin/page'));
import { Loading } from '@/components/ui';
import type { UserRole, AuthSession } from '@/types';
import type { LoginCredentials } from './services/auth-service';

function getRequestedRole(): UserRole | null {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/recepcionista') return 'Recepcionista';
  if (path === '/admin') return 'Administrador';
  return null;
}

export default function App() {
  const { user, loading, isAuthenticated, login, logout, acceptSession } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [screenLoading, setScreenLoading] = useState<'login' | 'logout' | null>(null);
  const requestedRole = getRequestedRole();

  const handleLogin = async (credentials: LoginCredentials): Promise<AuthSession> => {
    setScreenLoading('login');
    try {
      const data = await login(credentials);
      if (requestedRole && data.user.role !== requestedRole) {
        logout();
        throw new Error(`Este correo no tiene permisos para el módulo de ${requestedRole}.`);
      }
      return data;
    } finally {
      setScreenLoading(null);
    }
  };

  const handleLogout = async () => {
    setScreenLoading('logout');
    await new Promise<void>((resolve) => window.setTimeout(resolve, 200));
    logout();
    setScreenLoading(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-semibold text-muted-foreground">
        <Loading label="Cargando CanchaYa..." />
      </div>
    );
  }

  let page: React.ReactNode;

  if (!isAuthenticated || !user || (requestedRole && user.role !== requestedRole)) {
    if (currentView === 'register') {
      page = (
        <RegisterPage
          onRegisterSuccess={(data: AuthSession) => {
            if (data?.token && data?.user) {
              if (requestedRole && data.user.role !== requestedRole) {
                setCurrentView('login');
                return;
              }
              acceptSession(data);
            } else {
              setCurrentView('login');
            }
          }}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      );
    } else {
      page = (
        <LoginPage
          onLoginSuccess={handleLogin}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      );
    }
  } else if (user.role === 'Administrador') {
    page = <AdminPage user={user} onLogout={handleLogout} />;
  } else if (user.role === 'Recepcionista') {
    page = <ReceptionDashboard user={user} onLogout={handleLogout} />;
  } else {
    page = <ClientPage user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      <Suspense fallback={<Loading label="Cargando módulo..." />}>{page}</Suspense>
      {screenLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 text-foreground backdrop-blur-sm">
          <Loading
            label={screenLoading === 'logout' ? 'Cerrando sesión...' : 'Iniciando sesión...'}
            className="font-semibold"
          />
        </div>
      )}
    </>
  );
}
