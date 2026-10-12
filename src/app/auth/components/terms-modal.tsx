import { Button } from '@/components/ui/button';

export interface TermsModalProps {
  title: string | null;
  onClose: () => void;
}

export function TermsModal({ title, onClose }: TermsModalProps) {
  if (!title) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm space-y-3 animate-in fade-in"
    >
      <div className="flex justify-between items-center">
        <h4 id="terms-modal-title" className="text-primary font-bold text-sm">
          {title}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
        >
          Cerrar
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Al utilizar la plataforma CanchaYa, el usuario se compromete al uso responsable de las
        instalaciones deportivas, el cumplimiento de los horarios reservados y la convivencia
        deportiva en cada una de las sedes.
      </p>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
          Entendido
        </Button>
      </div>
    </div>
  );
}
