import React, { useState } from 'react';
import { Banknote, CheckCircle2, Coins } from 'lucide-react';
import type { Court, PaymentMethod } from '@/types';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TimeSlot } from './availability-time-slots';
import { StepHeader } from './step-header';
import { AvailabilitySummary } from './availability-summary';

interface ConfirmationStepProps {
  court: Court;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  totalAmount: number;
  onBack: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
}

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  court,
  selectedDate,
  selectedSlots,
  totalAmount,
  onBack,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE_PLIN');

  const courtName = court.name;

  const paymentOptions: PaymentOption[] = [
    {
      id: 'YAPE_PLIN',
      title: 'Yape / Plin',
      subtitle: 'Pago rápido con código QR',
      icon: (
        <div className="flex h-10 items-center gap-2" aria-hidden="true">
          <img
            src="/assets/img/metodos-pago/yape-app-logo-png_seeklogo-399697.png"
            alt=""
            className="h-9 w-9 rounded-lg object-contain"
          />
          <img
            src="/assets/img/metodos-pago/plin-logo-png_seeklogo-386806.png"
            alt=""
            className="h-9 w-9 rounded-lg object-contain"
          />
        </div>
      ),
    },
    {
      id: 'TARJETA',
      title: 'Tarjeta Débito / Crédito',
      subtitle: 'Visa, Mastercard, AMEX',
      icon: (
        <div className="flex h-10 items-center gap-2" aria-hidden="true">
          <img
            src="/assets/img/metodos-pago/Version=Logo.png"
            alt=""
            className="h-6 w-12 object-contain"
          />
          <img
            src="/assets/img/metodos-pago/Version=Logo (1).png"
            alt=""
            className="h-7 w-10 object-contain"
          />
          <img src="/assets/img/metodos-pago/Amex.png" alt="" className="h-7 w-10 object-contain" />
        </div>
      ),
    },
    {
      id: 'EFECTIVO',
      title: 'Pago en Caja (Efectivo)',
      subtitle: 'Paga al llegar a la sede',
      icon: (
        <div
          className="relative flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          aria-hidden="true"
        >
          <Banknote className="absolute left-1.5 top-1.5 h-6 w-6" strokeWidth={1.8} />
          <Coins
            className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-50"
            strokeWidth={1.8}
          />
        </div>
      ),
    },
    {
      id: 'TRANSFERENCIA',
      title: 'Transferencia Bancaria',
      subtitle: 'BCP, BBVA, Interbank, Scotiabank',
      icon: (
        <div className="flex h-10 items-center gap-1.5" aria-hidden="true">
          <img src="/assets/svg/bcp.svg" alt="" className="h-6 w-10 object-contain" />
          <img
            src="/assets/img/metodos-pago/BBVA-logo.png"
            alt=""
            className="h-5 w-10 object-contain"
          />
          <img src="/assets/svg/interbank.svg" alt="" className="h-6 w-12 object-contain" />
          <img
            src="/assets/img/metodos-pago/scotiabank-vector-logo-2022.png"
            alt=""
            className="h-5 w-14 object-contain"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <StepHeader
        title="Confirmación de Reserva"
        onBack={onBack}
        backLabel="Regresar a selección de disponibilidad"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10 items-start">
          {/* Selección de método de pago */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="border-b border-border/60 pb-4">
                <h2 className="text-base font-bold text-foreground">Elige tu método de pago</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecciona cómo deseas pagar tu reserva.
                </p>
              </div>

              {/* Opciones de pago */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paymentOptions.map((method) => {
                  const isSelected = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex min-h-36 flex-col justify-between gap-5 rounded-2xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-primary bg-primary/[0.03] shadow-sm'
                          : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/20'
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        {method.icon}
                        <CheckCircle2
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isSelected ? 'text-primary' : 'text-transparent'
                          )}
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <span className="block text-sm font-semibold text-foreground">
                          {method.title}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {method.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Columna Derecha: Resumen sincronizado con badges e idéntico estilo */}
          <aside aria-label="Resumen de la reserva" className="lg:pl-2">
            <AvailabilitySummary
              courtName={courtName}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              totalAmount={totalAmount}
              buttonText="Confirmar Reserva"
              selectedPaymentMethod={paymentMethod}
              onNext={() => onConfirm(paymentMethod)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
