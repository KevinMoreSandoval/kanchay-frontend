import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Visual Panel decorativo */}
      <aside className="hidden lg:flex relative items-center justify-center p-12 bg-primary/10 overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-primary/20 pointer-events-none" />
        <div className="relative max-w-lg w-full flex items-center justify-center">
          <img
            src="/assets/svg/banner.svg"
            alt="CanchaYa Banner"
            className="w-full max-h-[80vh] object-contain drop-shadow-sm"
          />
        </div>
      </aside>

      {/* Panel del Formulario */}
      <main className="flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md lg:max-w-lg space-y-6">
          <div className="flex justify-center mb-2">
            <img
              src="/assets/img/logo-court.png"
              alt="CanchaYa Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
