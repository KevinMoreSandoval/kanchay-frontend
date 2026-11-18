import { Button, Loading } from './ui';

export function RemoteCollectionState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => unknown;
}) {
  if (loading) return <Loading label="Cargando datos…" />;
  if (error)
    return (
      <Button type="button" variant="outline" onClick={() => void retry()}>
        Reintentar cargar datos
      </Button>
    );
  return null;
}
