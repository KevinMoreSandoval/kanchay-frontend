import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  Clock,
  Store,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Court, User as UserType } from '@/types';
import { Button, Card, Badge } from '@/components/ui';
import type { TimeSlot } from './availability-step';

interface ConfirmationStepProps {
  court: Court;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  totalAmount: number;
  currentUser?: UserType | null;
  onBack: () => void;
  onConfirm: (
    paymentMethod: string,
    holderInfo: { fullName: string; email: string; phone: string }
  ) => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  court,
  selectedDate,
  selectedSlots,
  totalAmount,
  currentUser,
  onBack,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'YAPE_PLIN' | 'CARD' | 'CASH'>('YAPE_PLIN');

  const [fullName, setFullName] = useState(
    currentUser?.firstName
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : 'Anthony Landa'
  );
  const [email, setEmail] = useState(currentUser?.email || 'anthony.landa@canchaya.com');
  const [phone, setPhone] = useState('987654321');

  const courtData = court as unknown as Record<string, unknown>;
  const courtName = String(courtData.name || '');
  const establishment = String(
    courtData.establishmentName || courtData.establishment || 'Sede San Miguel'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(paymentMethod, { fullName, email, phone });
  };

  const paymentOptions = [
    {
      id: 'YAPE_PLIN',
      title: 'Yape / Plin',
      subtitle: 'Pago rápido con código QR',
      icon: (
        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
          <QrCode className="w-5 h-5" />
        </div>
      ),
      badge: 'Billetera Digital',
    },
    {
      id: 'CARD',
      title: 'Tarjeta Débito / Crédito',
      subtitle: 'Visa, Mastercard, AMEX',
      icon: (
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
      ),
      badge: 'Pago Online',
    },
    {
      id: 'CASH',
      title: 'Pago en Caja',
      subtitle: 'Paga al llegar a la sede',
      icon: (
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
          <Store className="w-5 h-5" />
        </div>
      ),
      badge: 'En Sede',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          aria-label="Regresar"
          className="rounded-2xl border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-slate-900">Confirmación de Reserva</h1>
          <p className="text-xs text-slate-500">
            {establishment} • {courtName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Estructura Grid de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna Izquierda: Formulario de Datos y Selección de Pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección 1: Datos del Titular */}
            <Card className="p-5 md:p-6 border-slate-100 bg-white rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-blue-600" />
                Datos del Titular de la Reserva
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Nombres y Apellidos
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-3 pl-9 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800 font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-3 pl-9 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800 font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Teléfono / Celular
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-3 pl-9 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800 font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Sección 2: Métodos de Pago con Íconos Visuales Mejorados */}
            <Card className="p-5 md:p-6 border-slate-100 bg-white rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Selecciona Método de Pago
                </h2>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pago 100% Seguro
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentOptions.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as 'YAPE_PLIN' | 'CARD' | 'CASH')}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        {method.icon}
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </div>

                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {method.title}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {method.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Columna Derecha: Tarjeta de Resumen del Pedido (Sidebar) */}
          <div className="lg:col-span-1">
            <Card className="p-5 border-blue-100 bg-white sticky top-6 space-y-5 shadow-sm rounded-3xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Resumen del Pedido</span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-blue-200 text-blue-700 bg-blue-50 font-bold"
                >
                  {selectedSlots.length} {selectedSlots.length === 1 ? 'Turno' : 'Turnos'}
                </Badge>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cancha:</span>
                  <span className="font-bold text-slate-800">{courtName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Fecha:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> {selectedDate}
                  </span>
                </div>
              </div>

              {/* Lista de Turnos */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">
                  Horarios reservados:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedSlots.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center text-xs p-2.5 bg-blue-50/70 text-blue-900 rounded-xl border border-blue-100 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" /> {s.startTime} - {s.endTime}
                      </span>
                      <span className="font-bold text-blue-700">S/ {s.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total y Botón */}
              <div className="border-t border-slate-100 pt-3 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Monto Total</span>
                  <span className="text-2xl font-black text-blue-600">
                    S/ {totalAmount.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
