// src/app/protected/client/components/client-navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Ticket, ChevronDown, Trophy } from 'lucide-react';
import type { User, Reservation } from '@/types';
import { getReservations } from '@/services/local-data-service';

interface ClientNavbarProps {
  user?: User | null;
  onLogout?: () => void;
  onViewMyReservations?: () => void;
  onGoHome?: () => void;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
  user,
  onLogout,
  onViewMyReservations,
  onGoHome,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reservationsCount, setReservationsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCount = () => {
      const reservations: Reservation[] = getReservations();
      setReservationsCount(reservations.length);
    };

    fetchCount();
    window.addEventListener('storage', fetchCount);
    return () => window.removeEventListener('storage', fetchCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A';
  const lastNameInitial = user?.lastName ? user.lastName.charAt(0).toUpperCase() : 'L';
  const fullName = `${user?.firstName || 'Anthony'} ${user?.lastName || 'Landa'}`.trim();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo CanchaYa */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer group focus:outline-none"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            cancha<span className="text-blue-600">YA</span>
          </span>
        </button>

        {/* Menú de Usuario */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
            aria-expanded={isMenuOpen}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200 shrink-0">
              {userInitial}
              {lastNameInitial}
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-sm font-bold text-slate-800 block leading-tight">
                {fullName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">Cliente</span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Menú Desplegable */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-slate-800">{fullName}</p>
                <p className="text-[10px] text-slate-400">Cliente registrado</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onViewMyReservations?.();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span>Mis Reservas</span>
                </div>
                {reservationsCount > 0 ? (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {reservationsCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Sin reservas</span>
                )}
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
