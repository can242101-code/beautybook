const ESTADO_COLOR = {
  pendiente:  'warning',
  confirmada: 'success',
  cancelada:  'danger',
  completada: 'secondary',
  activa:     'success',
  vencida:    'danger',
  gratuito:   'secondary',
  basico:     'secondary',
  premium:    'primary',
  pro:        'warning',
};

const LABEL_MAP = { basico: 'Básico' };

export default function AppBadge({ text, variant }) {
  const key   = text?.toLowerCase();
  const color = variant || ESTADO_COLOR[key] || 'secondary';
  const label = LABEL_MAP[key] ?? text;
  return (
    <span className={`badge bg-${color} text-capitalize`}>{label}</span>
  );
}
