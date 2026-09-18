/**
 * Accurate Real-Time Date & Time Formatting Utilities for RESOLVE.ai
 * Handles UTC strings, naive timestamps, and formats cleanly in user's actual local time.
 */

export const parseActualDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return isNaN(timestamp.getTime()) ? null : timestamp;

  let dateStr = String(timestamp).trim();
  if (!dateStr) return null;

  // Handle SQLite / ISO strings without timezone indicator
  // If string contains 'T' and does not end with Z or timezone offset (+XX:XX or -XX:XX after time)
  if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.slice(10).includes('-')) {
    dateStr += 'Z';
  } else if (!dateStr.includes('T') && dateStr.includes(' ') && !dateStr.endsWith('Z')) {
    // Format: "2026-09-18 18:35:40"
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export const parseServerDate = parseActualDate;

/**
 * Format time e.g. "12:05:30 AM" or "12:05 AM"
 */
export const formatActualTime = (timestamp, includeSeconds = true) => {
  const d = parseActualDate(timestamp);
  if (!d) return '';
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
};

export const formatTimeOnly = (timestamp) => formatActualTime(timestamp, true);

/**
 * Format full date & time e.g. "Sep 19, 2026, 12:05:30 AM"
 */
export const formatActualDateTime = (timestamp) => {
  const d = parseActualDate(timestamp);
  if (!d) return '';
  return d.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = formatActualDateTime;

/**
 * Format date only e.g. "Sep 19, 2026"
 */
export const formatActualDate = (timestamp) => {
  const d = parseActualDate(timestamp);
  if (!d) return '';
  return d.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Human-readable relative time string e.g. "Just now", "2s ago", "1m ago"
 */
export const formatRelativeTime = (timestamp) => {
  const d = parseActualDate(timestamp);
  if (!d) return 'Just now';

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 5000) return 'Just now';
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return formatActualDate(d);
};
