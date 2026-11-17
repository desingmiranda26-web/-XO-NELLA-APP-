import React from 'react';
import { Check } from 'lucide-react';
import type { NailService } from '../types/agenda';

interface ServiceMenuProps {
  services: NailService[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

export const ServiceMenu: React.FC<ServiceMenuProps> = ({
  services,
  selectedServiceId,
  onSelectService,
}) => {
  return (
    <section
      aria-labelledby="services-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="services-heading" className="text-xl font-bold text-[#F5F2EB]">
            1. Menú de Servicios
          </h2>
          <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
            Toca un servicio para seleccionarlo y ver el precio final.
          </p>
        </div>
        <span className="text-xs font-normal text-[#B8B2A6] tabular-nums">
          {services.length} servicios disponibles
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service.id)}
              aria-pressed={isSelected}
              className={`group flex min-h-[72px] w-full flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB] ${
                isSelected
                  ? 'border-[#9B4DFF] bg-[#6A0DAD] text-[#F5F2EB] shadow-lg shadow-[#6A0DAD]/30'
                  : 'border-[#2D0A4E] bg-[#2D0A4E]/45 text-[#F5F2EB] hover:border-[#6A0DAD] hover:bg-[#2D0A4E]/80'
              }`}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-base font-bold leading-snug text-[#F5F2EB]">
                    {service.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-lg font-bold text-[#F5F2EB]">
                    {service.priceEur}€
                  </span>
                  {isSelected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F5F2EB] text-[#2D0A4E]">
                      <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs font-normal text-[#D6D0C4]">
                <span className="line-clamp-1">{service.description}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 tabular-nums">{service.durationMin} min</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
