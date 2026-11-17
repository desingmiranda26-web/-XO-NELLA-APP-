import React from 'react';
import { BellRing, X } from 'lucide-react';

interface NotificationBannerProps {
  banner: {
    id: string;
    title: string;
    message: string;
  } | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  banner,
  onDismiss,
}) => {
  if (!banner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-20 left-4 z-50 mx-auto max-w-md rounded-2xl border border-[#9B4DFF] bg-[#2D0A4E] p-4 shadow-2xl shadow-black/60 sm:left-auto lg:right-6 lg:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6A0DAD] text-[#F5F2EB]">
            <BellRing className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#F5F2EB]">{banner.title}</p>
            <p className="mt-0.5 text-xs text-[#D6D0C4]">{banner.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#D6D0C4] hover:bg-[#121212]/40 hover:text-[#F5F2EB]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
