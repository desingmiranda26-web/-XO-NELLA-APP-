import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDIO_TIME_SLOTS } from '../data/services';
import {
  calculateDayStats,
  computeReminderAlerts,
  createAppointmentRecord,
  formatDateKey,
  getSlotStatus,
  removeAttendedAppointments,
  toggleBlockedSlot,
  validateBookingInput,
} from './agendaLogic';
import type { Appointment } from '../types/agenda';

test('STUDIO_TIME_SLOTS starts at 07:00 AM', () => {
  assert.equal(STUDIO_TIME_SLOTS[0], '07:00');
  assert.ok(STUDIO_TIME_SLOTS.includes('08:00'));
});

test('getSlotStatus prioritizes booked, then blocked, then selected, then available', () => {
  const appts: Appointment[] = [
    createAppointmentRecord({
      id: 'a1',
      clientName: 'Lucía',
      clientContact: '@lucia',
      serviceId: 'semi-permanente',
      dateKey: '2026-11-17',
      time: '10:30',
    }),
  ];
  const blocked = toggleBlockedSlot([], '2026-11-17', '12:00');

  assert.equal(getSlotStatus('2026-11-17', '10:30', '10:30', appts, blocked), 'booked');
  assert.equal(getSlotStatus('2026-11-17', '12:00', '12:00', appts, blocked), 'blocked');
  assert.equal(getSlotStatus('2026-11-17', '15:00', '15:00', appts, blocked), 'selected');
  assert.equal(getSlotStatus('2026-11-17', '16:30', '15:00', appts, blocked), 'available');
});

test('validateBookingInput rejects missing fields and occupied slots', () => {
  const appts: Appointment[] = [
    createAppointmentRecord({
      id: 'a1',
      clientName: 'Paula',
      clientContact: '600111222',
      serviceId: 'pedicura',
      dateKey: '2026-11-17',
      time: '09:00',
    }),
  ];

  assert.equal(
    validateBookingInput({
      clientName: '',
      clientContact: '@ana',
      serviceId: 'pedicura',
      dateKey: '2026-11-17',
      time: '10:30',
      appointments: appts,
      blockedSlots: [],
    }).valid,
    false,
  );

  assert.equal(
    validateBookingInput({
      clientName: 'Ana',
      clientContact: '@ana',
      serviceId: 'pedicura',
      dateKey: '2026-11-17',
      time: '09:00',
      appointments: appts,
      blockedSlots: [],
    }).valid,
    false,
  );

  assert.equal(
    validateBookingInput({
      clientName: 'Ana',
      clientContact: '@ana',
      serviceId: 'jelly-tips',
      dateKey: '2026-11-17',
      time: '16:30',
      appointments: appts,
      blockedSlots: [],
    }).valid,
    true,
  );
});

test('removeAttendedAppointments removes only attended appointments', () => {
  const pending = createAppointmentRecord({
    id: 'p1',
    clientName: 'Elena',
    clientContact: '@elena',
    serviceId: 'base-rubber',
    dateKey: '2026-11-17',
    time: '12:00',
  });
  const attended: Appointment = {
    ...createAppointmentRecord({
      id: 'a2',
      clientName: 'Sara',
      clientContact: '@sara',
      serviceId: 'kapping',
      dateKey: '2026-11-17',
      time: '09:00',
    }),
    status: 'attended',
  };

  const result = removeAttendedAppointments([pending, attended]);
  assert.equal(result.removedCount, 1);
  assert.equal(result.remaining.length, 1);
  assert.equal(result.remaining[0].id, 'p1');
});

test('computeReminderAlerts detects upcoming window, active 10-min grace, and expired grace', () => {
  const now = new Date(2026, 10, 17, 14, 0, 0);
  const dateKey = formatDateKey(now);

  const upcomingAppt = createAppointmentRecord({
    id: 'u1',
    clientName: 'Nadia',
    clientContact: '@nadia',
    serviceId: 'jelly-tips',
    dateKey,
    time: '14:20',
  });
  const graceAppt = createAppointmentRecord({
    id: 'g1',
    clientName: 'Marta',
    clientContact: '@marta',
    serviceId: 'pedicura',
    dateKey,
    time: '13:55',
  });
  const expiredAppt = createAppointmentRecord({
    id: 'e1',
    clientName: 'Karla',
    clientContact: '@karla',
    serviceId: 'dipping-acrilico',
    dateKey,
    time: '13:40',
  });
  const attendedAppt: Appointment = {
    ...createAppointmentRecord({
      id: 'd1',
      clientName: 'Zoe',
      clientContact: '@zoe',
      serviceId: 'semi-permanente',
      dateKey,
      time: '14:10',
    }),
    status: 'attended',
  };

  const alerts = computeReminderAlerts(
    [upcomingAppt, graceAppt, expiredAppt, attendedAppt],
    now,
    30,
  );

  assert.equal(alerts.length, 3);
  assert.equal(alerts[0].severity, 'grace_expired');
  assert.equal(alerts[1].severity, 'grace_active');
  assert.equal(alerts[2].severity, 'upcoming');
  assert.equal(alerts[2].minutesDelta, 20);
});

test('calculateDayStats sums counts and projected EUR revenue accurately', () => {
  const a1 = createAppointmentRecord({
    id: '1',
    clientName: 'A',
    clientContact: '1',
    serviceId: 'semi-permanente', // 9€
    dateKey: '2026-11-17',
    time: '09:00',
  });
  const a2: Appointment = {
    ...createAppointmentRecord({
      id: '2',
      clientName: 'B',
      clientContact: '2',
      serviceId: 'sistema-polygel-acrilico', // 18€
      dateKey: '2026-11-17',
      time: '10:30',
    }),
    status: 'attended',
  };

  const stats = calculateDayStats([a1, a2], '2026-11-17');
  assert.equal(stats.totalCount, 2);
  assert.equal(stats.pendingCount, 1);
  assert.equal(stats.attendedCount, 1);
  assert.equal(stats.totalRevenueEur, 27);
});
