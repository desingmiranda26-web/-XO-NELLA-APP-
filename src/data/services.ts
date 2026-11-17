import type { NailService } from '../types/agenda';

export const NAIL_SERVICES: NailService[] = [
  {
    id: 'semi-permanente',
    name: 'Semi permanente',
    priceEur: 9,
    durationMin: 45,
    description: 'Color liso o minimalista de alta duración y brillo espejo.',
  },
  {
    id: 'pedicura',
    name: 'Pedicura',
    priceEur: 9,
    durationMin: 45,
    description: 'Limpieza profunda, perfilado impecable y esmaltado duradero.',
  },
  {
    id: 'dipping-acrilico',
    name: 'Dipping de acrílico',
    priceEur: 13,
    durationMin: 60,
    description: 'Refuerzo en polvo acrílico ligero, resistente y de acabado fino.',
  },
  {
    id: 'base-rubber',
    name: 'Base rubber',
    priceEur: 13,
    durationMin: 60,
    description: 'Nivelación flexible ideal para fortalecer uña natural frágil.',
  },
  {
    id: 'jelly-tips',
    name: 'Jelly tips',
    priceEur: 15,
    durationMin: 75,
    description: 'Extensión soft-gel ultra cómoda con forma definida y natural.',
  },
  {
    id: 'kapping',
    name: 'Kapping (en gel, polygel y acrílico)',
    priceEur: 15,
    durationMin: 75,
    description: 'Baño protector sobre tu largo natural para cero quiebres.',
  },
  {
    id: 'sistema-polygel-acrilico',
    name: 'Sistema de polygel y de acrílico',
    priceEur: 18,
    durationMin: 90,
    description: 'Esculpido estructurado a medida con máxima resistencia.',
  },
];

export const STUDIO_TIME_SLOTS: string[] = [
  '07:00',
  '08:00',
  '09:00',
  '10:30',
  '12:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30',
];

export const STUDIO_TERMS: string[] = [
  'Ser puntual con la cita.',
  'Solo se esperará un lapso de 10 min, si no se cederá el turno a otra persona.',
  'Sin niños o acompañantes (esto para evitar distracciones y reducir tiempo en mesa).',
  'Enviar la referencia del diseño que se quieran hacer (esto también para reducir tiempo en mesa).',
];
