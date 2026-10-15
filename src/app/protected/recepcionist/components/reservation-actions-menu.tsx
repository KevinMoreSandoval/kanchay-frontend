import {
  CalendarClock,
  ChevronDown,
  CircleCheck,
  CreditCard,
  Receipt,
  Undo2,
  UserCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { ReservationAction, ReservationActionType } from '@/services/reservation-service';

const actionIcons: Record<ReservationActionType, LucideIcon> = {
  confirm: CircleCheck,
  attendance: UserCheck,
  cancel: XCircle,
  reschedule: CalendarClock,
  pay: CreditCard,
  refund: Undo2,
  surcharge: Receipt,
};

export interface ReservationActionsMenuProps {
  reservationId: number;
  client: string;
  actions: ReservationAction[];
  onSelect: (action: ReservationAction) => void;
}

export function ReservationActionsMenu({
  reservationId,
  client,
  actions,
  onSelect,
}: ReservationActionsMenuProps) {
  const regular = actions.filter((action) => action.type !== 'cancel');
  const cancellation = actions.find((action) => action.type === 'cancel');
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Acciones de la reserva #${reservationId} de ${client}`}
          className="h-9 gap-2 bg-card font-medium data-[state=open]:bg-accent"
        >
          Acciones
          <ChevronDown aria-hidden="true" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        avoidCollisions={false}
        align="end"
        className="max-h-none w-64 max-w-[calc(100vw-2rem)] overflow-visible"
      >
        <DropdownMenuLabel>Reserva #{reservationId}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {regular.map((action) => {
            const Icon = actionIcons[action.type];
            return (
              <DropdownMenuItem key={action.id} onSelect={() => onSelect(action)}>
                <Icon aria-hidden="true" className="text-muted-foreground" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        {cancellation && (
          <>
            {regular.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem variant="destructive" onSelect={() => onSelect(cancellation)}>
              <XCircle aria-hidden="true" />
              <span>{cancellation.label}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
