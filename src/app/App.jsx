import React, { useState } from "react";
import { useAuth } from "./hooks/use-auth"; 
import LoginPage from "./auth/login/page"; 
import RegisterPage from "./auth/register/page"; 

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
            // Si el backend devuelve token y usuario al registrarse, iniciamos sesión automáticamente:
            if (data?.token && data?.user) {
              login(data);
            } else {
              // Si solo registra sin devolver token, lo enviamos al login
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

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>¡Bienvenido, {user?.firstName || user?.name || user?.email}!</h1>
      <p>Has iniciado sesión correctamente.</p>
      
      <button 
        onClick={logout}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "1rem"
        }}
      >
        Cerrar Sesión
      </button>
    </main>
  );
}