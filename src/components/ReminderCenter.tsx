import React from 'react';
import {
  AlarmClock,
  Bell,
  BellRing,
  Check,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  AgendaNotification,
  ReminderAlert,
  ReminderLeadMinutes,
} from '../types/agenda';

interface ReminderCenterProps {
  alerts: ReminderAlert[];
  notifications: AgendaNotification[];
  leadMinutes: ReminderLeadMinutes;
  soundEnabled: boolean;
  permissionState: NotificationPermission | 'unsupported';
  onChangeLeadMinutes: (minutes: ReminderLeadMinutes) => void;
  onToggleSound: () => void;
  onRequestPushPermission: () => void;
  onTestReminder: () => void;
  onMarkAttendedFromAlert: (appointmentId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onMarkAllRead: () => void;
}

const LEAD_OPTIONS: ReminderLeadMinutes[] = [15, 30, 60];

export const ReminderCenter: React.FC<ReminderCenterProps> = ({
  alerts,
  notifications,
  leadMinutes,
  soundEnabled,
  permissionState,
  onChangeLeadMinutes,
  onToggleSound,
  onRequestPushPermission,
  onTestReminder,
  onMarkAttendedFromAlert,
  onDismissAlert,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section
      id="reminders-section"
      aria-labelledby="reminders-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="reminders-heading" className="text-xl font-bold text-[#F5F2EB]">
            Recordatorios y Notificaciones
          </h2>
          <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
            Alertas automáticas antes de cada turno y control de 10 min de espera.
          </p>
        </div>

        <button
          type="button"
          onClick={onTestReminder}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#6A0DAD] bg-[#2D0A4E] px-3.5 py-2 text-xs font-bold text-[#F5F2EB] transition-colors hover:bg-[#6A0DAD] whitespace-nowrap shrink-0"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          <span>Probar recordatorio</span>
        </button>
      </div>

      {/* Manicurist reminder settings */}
      <div className="mt-4 space-y-3 rounded-2xl border border-[#2D0A4E] bg-[#121212] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#F5F2EB]">
            Avisar antes de la cita
          </span>
          <div className="inline-flex rounded-xl border border-[#2D0A4E] bg-[#18141E] p-1">
            {LEAD_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onChangeLeadMinutes(mins)}
                aria-pressed={leadMinutes === mins}
                className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition-colors ${
                  leadMinutes === mins
                    ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                    : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#2D0A4E] bg-[#18141E] px-3 py-2 text-xs font-bold text-[#F5F2EB] transition-colors hover:border-[#6A0DAD]"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-[#D6B4FF]" aria-hidden="true" />
                <span>Sonido activo</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-[#B8B2A6]" aria-hidden="true" />
                <span>Sonido silenciado</span>
              </>
            )}
          </button>

          {permissionState !== 'unsupported' && (
            <button
              type="button"
              onClick={onRequestPushPermission}
              disabled={permissionState === 'granted'}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                permissionState === 'granted'
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                  : 'border-[#6A0DAD] bg-[#2D0A4E]/70 text-[#F5F2EB] hover:bg-[#6A0DAD]'
              }`}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span>
                {permissionState === 'granted'
                  ? 'Alertas push activas'
                  : permissionState === 'denied'
                    ? 'Permiso bloqueado'
                    : 'Activar alertas push'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Live upcoming & grace reminders */}
      <div className="mt-4 space-y-2.5" data-testid="active-reminders">
        <h3 className="text-xs font-bold text-[#D6D0C4]">
          Recordatorios inmediatos ({alerts.length})
        </h3>
        {alerts.length === 0 ? (
          <p className="rounded-2xl border border-[#2D0A4E]/70 bg-[#121212]/60 px-4 py-3 text-xs text-[#B8B2A6]">
            No hay turnos dentro de los próximos {leadMinutes} minutos ni tolerancias activas ahora.
          </p>
        ) : (
          alerts.map((alert) => {
            const isExpired = alert.severity === 'grace_expired';
            const isGrace = alert.severity === 'grace_active';
            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-3.5 ${
                  isExpired
                    ? 'border-rose-500/60 bg-rose-950/30'
                    : isGrace
                      ? 'border-amber-400/60 bg-amber-950/30'
                      : 'border-[#6A0DAD] bg-[#2D0A4E]/75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <AlarmClock
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F5F2EB]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#F5F2EB]">
                        {alert.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#D6D0C4]">
                        {alert.detail}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismissAlert(alert.id)}
                    aria-label={`Descartar recordatorio de ${alert.clientName}`}
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#D6D0C4] hover:bg-[#121212]/60 hover:text-[#F5F2EB]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onMarkAttendedFromAlert(alert.appointmentId)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#6A0DAD] px-3 py-1.5 text-xs font-bold text-[#F5F2EB] hover:bg-[#7D1BC7]"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clienta en mesa (Atendida)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Agenda Notification Feed */}
      <div className="mt-5 border-t border-[#2D0A4E]/80 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#D6D0C4]">
            Historial de notificaciones de agenda ({unreadCount} nuevas)
          </h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-bold text-[#D6B4FF] underline-offset-4 hover:underline"
            >
              Marcar leídas
            </button>
          )}
        </div>

        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <li className="text-xs text-[#B8B2A6]">
              Aquí verás cada nueva cita agendada y los avisos de recordatorio.
            </li>
          ) : (
            notifications.map((note) => (
              <li
                key={note.id}
                className={`rounded-xl border px-3.5 py-2.5 text-xs ${
                  note.read
                    ? 'border-[#2D0A4E]/50 bg-[#121212]/70 text-[#B8B2A6]'
                    : 'border-[#6A0DAD]/70 bg-[#2D0A4E]/45 text-[#F5F2EB]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-[#F5F2EB]">{note.title}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[#B8B2A6]">
                    {note.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-[#D6D0C4]">{note.message}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
};
