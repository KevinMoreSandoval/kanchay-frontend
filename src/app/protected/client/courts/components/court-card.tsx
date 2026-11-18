import {
  MapPin,
  Info,
  Calendar,
  Trophy,
  Users,
  Zap,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types';

export interface CourtCardProps {
  court: Court;
  onDetails?: (id: number) => void;
  onReserve?: (id: number) => void;
}

function getFeatureIcon(feature: string): LucideIcon {
  const normalized = feature.toLowerCase();

  if (
    normalized.includes('fútbol') ||
    normalized.includes('futbol') ||
    normalized.includes('vóley') ||
    normalized.includes('voley')
  ) {
    return Trophy;
  }

  if (/^\d+$/.test(feature.trim())) {
    return Users;
  }

  if (
    normalized.includes('led') ||
    normalized.includes('iluminación') ||
    normalized.includes('reflector') ||
    normalized.includes('luz')
  ) {
    return Zap;
  }

  return BadgeCheck;
}

export function CourtCard({ court, onDetails, onReserve }: CourtCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border flex flex-col group">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {court.image ? (
          <img
            src={court.image}
            alt={court.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Trophy aria-hidden="true" className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-border">
          S/ {court.price} <span className="text-muted-foreground font-normal">/ hr</span>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-foreground leading-snug">{court.name}</h4>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{court.location}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {court.features.map((feature) => {
              const FeatureIcon = getFeatureIcon(feature);
              return (
                <Badge
                  key={`${court.id}-${feature}`}
                  variant="secondary"
                  className="gap-1 py-0.5 px-2 text-[11px] font-medium"
                >
                  <FeatureIcon className="h-3 w-3" aria-hidden="true" />
                  <span>{feature}</span>
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDetails?.(court.id)}
            className="w-full text-xs font-semibold"
          >
            <Info className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Detalles
          </Button>
          <Button
            size="sm"
            onClick={() => onReserve?.(court.id)}
            className="w-full text-xs font-semibold"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
