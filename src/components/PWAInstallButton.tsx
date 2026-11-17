import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6A0DAD] px-4 py-2 text-xs font-bold text-[#F5F2EB] shadow-md shadow-[#6A0DAD]/25 transition-all duration-150 hover:bg-[#7D1BC7] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB]"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>Instalar App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#6A0DAD]/50 bg-[#2D0A4E]/60 px-3.5 py-2 text-xs font-bold text-[#F5F2EB] transition-all duration-150 hover:bg-[#6A0DAD] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F2EB]"
      >
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        <span>App Independiente</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#6A0DAD]/40 bg-[#1B1324] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="pwa-guide-title" className="text-lg font-bold text-[#F5F2EB]">
                  Instalar XO NELLA en tu dispositivo
                </h3>
                <p className="mt-1 text-xs text-[#D6D0C4]">
                  Úsala como agenda independiente sin barra de navegador y con acceso offline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Cerrar guía de instalación"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#D6D0C4] transition-colors hover:bg-[#2D0A4E] hover:text-[#F5F2EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl bg-[#121212] p-4 text-sm text-[#F5F2EB]">
              {isIOS ? (
                <>
                  <p>1. Toca el botón Compartir en la barra inferior de Safari.</p>
                  <p>2. Selecciona Agregar a la pantalla de inicio y confirma.</p>
                </>
              ) : (
                <>
                  <p>1. Abre el menú de tu navegador (Chrome, Edge o Safari).</p>
                  <p>2. Toca Instalar aplicación o Añadir a pantalla de inicio.</p>
                  <p>3. Tus citas y recordatorios quedarán guardados localmente en tu teléfono.</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-[#6A0DAD] py-2.5 text-sm font-bold text-[#F5F2EB] transition-colors hover:bg-[#7D1BC7]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
