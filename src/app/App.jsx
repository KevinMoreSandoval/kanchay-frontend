import React, { useState } from "react";
import { useAuth } from "./hooks/use-auth"; 
import LoginPage from "./auth/login/page"; 
import RegisterPage from "./auth/register/page"; 
import ClientPage from "./protected/client/page"; // 1. Importa tu vista de cliente

export default function App() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState("login"); // 'login' | 'register'

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentView === "register") {
      return (
        <RegisterPage 
          onRegisterSuccess={(data) => {
            if (data?.token && data?.user) {
              login(data);
            } else {
              setCurrentView("login");
            }
          }}
          onNavigateToLogin={() => setCurrentView("login")}
        />
      );
    }

    return (
      <LoginPage 
        onLoginSuccess={login} 
        onNavigateToRegister={() => setCurrentView("register")}
      />
    );
  }

  // 2. Reemplaza el bloque antiguo de bienvenida por tu ClientPage
  return <ClientPage user={user} onLogout={logout} />;
}