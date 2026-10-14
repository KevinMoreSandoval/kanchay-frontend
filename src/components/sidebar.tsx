import { useState, type CSSProperties } from 'react';
import { Clock3, LogOut, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  label: string;
  Icon?: LucideIcon;
  href?: string;
}

export interface SidebarProps {
  title?: string;
  items?: SidebarItem[];
  activeHref?: string;
  logoSrc?: string;
  logoAlt?: string;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
}

// Única fuente de verdad de las medidas del menú (desktop).
const navVars = {
  '--item-h': '56px', // alto de cada ítem
  '--item-gap': '24px', // separación (debe ser > 20px, alto de las curvas)
  '--nav-pt': '32px', // espacio superior del nav
} as CSSProperties;

export function Sidebar({
  title,
  items = [],
  activeHref,
  logoSrc = '/assets/img/logo-court.png',
  logoAlt = 'CanchaYa',
  onLogout,
  onNavigate,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeIndex = items.findIndex((item) => item.href && item.href === activeHref);

  return (
    <aside
      className={cn(
        'relative z-20 flex w-full shrink-0 flex-col overflow-visible bg-primary transition-[width] duration-300 ease-in-out md:sticky md:top-0 md:h-screen',
        isExpanded ? 'md:w-64' : 'md:w-20'
      )}
    >
      {/* Header blanco con el logo */}
      <div className="relative z-20 flex min-h-20 items-center justify-between gap-1 border-b border-border bg-background px-2 md:px-2">
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <img
            src={logoSrc}
            alt={logoAlt}
            className="h-10 w-full max-w-36 shrink-0 object-contain"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-label={isExpanded ? 'Contraer menú lateral' : 'Expandir menú lateral'}
          aria-expanded={isExpanded}
          className="h-8 w-8 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
        >
          {isExpanded ? (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* pr-0 en desktop: la pestaña activa llega hasta el borde derecho */}
      <nav
        style={navVars}
        aria-label="Menú principal"
        className="relative grid grid-cols-3 gap-1.5 px-2 pb-3 pt-3 md:flex md:flex-col md:gap-[var(--item-gap)] md:pb-0 md:pl-4 md:pr-0 md:pt-[var(--nav-pt)]"
      >
        {/* Pestaña blanca deslizante con curvas cóncavas (solo desktop) */}
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            style={{
              transform: `translateY(calc(${activeIndex} * (var(--item-h) + var(--item-gap))))`,
            }}
            className={cn(
              'pointer-events-none absolute left-4 right-0 top-[var(--nav-pt)] z-0 hidden h-[var(--item-h)] rounded-l-2xl bg-background text-background md:block',
              'transition-transform duration-300 ease-in-out motion-reduce:transition-none',
              // Curva superior
              "before:absolute before:-top-5 before:right-0 before:h-5 before:w-5 before:content-['']",
              'before:[background:radial-gradient(circle_at_top_left,transparent_20px,currentColor_20.5px)]',
              // Curva inferior
              "after:absolute after:-bottom-5 after:right-0 after:h-5 after:w-5 after:content-['']",
              'after:[background:radial-gradient(circle_at_bottom_left,transparent_20px,currentColor_20.5px)]'
            )}
          />
        )}

        {items.map(({ label, Icon, href }) => {
          const isActive = href !== undefined && href === activeHref;

          return (
            <button
              key={label}
              type="button"
              onClick={() => href && onNavigate?.(href)}
              aria-current={isActive ? 'page' : undefined}
              title={!isExpanded ? label : undefined}
              className={cn(
                'relative z-10 flex h-[var(--item-h)] cursor-pointer min-w-0 items-center justify-center gap-3 rounded-lg px-2 text-xs font-semibold',
                'transition-colors duration-300 motion-reduce:transition-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50',
                'md:justify-start md:px-4 md:text-base',
                isActive
                  ? // mobile: fondo propio; desktop: lo pone la pestaña deslizante
                    'bg-background text-primary md:bg-transparent'
                  : 'text-primary-foreground hover:bg-primary-foreground/10',
                !isExpanded && 'md:justify-center md:px-0'
              )}
            >
              {Icon && <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />}
              <span className={cn('truncate', !isExpanded && 'hidden')}>{label}</span>
            </button>
          );
        })}
      </nav>

      {title && (
        <div
          className={cn(
            'mx-3 mb-4 mt-6 hidden items-center gap-2.5 rounded-lg bg-primary-foreground/10 px-3 py-3 text-xs font-semibold text-primary-foreground/80 md:flex',
            !isExpanded && 'justify-center px-0'
          )}
          title={!isExpanded ? title : undefined}
        >
          <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={cn('truncate', !isExpanded && 'hidden')}>{title}</span>
        </div>
      )}

      {onLogout && (
        <div className="mt-auto border-t border-primary-foreground/20 p-4">
          <button
            type="button"
            onClick={onLogout}
            title={!isExpanded ? 'Cerrar sesión' : undefined}
            className={cn(
              'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50',
              !isExpanded && 'justify-center px-0'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={cn(!isExpanded && 'hidden')}>Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
}
