import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl border border-[#6A0DAD]/60 bg-[#2D0A4E] px-3.5 py-2 text-xs font-medium text-[#F5F2EB] shadow-lg lg:bottom-5"
    >
      <WifiOff className="h-4 w-4 text-[#F5F2EB]" aria-hidden="true" />
      <span>Modo sin conexión · Agenda guardada localmente</span>
    </div>
  );
};
