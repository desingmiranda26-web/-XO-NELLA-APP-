import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Trash2, User } from 'lucide-react';
import type { Appointment } from '../types/agenda';
import {
  calculateDayStats,
  formatHumanDate,
  sortAppointmentsByDateTime,
} from '../utils/agendaLogic';

interface AgendaPanelProps {
  appointments: Appointment[];
  selectedDateKey: string;
  onToggleStatus: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
  onClearAttended: () => void;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
  appointments,
  selectedDateKey,
  onToggleStatus,
  onDeleteAppointment,
  onClearAttended,
}) => {
  const [scope, setScope] = useState<'day' | 'all'>('day');

  const sorted = sortAppointmentsByDateTime(appointments);
  const visibleAppointments =
    scope === 'day'
      ? sorted.filter((item) => item.dateKey === selectedDateKey)
      : sorted;

  const dayStats = calculateDayStats(appointments, selectedDateKey);
  const totalAttendedCount = appointments.filter((a) => a.status === 'attended').length;

  return (
    <section
      aria-labelledby="agenda-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="agenda-heading" className="text-xl font-bold text-[#F5F2EB]">
            Agenda de la Manicurista
          </h2>
          <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
            {scope === 'day'
              ? formatHumanDate(selectedDateKey)
              : 'Todas las citas programadas'}
          </p>
        </div>

        {/* Scope segmented filter */}
        <div
          className="inline-flex rounded-xl border border-[#2D0A4E] bg-[#121212] p-1"
          role="group"
          aria-label="Filtrar citas"
        >
          <button
            type="button"
            onClick={() => setScope('day')}
            aria-pressed={scope === 'day'}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
              scope === 'day'
                ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
            }`}
          >
            Día elegido
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            aria-pressed={scope === 'all'}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
              scope === 'all'
                ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
            }`}
          >
            Todas ({appointments.length})
          </button>
        </div>
      </div>

      {/* Day metrics strip */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-2xl border border-[#2D0A4E] bg-[#121212] p-3.5">
        <div>
          <span className="block text-[11px] font-normal text-[#B8B2A6]">Pendientes</span>
          <span className="mt-0.5 block text-xl font-bold tabular-nums text-[#F5F2EB]">
            {dayStats.pendingCount}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-normal text-[#B8B2A6]">Atendidas</span>
          <span className="mt-0.5 block text-xl font-bold tabular-nums text-[#F5F2EB]">
            {dayStats.attendedCount}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-normal text-[#B8B2A6]">Estimado día</span>
          <span className="mt-0.5 block text-xl font-bold tabular-nums text-[#F5F2EB]">
            {dayStats.totalRevenueEur}€
          </span>
        </div>
      </div>

      {/* Prominent Delete Attended Appointments button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onClearAttended}
          disabled={totalAttendedCount === 0}
          className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB] ${
            totalAttendedCount > 0
              ? 'border-[#6A0DAD] bg-[#2D0A4E] text-[#F5F2EB] hover:bg-[#6A0DAD] active:scale-[0.99]'
              : 'cursor-not-allowed border-[#2D0A4E]/60 bg-[#121212] text-[#7D7688]'
          }`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>
            Eliminar citas ya atendidas
            {totalAttendedCount > 0 ? ` (${totalAttendedCount})` : ''}
          </span>
        </button>
      </div>

      {/* Appointments list */}
      <div className="mt-4 space-y-3" data-testid="appointments-list">
        {visibleAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2D0A4E] bg-[#121212]/60 px-4 py-8 text-center">
            <p className="text-sm font-bold text-[#F5F2EB]">
              Sin citas en esta vista
            </p>
            <p className="mt-1 text-xs font-normal text-[#B8B2A6]">
              Selecciona un servicio y un horario morado para agendar el próximo turno.
            </p>
          </div>
        ) : (
          visibleAppointments.map((appt) => {
            const isAttended = appt.status === 'attended';
            return (
              <article
                key={appt.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  isAttended
                    ? 'border-[#2D0A4E]/60 bg-[#121212]/90 opacity-85'
                    : 'border-[#6A0DAD]/60 bg-[#2D0A4E]/45'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-[#D6D0C4]">
                      <span className="text-base font-bold tabular-nums text-[#F5F2EB]">
                        {appt.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatHumanDate(appt.dateKey)}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-bold ${
                          isAttended ? 'text-emerald-300' : 'text-[#D6B4FF]'
                        }`}
                      >
                        {isAttended ? 'Atendida' : 'Pendiente'}
                      </span>
                    </div>

                    <h3 className="mt-1 flex items-center gap-1.5 text-base font-bold text-[#F5F2EB]">
                      <User className="h-4 w-4 shrink-0 text-[#D6B4FF]" aria-hidden="true" />
                      <span className="truncate">{appt.clientName}</span>
                    </h3>

                    <p className="mt-0.5 text-xs font-normal text-[#D6D0C4]">
                      {appt.serviceName} · {appt.clientContact}
                    </p>
                    <p className="mt-1 text-xs font-normal text-[#B8B2A6]">
                      Diseño: {appt.designReference}
                    </p>
                  </div>

                  <span className="shrink-0 text-lg font-bold tabular-nums text-[#F5F2EB]">
                    {appt.priceEur}€
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[#2D0A4E]/70 pt-3">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(appt.id)}
                    aria-label={
                      isAttended
                        ? `Marcar como pendiente la cita de ${appt.clientName}`
                        : `Marcar como atendida la cita de ${appt.clientName}`
                    }
                    className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      isAttended
                        ? 'border border-[#2D0A4E] bg-[#18141E] text-[#D6D0C4] hover:border-[#6A0DAD] hover:text-[#F5F2EB]'
                        : 'bg-[#6A0DAD] text-[#F5F2EB] hover:bg-[#7D1BC7]'
                    }`}
                  >
                    {isAttended ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Volver a pendiente</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Marcar atendida</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteAppointment(appt.id)}
                    aria-label={`Eliminar cita de ${appt.clientName}`}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2D0A4E] bg-[#121212] px-3.5 py-2 text-xs font-bold text-[#D6D0C4] transition-colors hover:border-rose-500/60 hover:text-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
