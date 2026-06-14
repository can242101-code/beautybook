export const fmtISO = (d) => d.toISOString().split('T')[0];

export const fmtFecha = (f) =>
  new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

export const fmtFechaCorta = (f) => f
  ? new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export const fmtFechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
