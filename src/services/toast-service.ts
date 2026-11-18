import type { ToastNotification, ToastOptions, ToastVariant } from '@/types/toast';

const EMPTY: readonly ToastNotification[] = [];
const DEFAULT_DURATION = { success: 5000, error: 9000, info: 6000, warning: 8000 };

/** Store de notificaciones independiente de rutas, formularios y persistencia. */
export function createToastStore() {
  let items: readonly ToastNotification[] = EMPTY;
  let sequence = 0;
  const listeners = new Set<() => void>();
  const timers = new Map<
    string,
    {
      handle?: ReturnType<typeof setTimeout>;
      remaining: number;
      started: number;
      pauses: Set<string>;
    }
  >();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function dismiss(id: string) {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer.handle);
    timers.delete(id);
    const next = items.filter((item) => item.id !== id);
    if (next.length !== items.length) {
      items = next;
      emit();
    }
  }

  function start(id: string) {
    const timer = timers.get(id);
    if (!timer || timer.pauses.size) return;
    timer.started = Date.now();
    timer.handle = setTimeout(() => dismiss(id), timer.remaining);
  }

  function show(message: string, variant: ToastVariant, options: ToastOptions = {}): string {
    if (!message.trim()) return '';
    const previous = items.find((item) =>
      options.id
        ? item.id === options.id
        : item.message === message && item.variant === variant && item.title === options.title
    );
    const id = options.id ?? previous?.id ?? `toast-${++sequence}`;
    const requested = options.duration ?? DEFAULT_DURATION[variant];
    const duration = Number.isFinite(requested)
      ? Math.max(0, requested)
      : DEFAULT_DURATION[variant];
    const notification: ToastNotification = {
      id,
      message,
      variant,
      title: options.title,
      duration,
    };
    const oldTimer = timers.get(id);
    if (oldTimer) clearTimeout(oldTimer.handle);
    timers.delete(id);
    items = [...items.filter((item) => item.id !== id), notification];
    if (duration > 0) {
      timers.set(id, {
        remaining: duration,
        started: Date.now(),
        pauses: oldTimer?.pauses ?? new Set(),
      });
      start(id);
    }
    while (items.length > 4) dismiss(items[0].id);
    emit();
    return id;
  }

  return {
    show,
    success: (message: string, options?: ToastOptions) => show(message, 'success', options),
    error: (message: string, options?: ToastOptions) => show(message, 'error', options),
    info: (message: string, options?: ToastOptions) => show(message, 'info', options),
    warning: (message: string, options?: ToastOptions) => show(message, 'warning', options),
    dismiss,
    clear: () => {
      timers.forEach((timer) => clearTimeout(timer.handle));
      timers.clear();
      items = EMPTY;
      emit();
    },
    pause: (id: string, reason: string) => {
      const timer = timers.get(id);
      if (!timer || timer.pauses.has(reason)) return;
      if (!timer.pauses.size) {
        clearTimeout(timer.handle);
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
      }
      timer.pauses.add(reason);
    },
    resume: (id: string, reason: string) => {
      const timer = timers.get(id);
      if (!timer?.pauses.delete(reason)) return;
      if (!timer.pauses.size) start(id);
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => items,
    getServerSnapshot: () => EMPTY,
  };
}

export const toast = createToastStore();

/** Publica el mensaje y conserva el valor para estados que controlan formularios o reintentos. */
export function notifyToast<T extends string | null>(message: T, variant: ToastVariant): T {
  if (message) toast.show(message, variant);
  return message;
}
