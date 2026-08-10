import { useState, useCallback, useRef } from 'react';
import Icon, { IconName } from './Icon';

export interface ToastMessage {
  id: number;
  icon: IconName;
  text: string;
  fading?: boolean;
}

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const show = useCallback((icon: IconName, text: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, icon, text }]);
    const fadeTimer = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, fading: true } : t)));
    }, 2600);
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 3000);
    timers.current.set(id, removeTimer);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  return { toasts, show };
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.fading ? ' toast--fading' : ''}`}>
          <span className="toast__icon"><Icon name={t.icon} size={18} /></span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
