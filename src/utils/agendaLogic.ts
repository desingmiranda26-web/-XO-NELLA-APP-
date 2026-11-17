import { NAIL_SERVICES, STUDIO_TIME_SLOTS } from '../data/services';
import type {
  Appointment,
  DayOption,
  ReminderAlert,
  ReminderLeadMinutes,
  SlotStatus,
} from '../types/agenda';

const WEEKDAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateTime(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export function formatSlotKey(dateKey: string, time: string): string {
  return `${dateKey}__${time}`;
}

export function getUpcomingDays(baseDate: Date, count = 14): DayOption[] {
  const todayKey = formatDateKey(baseDate);
  const days: DayOption[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
    const key = formatDateKey(d);
    days.push({
      dateKey: key,
      weekdayShort: WEEKDAYS_ES[d.getDay()],
      dayNumber: String(d.getDate()).padStart(2, '0'),
      monthShort: MONTHS_ES[d.getMonth()],
      isToday: key === todayKey,
    });
  }
  return days;
}

export function formatHumanDate(dateKey: string, now: Date = new Date()): string {
  const todayKey = formatDateKey(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);
  const [y, m, d] = dateKey.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  const label = `${WEEKDAYS_ES[target.getDay()]} ${String(d).padStart(2, '0')} ${MONTHS_ES[target.getMonth()]}`;
  if (dateKey === todayKey) return `Hoy · ${label}`;
  if (dateKey === tomorrowKey) return `Mañana · ${label}`;
  return label;
}

export function getSlotStatus(
  dateKey: string,
  time: string,
  selectedTime: string | null,
  appointments: Appointment[],
  blockedSlots: string[],
): SlotStatus {
  const isBooked = appointments.some((a) => a.dateKey === dateKey && a.time === time);
  if (isBooked) return 'booked';

  const slotKey = formatSlotKey(dateKey, time);
  if (blockedSlots.includes(slotKey)) return 'blocked';

  if (selectedTime === time) return 'selected';

  return 'available';
}

export function toggleBlockedSlot(
  blockedSlots: string[],
  dateKey: string,
  time: string,
): string[] {
  const key = formatSlotKey(dateKey, time);
  if (blockedSlots.includes(key)) {
    return blockedSlots.filter((item) => item !== key);
  }
  return [...blockedSlots, key];
}

export interface BookingValidationInput {
  clientName: string;
  clientContact: string;
  serviceId: string | null;
  dateKey: string;
  time: string | null;
  appointments: Appointment[];
  blockedSlots: string[];
}

export interface BookingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBookingInput(input: BookingValidationInput): BookingValidationResult {
  if (!input.serviceId) {
    return { valid: false, error: 'Selecciona un servicio del menú antes de confirmar.' };
  }
  if (!input.dateKey || !input.time) {
    return { valid: false, error: 'Elige una fecha y un horario disponible.' };
  }
  if (!input.clientName.trim()) {
    return { valid: false, error: 'Ingresa el nombre de la clienta.' };
  }
  if (!input.clientContact.trim()) {
    return { valid: false, error: 'Ingresa un teléfono o usuario de Instagram.' };
  }
  const slotStatus = getSlotStatus(
    input.dateKey,
    input.time,
    null,
    input.appointments,
    input.blockedSlots,
  );
  if (slotStatus === 'booked' || slotStatus === 'blocked') {
    return {
      valid: false,
      error: 'Ese horario ya está ocupado. Selecciona otro bloque libre.',
    };
  }
  return { valid: true };
}

export function createAppointmentRecord(params: {
  id: string;
  clientName: string;
  clientContact: string;
  serviceId: string;
  dateKey: string;
  time: string;
  designReference?: string;
  nowIso?: string;
}): Appointment {
  const service = NAIL_SERVICES.find((s) => s.id === params.serviceId);
  if (!service) {
    throw new Error(`Servicio no encontrado: ${params.serviceId}`);
  }
  return {
    id: params.id,
    clientName: params.clientName.trim(),
    clientContact: params.clientContact.trim(),
    serviceId: service.id,
    serviceName: service.name,
    priceEur: service.priceEur,
    dateKey: params.dateKey,
    time: params.time,
    designReference: (params.designReference ?? '').trim() || 'Por enviar por mensaje',
    status: 'pending',
    createdAt: params.nowIso ?? new Date().toISOString(),
  };
}

export function sortAppointmentsByDateTime(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    const dateCompare = a.dateKey.localeCompare(b.dateKey);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export function removeAttendedAppointments(appointments: Appointment[]): {
  remaining: Appointment[];
  removedCount: number;
} {
  const remaining = appointments.filter((a) => a.status !== 'attended');
  return {
    remaining,
    removedCount: appointments.length - remaining.length,
  };
}

export function calculateDayStats(appointments: Appointment[], dateKey: string) {
  const dayItems = appointments.filter((a) => a.dateKey === dateKey);
  const pendingCount = dayItems.filter((a) => a.status === 'pending').length;
  const attendedCount = dayItems.filter((a) => a.status === 'attended').length;
  const totalRevenueEur = dayItems.reduce((sum, item) => sum + item.priceEur, 0);
  return {
    totalCount: dayItems.length,
    pendingCount,
    attendedCount,
    totalRevenueEur,
  };
}

export function computeReminderAlerts(
  appointments: Appointment[],
  now: Date,
  leadMinutes: ReminderLeadMinutes,
  dismissedIds: string[] = [],
): ReminderAlert[] {
  const alerts: ReminderAlert[] = [];

  for (const appt of appointments) {
    if (appt.status !== 'pending') continue;
    const apptDate = parseDateTime(appt.dateKey, appt.time);
    const diffMs = apptDate.getTime() - now.getTime();
    const minutesDelta = Math.round(diffMs / 60000);

    // Upcoming reminder within configured lead time (0..leadMinutes)
    if (minutesDelta >= 0 && minutesDelta <= leadMinutes) {
      const id = `upcoming-${appt.id}-${leadMinutes}`;
      if (!dismissedIds.includes(id)) {
        alerts.push({
          id,
          appointmentId: appt.id,
          clientName: appt.clientName,
          serviceName: appt.serviceName,
          time: appt.time,
          dateKey: appt.dateKey,
          minutesDelta,
          severity: 'upcoming',
          title:
            minutesDelta === 0
              ? `Cita ahora: ${appt.clientName}`
              : `Cita en ${minutesDelta} min: ${appt.clientName}`,
          detail: `${appt.serviceName} · ${appt.time} · Ref: ${appt.designReference}`,
        });
      }
      continue;
    }

    // Active 10-min grace period (started up to 10 minutes ago)
    if (minutesDelta < 0 && minutesDelta >= -10) {
      const elapsed = Math.abs(minutesDelta);
      const remainingGrace = Math.max(0, 10 - elapsed);
      const id = `grace-${appt.id}`;
      if (!dismissedIds.includes(id)) {
        alerts.push({
          id,
          appointmentId: appt.id,
          clientName: appt.clientName,
          serviceName: appt.serviceName,
          time: appt.time,
          dateKey: appt.dateKey,
          minutesDelta,
          severity: 'grace_active',
          title: `Tolerancia activa: ${appt.clientName}`,
          detail: `Turno de las ${appt.time} · Quedan ${remainingGrace} min de los 10 min de espera.`,
        });
      }
      continue;
    }

    // Past 10-min tolerance on the same day (within 2 hours)
    if (minutesDelta < -10 && minutesDelta >= -120) {
      const id = `expired-${appt.id}`;
      if (!dismissedIds.includes(id)) {
        alerts.push({
          id,
          appointmentId: appt.id,
          clientName: appt.clientName,
          serviceName: appt.serviceName,
          time: appt.time,
          dateKey: appt.dateKey,
          minutesDelta,
          severity: 'grace_expired',
          title: `Tolerancia vencida: ${appt.clientName}`,
          detail: `Pasaron los 10 min del turno (${appt.time}). Puedes ceder el cupo o marcar atendida.`,
        });
      }
    }
  }

  return alerts.sort((a, b) => a.minutesDelta - b.minutesDelta);
}

export function createInitialSeedAppointments(now: Date = new Date()): Appointment[] {
  const todayKey = formatDateKey(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  // Pick a slot ~20 min ahead if possible so the manicurist immediately sees a live reminder card
  const soonDate = new Date(now.getTime() + 20 * 60000);
  const soonTime = `${String(soonDate.getHours()).padStart(2, '0')}:${String(soonDate.getMinutes()).padStart(2, '0')}`;
  const soonSlot = STUDIO_TIME_SLOTS.find((slot) => slot > soonTime) ?? '18:00';

  return sortAppointmentsByDateTime([
    {
      id: 'seed-1',
      clientName: 'Camila Mendoza',
      clientContact: '@camilam.studio',
      serviceId: 'semi-permanente',
      serviceName: 'Semi permanente',
      priceEur: 9,
      dateKey: todayKey,
      time: '09:00',
      designReference: 'Negro mate con micro french plateado',
      status: 'attended',
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-2',
      clientName: 'Sofía Rojas',
      clientContact: '+34 644 218 903',
      serviceId: 'jelly-tips',
      serviceName: 'Jelly tips',
      priceEur: 15,
      dateKey: todayKey,
      time: soonSlot === '09:00' ? '12:00' : soonSlot,
      designReference: 'Aura morado oscuro con estrella cromada',
      status: 'pending',
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-3',
      clientName: 'Valentina Cruz',
      clientContact: '@valen.baddie',
      serviceId: 'sistema-polygel-acrilico',
      serviceName: 'Sistema de polygel y de acrílico',
      priceEur: 18,
      dateKey: tomorrowKey,
      time: '15:00',
      designReference: 'Almendradas plum glossy + 3D minimal',
      status: 'pending',
      createdAt: now.toISOString(),
    },
  ]);
}
