export const fmtISO = (d) => d.toISOString().split('T')[0];

const soloFecha = (f) => f ? String(f).slice(0, 10) : null;

export const fmtFecha = (f) => {
  const d = soloFecha(f);
  if (!d) return '—';
  return new Date(`${d}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const fmtFechaCorta = (f) => {
  const d = soloFecha(f);
  if (!d) return '—';
  return new Date(`${d}T12:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const fmtFechaLarga = (f) => {
  const d = soloFecha(f);
  if (!d) return '—';
  return new Date(`${d}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};
