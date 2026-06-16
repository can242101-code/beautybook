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

export default function AppBadge({ text, variant }) {
  const color = variant || ESTADO_COLOR[text?.toLowerCase()] || 'secondary';
  return (
    <span className={`badge bg-${color} text-capitalize`}>{text}</span>
  );
}
