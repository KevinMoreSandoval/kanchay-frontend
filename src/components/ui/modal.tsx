import {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  useId,
  type DialogHTMLAttributes,
} from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ModalProps extends DialogHTMLAttributes<HTMLDialogElement> {
  title: string;
  onClose: () => void;
}
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ title, onClose, children, className, ...props }, ref) => {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    useImperativeHandle(ref, () => dialog.current!);
    useEffect(() => {
      const node = dialog.current;
      node?.showModal();
      return () => node?.close();
    }, []);
    return (
      <dialog
        {...props}
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        className={cn(
          'fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl backdrop:bg-foreground/40 sm:p-6',
          className
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        {children}
      </dialog>
    );
  }
);
Modal.displayName = 'Modal';
