import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from '@/components/ui/toast';
import { toast } from '@/services/toast-service';
import { useToastHost } from '@/hooks/use-toast-host';

export function Toaster() {
  const items = useSyncExternalStore(toast.subscribe, toast.getSnapshot, toast.getServerSnapshot);
  const host = useToastHost();
  useEffect(() => {
    // Al mover el portal fuera de un diálogo no siempre se emiten blur/pointerleave.
    toast.getSnapshot().forEach((item) => {
      toast.resume(item.id, 'pointer');
      toast.resume(item.id, 'focus');
    });
  }, [host]);
  return createPortal(
    <section
      aria-label="Notificaciones"
      aria-live="polite"
      aria-relevant="additions text"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex max-h-dvh flex-col gap-3 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:w-[26rem]"
    >
      {items.map((item) => (
        <Toast
          key={item.id}
          notification={item}
          onDismiss={() => toast.dismiss(item.id)}
          onPointerEnter={() => toast.pause(item.id, 'pointer')}
          onPointerLeave={() => toast.resume(item.id, 'pointer')}
          onFocusCapture={() => toast.pause(item.id, 'focus')}
          onBlurCapture={(event) => {
            if (
              !(event.relatedTarget instanceof Node) ||
              !event.currentTarget.contains(event.relatedTarget)
            )
              toast.resume(item.id, 'focus');
          }}
        />
      ))}
    </section>,
    host
  );
}
