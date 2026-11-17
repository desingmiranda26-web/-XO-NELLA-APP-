import React from 'react';
import { CalendarCheck, ShieldAlert } from 'lucide-react';
import { STUDIO_TERMS } from '../data/services';
import type { NailService } from '../types/agenda';
import { formatHumanDate } from '../utils/agendaLogic';

interface TermsAndBookingFormProps {
  selectedService: NailService | null;
  selectedDateKey: string;
  selectedTime: string | null;
  clientName: string;
  clientContact: string;
  designReference: string;
  formError: string | null;
  onChangeName: (value: string) => void;
  onChangeContact: (value: string) => void;
  onChangeDesignRef: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TermsAndBookingForm: React.FC<TermsAndBookingFormProps> = ({
  selectedService,
  selectedDateKey,
  selectedTime,
  clientName,
  clientContact,
  designReference,
  formError,
  onChangeName,
  onChangeContact,
  onChangeDesignRef,
  onSubmit,
}) => {
  return (
    <section
      aria-labelledby="booking-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <h2 id="booking-heading" className="text-xl font-bold text-[#F5F2EB]">
        3. Registro y Confirmación de Cita
      </h2>
      <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
        Completa los datos de la clienta y revisa las reglas del estudio antes de agendar.
      </p>

      {/* Highlighted Terms & Conditions box before confirming */}
      <div
        aria-labelledby="terms-heading"
        className="mt-4 rounded-2xl border border-[#6A0DAD] bg-[#2D0A4E]/75 p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 text-[#F5F2EB]" aria-hidden="true" />
          <h3 id="terms-heading" className="text-base font-bold text-[#F5F2EB]">
            Términos y Condiciones del Estudio
          </h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm font-normal leading-relaxed text-[#F5F2EB]">
          {STUDIO_TERMS.map((rule, index) => (
            <li key={rule} className="flex items-start gap-2.5">
              <span className="mt-0.5 font-bold tabular-nums text-[#D6B4FF]">
                0{index + 1}.
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="client-name"
              className="block text-xs font-bold text-[#F5F2EB]"
            >
              Nombre de la clienta
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Ej. Valeria Gómez"
              required
              className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[#2D0A4E] bg-[#121212] px-3.5 text-sm text-[#F5F2EB] placeholder:text-[#7D7688] focus:border-[#6A0DAD] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="client-contact"
              className="block text-xs font-bold text-[#F5F2EB]"
            >
              Teléfono / Instagram
            </label>
            <input
              id="client-contact"
              type="text"
              value={clientContact}
              onChange={(e) => onChangeContact(e.target.value)}
              placeholder="Ej. +34 612 345 678 o @valeglam"
              required
              className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[#2D0A4E] bg-[#121212] px-3.5 text-sm text-[#F5F2EB] placeholder:text-[#7D7688] focus:border-[#6A0DAD] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="design-reference"
            className="block text-xs font-bold text-[#F5F2EB]"
          >
            Referencia del diseño (opcional)
          </label>
          <input
            id="design-reference"
            type="text"
            value={designReference}
            onChange={(e) => onChangeDesignRef(e.target.value)}
            placeholder="Ej. French cromado plateado, enviada por DM"
            className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[#2D0A4E] bg-[#121212] px-3.5 text-sm text-[#F5F2EB] placeholder:text-[#7D7688] focus:border-[#6A0DAD] focus:outline-none"
          />
        </div>

        {/* Live selection summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#2D0A4E] bg-[#121212] px-4 py-3 text-xs text-[#D6D0C4]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#F5F2EB]">
              {selectedService ? selectedService.name : 'Sin servicio elegido'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatHumanDate(selectedDateKey)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-bold text-[#F5F2EB]">
              {selectedTime ?? 'Sin hora'}
            </span>
          </div>
          <span className="text-base font-bold tabular-nums text-[#F5F2EB]">
            {selectedService ? `${selectedService.priceEur}€` : '0€'}
          </span>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/50 bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-200"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#6A0DAD] px-6 py-3.5 text-base font-bold text-[#F5F2EB] shadow-lg shadow-[#6A0DAD]/35 transition-all duration-150 hover:bg-[#7D1BC7] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB]"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          <span>Confirmar Cita</span>
        </button>
      </form>
    </section>
  );
};
