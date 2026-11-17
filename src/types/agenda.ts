export type AppointmentStatus = 'pending' | 'attended';

export type ReminderLeadMinutes = 15 | 30 | 60;

export interface NailService {
  id: string;
  name: string;
  priceEur: number;
  durationMin: number;
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientContact: string;
  serviceId: string;
  serviceName: string;
  priceEur: number;
  dateKey: string; // YYYY-MM-DD
  time: string; // HH:MM
  designReference: string;
  status: AppointmentStatus;
  createdAt: string;
}

export type SlotStatus = 'available' | 'selected' | 'booked' | 'blocked';

export type AgendaNotificationKind =
  | 'new_booking'
  | 'reminder_upcoming'
  | 'grace_period'
  | 'grace_expired'
  | 'cleanup';

export interface AgendaNotification {
  id: string;
  kind: AgendaNotificationKind;
  title: string;
  message: string;
  timestamp: string;
  appointmentId?: string;
  read: boolean;
}

export interface ReminderAlert {
  id: string;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  time: string;
  dateKey: string;
  minutesDelta: number; // positive = minutes until start; negative = minutes past start
  severity: 'upcoming' | 'grace_active' | 'grace_expired';
  title: string;
  detail: string;
}

export interface DayOption {
  dateKey: string;
  weekdayShort: string;
  dayNumber: string;
  monthShort: string;
  isToday: boolean;
}
