import React from 'react';
import { Clock, Lock, Unlock } from 'lucide-react';
import type { Appointment, DayOption } from '../types/agenda';
import { formatHumanDate, getSlotStatus } from '../utils/agendaLogic';

interface DateTimeSelectorProps {
  days: DayOption[];
  selectedDateKey: string;
  selectedTime: string | null;
  slots: string[];
  appointments: Appointment[];
  blockedSlots: string[];
  isBlockMode: boolean;
  onSelectDate: (dateKey: string) => void;
  onSelectTime: (time: string) => void;
  onToggleBlockMode: () => void;
  onToggleBlockedSlot: (dateKey: string, time: string) => void;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  days,
  selectedDateKey,
  selectedTime,
  slots,
  appointments,
  blockedSlots,
  isBlockMode,
  onSelectDate,
  onSelectTime,
  onToggleBlockMode,
  onToggleBlockedSlot,
}) => {
  return (
    <section
      aria-labelledby="schedule-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="schedule-heading" className="text-xl font-bold text-[#F5F2EB]">
            2. Fecha y Horarios Disponibles
          </h2>
          <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
            {formatHumanDate(selectedDateKey)} · Toca un horario para seleccionarlo en morado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="custom-date-picker" className="sr-only">
            Elegir otra fecha
          </label>
          <input
            id="custom-date-picker"
            type="date"
            value={selectedDateKey}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="min-h-[44px] rounded-xl border border-[#2D0A4E] bg-[#121212] px-3.5 text-xs font-medium text-[#F5F2EB] tabular-nums focus:border-[#6A0DAD] focus:outline-none"
          />
        </div>
      </div>

      {/* Horizontal day scroller */}
      <div
        className="mt-4 flex gap-2.5 overflow-x-auto pb-2"
        role="group"
        aria-label="Selector rápido de días"
      >
        {days.map((day) => {
          const isActive = day.dateKey === selectedDateKey;
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.dateKey)}
              aria-pressed={isActive}
              className={`flex min-h-[68px] min-w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-2 transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB] ${
                isActive
                  ? 'border-[#9B4DFF] bg-[#6A0DAD] text-[#F5F2EB] shadow-md shadow-[#6A0DAD]/30'
                  : 'border-[#2D0A4E] bg-[#2D0A4E]/40 text-[#D6D0C4] hover:border-[#6A0DAD] hover:text-[#F5F2EB]'
              }`}
            >
              <span className="text-[11px] font-normal">
                {day.isToday ? 'Hoy' : day.weekdayShort}
              </span>
              <span className="mt-0.5 text-lg font-bold tabular-nums text-[#F5F2EB]">
                {day.dayNumber}
              </span>
              <span className="text-[11px] font-normal">{day.monthShort}</span>
            </button>
          );
        })}
      </div>

      {/* Manicurist block/unblock toggle & status key */}
      <div className="mt-4 flex flex-col gap-3 border-t border-[#2D0A4E]/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#D6D0C4]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-[#6A0DAD]/60 bg-[#2D0A4E]/50" />
            <span>Libre</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#6A0DAD]" />
            <span>Seleccionado</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#121212] ring-1 ring-[#3D2654]" />
            <span>Ocupado</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleBlockMode}
          aria-pressed={isBlockMode}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB] ${
            isBlockMode
              ? 'border-[#9B4DFF] bg-[#6A0DAD] text-[#F5F2EB]'
              : 'border-[#2D0A4E] bg-[#121212] text-[#D6D0C4] hover:border-[#6A0DAD] hover:text-[#F5F2EB]'
          }`}
        >
          {isBlockMode ? (
            <>
              <Unlock className="h-4 w-4" aria-hidden="true" />
              <span>Salir de bloqueo manual</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>Bloquear horarios (Manicurista)</span>
            </>
          )}
        </button>
      </div>

      {isBlockMode && (
        <p className="mt-3 rounded-xl bg-[#2D0A4E]/60 px-3.5 py-2 text-xs text-[#F5F2EB]">
          Modo manicurista activo: toca cualquier bloque libre para marcarlo como ocupado o vuelve a tocar un bloque bloqueado para liberarlo.
        </p>
      )}

      {/* Time slots grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {slots.map((time) => {
          const status = getSlotStatus(
            selectedDateKey,
            time,
            selectedTime,
            appointments,
            blockedSlots,
          );
          const isBooked = status === 'booked';
          const isBlocked = status === 'blocked';
          const isSelected = status === 'selected';

          const handleClick = () => {
            if (isBlockMode) {
              if (!isBooked) {
                onToggleBlockedSlot(selectedDateKey, time);
              }
              return;
            }
            if (!isBooked && !isBlocked) {
              onSelectTime(time);
            }
          };

          const disabled = isBooked || (!isBlockMode && isBlocked);

          let statusLabel = 'Libre';
          if (isBooked) statusLabel = 'Ocupado · Cita';
          else if (isBlocked) statusLabel = 'Ocupado';
          else if (isSelected) statusLabel = 'Seleccionado';

          return (
            <button
              key={time}
              type="button"
              onClick={handleClick}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`Horario ${time}, ${statusLabel}`}
              className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl border px-3 py-2.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB] ${
                isSelected
                  ? 'border-[#B47BFF] bg-[#6A0DAD] text-[#F5F2EB] shadow-lg shadow-[#6A0DAD]/35 scale-[1.01]'
                  : isBooked || isBlocked
                    ? 'cursor-not-allowed border-[#2D0A4E]/60 bg-[#121212] text-[#7D7688]'
                    : 'border-[#2D0A4E] bg-[#2D0A4E]/50 text-[#F5F2EB] hover:border-[#6A0DAD] hover:bg-[#6A0DAD]/35 active:scale-[0.98]'
              } ${isBlockMode && isBlocked ? '!cursor-pointer border-[#6A0DAD]/70 text-[#D6D0C4] hover:bg-[#2D0A4E]' : ''}`}
            >
              <span className="inline-flex items-center gap-1.5 text-base font-bold tabular-nums">
                <Clock className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                <span>{time}</span>
              </span>
              <span className="mt-0.5 text-[11px] font-normal">
                {statusLabel}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
