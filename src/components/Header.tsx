import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  unreadAlertsCount: number;
  onJumpToReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadAlertsCount,
  onJumpToReminders,
}) => {
  return (
    <header className="border-b border-[#2D0A4E]/80 bg-[#121212]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-[#6A0DAD]/70 bg-[#121212] shadow-lg shadow-[#6A0DAD]/25 sm:h-20 sm:w-20">
            <img
              src="/src/assets/images/xo_nella_logo_1794925905909.jpg"
              alt="Logo oficial XO NELLA Nail Studio"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="sr-only h-5 w-5 text-[#F5F2EB]" />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F2EB] sm:text-4xl">
              XO NELLA
            </h1>
            <p className="mt-0.5 text-sm font-normal text-[#D6D0C4]">
              Reservas online · Agenda independiente para manicurista
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onJumpToReminders}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#2D0A4E] bg-[#1A1621] px-4 py-2 text-xs font-bold text-[#F5F2EB] transition-all duration-150 hover:border-[#6A0DAD] hover:bg-[#2D0A4E] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6A0DAD]"
            aria-label={`Ver notificaciones y recordatorios (${unreadAlertsCount} activos)`}
          >
            <Bell className="h-4 w-4 text-[#F5F2EB]" aria-hidden="true" />
            <span>Recordatorios</span>
            {unreadAlertsCount > 0 && (
              <span className="tabular-nums rounded-md bg-[#6A0DAD] px-2 py-0.5 text-[11px] font-bold text-[#F5F2EB]">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
