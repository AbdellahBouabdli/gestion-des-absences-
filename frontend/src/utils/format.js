import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

export const formatDate = (value, pattern = 'ddd D MMM') =>
  value ? dayjs(value).format(pattern) : '—';

export const formatFullDate = (value) => formatDate(value, 'dddd D MMMM YYYY');

export const formatShortDate = (value) => formatDate(value, 'DD/MM/YYYY');

export const formatTime = (value) => (value ? String(value).slice(0, 5) : '—');

export const formatDateTime = (value) => (value ? dayjs(value).format('D MMM YYYY · HH:mm') : '—');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const roleLabels = {
  ADMIN: 'Administration',
  TEACHER: 'Enseignant',
  STUDENT: 'Étudiant',
};

export const absenceMeta = {
  ABSENT: { label: 'Absence', color: 'error', tone: '#e76f51' },
  JUSTIFIED: { label: 'Justifiée', color: 'success', tone: '#2e9e6b' },
};

export const justificationMeta = {
  PENDING: { label: 'En attente', color: 'warning', tone: '#e9a23b' },
  APPROVED: { label: 'Approuvé', color: 'success', tone: '#2e9e6b' },
  REJECTED: { label: 'Refusé', color: 'error', tone: '#e76f51' },
};

export const currentWeek = (anchor = dayjs()) => {
  const mondayOffset = (anchor.day() + 6) % 7;
  const start = anchor.subtract(mondayOffset, 'day').startOf('day');
  return { from: start.format('YYYY-MM-DD'), to: start.add(6, 'day').format('YYYY-MM-DD'), start };
};

export const fileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};
