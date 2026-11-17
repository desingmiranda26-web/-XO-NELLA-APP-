import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CalendarDays, PlusCircle } from 'lucide-react';
import { AgendaPanel } from './components/AgendaPanel';
import { DateTimeSelector } from './components/DateTimeSelector';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReminderCenter } from './components/ReminderCenter';
import { ServiceMenu } from './components/ServiceMenu';
import { StudioWorkShowcase } from './components/StudioWorkShowcase';
import { TermsAndBookingForm } from './components/TermsAndBookingForm';
import { NAIL_SERVICES, STUDIO_TIME_SLOTS } from './data/services';
import type {
  AgendaNotification,
  Appointment,
  ReminderLeadMinutes,
} from './types/agenda';
import {
  computeReminderAlerts,
  createAppointmentRecord,
  createInitialSeedAppointments,
  formatDateKey,
  getUpcomingDays,
  removeAttendedAppointments,
  sortAppointmentsByDateTime,
  toggleBlockedSlot,
  validateBookingInput,
} from './utils/agendaLogic';
import { playChime } from './utils/soundAlert';

const STORAGE_KEYS = {
  appointments: 'xo_nella_appointments_v1',
  blockedSlots: 'xo_nella_blocked_slots_v1',
  notifications: 'xo_nella_notifications_v1',
  settings: 'xo_nella_settings_v1',
} as const;

type MobileTab = 'book' | 'agenda' | 'reminders';

function formatNowTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [now, setNow] = useState<Date>(() => new Date());
  const todayKey = useMemo(() => formatDateKey(now), [now]);
  const upcomingDays = useMemo(() => getUpcomingDays(new Date(), 14), []);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = loadJson<Appointment[] | null>(STORAGE_KEYS.appointments, null);
    if (stored) return stored;
    return createInitialSeedAppointments(new Date());
  });

  const [blockedSlots, setBlockedSlots] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_KEYS.blockedSlots, []),
  );

  const [notifications, setNotifications] = useState<AgendaNotification[]>(() => {
    const stored = loadJson<AgendaNotification[] | null>(
      STORAGE_KEYS.notifications,
      null,
    );
    if (stored) return stored;
    return [
      {
        id: 'init-note-1',
        kind: 'reminder_upcoming',
        title: 'Agenda XO NELLA lista',
        message: 'Tus recordatorios y citas se guardan localmente en este dispositivo.',
        timestamp: formatNowTime(new Date()),
        read: false,
      },
    ];
  });

  const [settings, setSettings] = useState<{
    leadMinutes: ReminderLeadMinutes;
    soundEnabled: boolean;
  }>(() =>
    loadJson(STORAGE_KEYS.settings, {
      leadMinutes: 30,
      soundEnabled: true,
    }),
  );

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    NAIL_SERVICES[0].id,
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBlockMode, setIsBlockMode] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [designReference, setDesignReference] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [activeBanner, setActiveBanner] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('book');
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | 'unsupported'
  >(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported',
  );

  const firedAlertIdsRef = useRef<Set<string>>(new Set());
  const bannerTimerRef = useRef<number | null>(null);
  const hasUserInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    const markInteracted = () => {
      hasUserInteractedRef.current = true;
    };
    window.addEventListener('pointerdown', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    return () => {
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
    } catch {
      // Ignore storage quota errors
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.blockedSlots, JSON.stringify(blockedSlots));
    } catch {
      // Ignore storage quota errors
    }
  }, [blockedSlots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
    } catch {
      // Ignore storage quota errors
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  // Tick every 15s for live manicurist reminders
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const activeAlerts = useMemo(
    () =>
      computeReminderAlerts(
        appointments,
        now,
        settings.leadMinutes,
        dismissedAlertIds,
      ),
    [appointments, now, settings.leadMinutes, dismissedAlertIds],
  );

  const pushBanner = (title: string, message: string) => {
    const id = `banner-${Date.now()}`;
    setActiveBanner({ id, title, message });
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = window.setTimeout(() => {
      setActiveBanner(null);
    }, 5500);
  };

  const triggerSystemNotification = (title: string, body: string) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
        });
      } catch {
        // Fallback already handled via in-app banner
      }
    }
  };

  const addAgendaNotification = (
    kind: AgendaNotification['kind'],
    title: string,
    message: string,
    appointmentId?: string,
  ) => {
    const entry: AgendaNotification = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind,
      title,
      message,
      timestamp: formatNowTime(new Date()),
      appointmentId,
      read: false,
    };
    setNotifications((prev) => [entry, ...prev].slice(0, 30));
  };

  // Auto-fire notifications when an appointment enters the reminder or grace window
  useEffect(() => {
    for (const alert of activeAlerts) {
      if (firedAlertIdsRef.current.has(alert.id)) continue;
      firedAlertIdsRef.current.add(alert.id);

      const kind: AgendaNotification['kind'] =
        alert.severity === 'grace_expired'
          ? 'grace_expired'
          : alert.severity === 'grace_active'
            ? 'grace_period'
            : 'reminder_upcoming';

      addAgendaNotification(kind, alert.title, alert.detail, alert.appointmentId);
      pushBanner(alert.title, alert.detail);
      if (settings.soundEnabled && hasUserInteractedRef.current) {
        playChime('reminder');
      }
      triggerSystemNotification(`XO NELLA · ${alert.title}`, alert.detail);
    }
  }, [activeAlerts, settings.soundEnabled]);

  const selectedService = useMemo(
    () => NAIL_SERVICES.find((s) => s.id === selectedServiceId) ?? null,
    [selectedServiceId],
  );

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setSelectedTime(null);
    setFormError(null);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime((prev) => (prev === time ? null : time));
    setFormError(null);
  };

  const handleToggleBlockedSlot = (dateKey: string, time: string) => {
    setBlockedSlots((prev) => toggleBlockedSlot(prev, dateKey, time));
    if (selectedDateKey === dateKey && selectedTime === time) {
      setSelectedTime(null);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBookingInput({
      clientName,
      clientContact,
      serviceId: selectedServiceId,
      dateKey: selectedDateKey,
      time: selectedTime,
      appointments,
      blockedSlots,
    });

    if (!validation.valid || !selectedServiceId || !selectedTime) {
      setFormError(validation.error ?? 'Revisa los campos antes de confirmar.');
      return;
    }

    const newAppt = createAppointmentRecord({
      id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientName,
      clientContact,
      serviceId: selectedServiceId,
      dateKey: selectedDateKey,
      time: selectedTime,
      designReference,
    });

    setAppointments((prev) => sortAppointmentsByDateTime([...prev, newAppt]));
    setClientName('');
    setClientContact('');
    setDesignReference('');
    setSelectedTime(null);
    setFormError(null);

    const title = `Cita confirmada · ${newAppt.time}`;
    const msg = `${newAppt.clientName} — ${newAppt.serviceName} (${newAppt.priceEur}€)`;
    addAgendaNotification('new_booking', title, msg, newAppt.id);
    pushBanner(title, msg);
    if (settings.soundEnabled) {
      playChime('booking');
    }
    triggerSystemNotification(`XO NELLA · ${title}`, msg);
  };

  const handleToggleAppointmentStatus = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pending' ? 'attended' : 'pending' }
          : item,
      ),
    );
  };

  const handleDeleteAppointment = (id: string) => {
    const target = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      pushBanner('Cita eliminada', `${target.clientName} · ${target.time}`);
    }
  };

  const handleClearAttended = () => {
    const { remaining, removedCount } = removeAttendedAppointments(appointments);
    if (removedCount === 0) return;
    setAppointments(remaining);
    const title = 'Citas atendidas eliminadas';
    const msg = `Se limpiaron ${removedCount} ${removedCount === 1 ? 'cita atendida' : 'citas atendidas'} de tu agenda.`;
    addAgendaNotification('cleanup', title, msg);
    pushBanner(title, msg);
  };

  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionState('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === 'granted') {
      triggerSystemNotification(
        'XO NELLA · Alertas activadas',
        'Recibirás recordatorios antes de cada cita.',
      );
    }
  };

  const handleTestReminder = () => {
    const title = 'Recordatorio de prueba · XO NELLA';
    const msg =
      'Próxima clienta en 15 min · Recuerda enviar confirmación y respetar 10 min de espera.';
    addAgendaNotification('reminder_upcoming', title, msg);
    pushBanner(title, msg);
    if (settings.soundEnabled) {
      playChime('reminder');
    }
    triggerSystemNotification(title, msg);
  };

  const handleApplyWorkReference = (referenceText: string) => {
    setDesignReference(referenceText);
    setMobileTab('book');
    pushBanner('Referencia cargada', referenceText);
    const input = document.getElementById('design-reference');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleJumpToReminders = () => {
    setMobileTab('reminders');
    const el = document.getElementById('reminders-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const totalAlertsBadge = activeAlerts.length + unreadNotificationsCount;

  return (
    <div className="min-h-screen bg-[#121212] pb-24 text-[#F5F2EB] lg:pb-12">
      <NotificationBanner
        banner={activeBanner}
        onDismiss={() => setActiveBanner(null)}
      />

      <Header
        unreadAlertsCount={totalAlertsBadge}
        onJumpToReminders={handleJumpToReminders}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left column: Services, Date & Slots, Terms & Booking Form */}
          <div
            className={`space-y-6 lg:col-span-7 ${
              mobileTab === 'book' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ServiceMenu
              services={NAIL_SERVICES}
              selectedServiceId={selectedServiceId}
              onSelectService={(id) => {
                setSelectedServiceId(id);
                setFormError(null);
              }}
            />

            <DateTimeSelector
              days={upcomingDays}
              selectedDateKey={selectedDateKey}
              selectedTime={selectedTime}
              slots={STUDIO_TIME_SLOTS}
              appointments={appointments}
              blockedSlots={blockedSlots}
              isBlockMode={isBlockMode}
              onSelectDate={handleSelectDate}
              onSelectTime={handleSelectTime}
              onToggleBlockMode={() => setIsBlockMode((prev) => !prev)}
              onToggleBlockedSlot={handleToggleBlockedSlot}
            />

            <TermsAndBookingForm
              selectedService={selectedService}
              selectedDateKey={selectedDateKey}
              selectedTime={selectedTime}
              clientName={clientName}
              clientContact={clientContact}
              designReference={designReference}
              formError={formError}
              onChangeName={setClientName}
              onChangeContact={setClientContact}
              onChangeDesignRef={setDesignReference}
              onSubmit={handleConfirmBooking}
            />
          </div>

          {/* Right column: Studio Work Gallery, Manicurist Agenda & Reminder Center */}
          <div className="space-y-6 lg:col-span-5">
            <div className={mobileTab === 'book' ? 'block' : 'hidden lg:block'}>
              <StudioWorkShowcase onApplyReference={handleApplyWorkReference} />
            </div>

            <div className={mobileTab === 'agenda' ? 'block' : 'hidden lg:block'}>
              <AgendaPanel
                appointments={appointments}
                selectedDateKey={selectedDateKey}
                onToggleStatus={handleToggleAppointmentStatus}
                onDeleteAppointment={handleDeleteAppointment}
                onClearAttended={handleClearAttended}
              />
            </div>

            <div className={mobileTab === 'reminders' ? 'block' : 'hidden lg:block'}>
              <ReminderCenter
                alerts={activeAlerts}
                notifications={notifications}
                leadMinutes={settings.leadMinutes}
                soundEnabled={settings.soundEnabled}
                permissionState={permissionState}
                onChangeLeadMinutes={(minutes) =>
                  setSettings((prev) => ({ ...prev, leadMinutes: minutes }))
                }
                onToggleSound={() =>
                  setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                }
                onRequestPushPermission={handleRequestPushPermission}
                onTestReminder={handleTestReminder}
                onMarkAttendedFromAlert={handleToggleAppointmentStatus}
                onDismissAlert={(alertId) =>
                  setDismissedAlertIds((prev) => [...prev, alertId])
                }
                onMarkAllRead={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar (< 15% sticky height cap) */}
      <nav
        aria-label="Navegación principal móvil"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#2D0A4E] bg-[#121212]/95 backdrop-blur-md lg:hidden"
      >
        <div className="grid h-16 grid-cols-3">
          <button
            type="button"
            onClick={() => setMobileTab('book')}
            aria-current={mobileTab === 'book' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              mobileTab === 'book'
                ? 'bg-[#2D0A4E]/80 text-[#F5F2EB]'
                : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
            }`}
          >
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
            <span>Agendar</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('agenda')}
            aria-current={mobileTab === 'agenda' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              mobileTab === 'agenda'
                ? 'bg-[#2D0A4E]/80 text-[#F5F2EB]'
                : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
            }`}
          >
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            <span>Agenda ({appointments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('reminders')}
            aria-current={mobileTab === 'reminders' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              mobileTab === 'reminders'
                ? 'bg-[#2D0A4E]/80 text-[#F5F2EB]'
                : 'text-[#B8B2A6] hover:text-[#F5F2EB]'
            }`}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span>Alertas ({totalAlertsBadge})</span>
          </button>
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
