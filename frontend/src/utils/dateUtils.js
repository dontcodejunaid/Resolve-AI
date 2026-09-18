/**
 * Date and Time parsing utility to ensure server UTC timestamps
 * are accurately synchronized to the user's local timezone.
 */

export const parseServerDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;

  let s = String(dateStr).trim();
  // If string does not have a timezone indicator (Z or +HH:MM or -HH:MM), treat it as UTC
  if (!s.endsWith('Z') && !s.includes('+') && !s.match(/-\d{2}:\d{2}$/)) {
    s = s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = parseServerDate(dateStr);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '—';
  const d = parseServerDate(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
