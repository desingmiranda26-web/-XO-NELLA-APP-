import React from 'react';
import { Sparkles } from 'lucide-react';

interface StudioWorkShowcaseProps {
  onApplyReference: (referenceText: string) => void;
}

const WORK_GALLERY = [
  {
    id: 'cat-eye-gold',
    title: 'Cat-Eye Rosa & Relieve Gold',
    subtitle: 'Jelly Tips · Diseño 3D cromado',
    image: '/src/assets/images/nail_work_showcase_1794925905864.jpg',
    alt: 'Manicura XO NELLA en tono rosa cat-eye con líneas cromadas doradas en relieve 3D',
    referenceValue: 'Rosa cat-eye velvet con líneas 3D gold chrome',
  },
  {
    id: 'plum-chrome',
    title: 'Obsidian Matte & Plum Chrome',
    subtitle: 'Sistema Polygel · Acabado baddie',
    image: '/src/assets/images/studio_nails_emblem_1794925739236.jpg',
    alt: 'Uñas almendradas en negro glossy, ciruela mate y detalle plateado cromado',
    referenceValue: 'Negro glossy + ciruela mate con cinta plateada',
  },
];

export const StudioWorkShowcase: React.FC<StudioWorkShowcaseProps> = ({
  onApplyReference,
}) => {
  return (
    <section
      aria-labelledby="work-gallery-heading"
      className="rounded-3xl border border-[#2D0A4E] bg-[#18141E] p-5 shadow-xl sm:p-6"
    >
      <div>
        <h2 id="work-gallery-heading" className="text-xl font-bold text-[#F5F2EB]">
          Trabajo del Estudio
        </h2>
        <p className="mt-1 text-sm font-normal text-[#B8B2A6]">
          Sets reales de XO NELLA · Toca un diseño para cargarlo como referencia.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WORK_GALLERY.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#2D0A4E] bg-[#121212]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2D0A4E]/40">
              <img
                src={item.image}
                alt={item.alt}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
              <div>
                <p className="text-sm font-bold leading-snug text-[#F5F2EB]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] font-normal text-[#B8B2A6]">
                  {item.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onApplyReference(item.referenceValue)}
                aria-label={`Usar diseño ${item.title} como referencia`}
                className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-[#6A0DAD]/70 bg-[#2D0A4E]/75 px-3 py-2 text-xs font-bold text-[#F5F2EB] transition-colors hover:bg-[#6A0DAD] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB]"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Usar referencia</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
