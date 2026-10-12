export function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, value: T): T {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error guardando en localStorage con la clave ${key}:`, err);
  }
  return value;
}

export function removeStoredValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error eliminando de localStorage con la clave ${key}:`, err);
  }
}
