import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-950 shadow-sm print:hidden"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <span>وضع عدم الاتصال — يتم عرض البيانات المحفوظة</span>
    </div>
  );
}
