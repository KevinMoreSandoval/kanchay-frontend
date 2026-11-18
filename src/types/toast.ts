export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  title?: string;
  /** Milisegundos. Cero mantiene el mensaje hasta cerrarlo manualmente. */
  duration?: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number;
}
