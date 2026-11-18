import { useEffect, useState } from 'react';

function activeHost(): HTMLElement {
  const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog[open]');
  return dialogs[dialogs.length - 1] ?? document.body;
}

/** Los diálogos nativos están en la capa superior; las notificaciones deben vivir dentro de ella. */
export function useToastHost() {
  const [host, setHost] = useState(activeHost);
  useEffect(() => {
    const observer = new MutationObserver(() => setHost(activeHost()));
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    });
    return () => observer.disconnect();
  }, []);
  return host;
}
