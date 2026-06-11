'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import AppBadge from '@/components/ui/AppBadge';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HOY = new Date().toISOString().split('T')[0];

export default function DetalleConsultorioPage() {
  const { id }    = useParams();
  const router    = useRouter();

  const [consultorio,   setConsultorio]   = useState(null);
  const [tratamiento,   setTratamiento]   = useState(null);
  const [fecha,         setFecha]         = useState('');
  const [slots,         setSlots]         = useState([]);
  const [slot,          setSlot]          = useState(null);
  const [notas,         setNotas]         = useState('');
  const [loadingPage,   setLoadingPage]   = useState(true);
  const [loadingSlots,  setLoadingSlots]  = useState(false);
  const [loadingCita,   setLoadingCita]   = useState(false);
  const [citaCreada,    setCitaCreada]    = useState(null);
  const [error,         setError]         = useState('');

  // Carga datos del consultorio
  useEffect(() => {
    api.get(`/consultorios/${id}`)
      .then(r => setConsultorio(r.data))
      .catch(() => setError('No se pudo cargar el consultorio.'))
      .finally(() => setLoadingPage(false));
  }, [id]);

  // Carga slots cuando cambian tratamiento o fecha
  useEffect(() => {
    if (!tratamiento || !fecha) { setSlots([]); setSlot(null); return; }

    setLoadingSlots(true);
    setSlot(null);
    api.get(`/disponibilidad?consultorio_id=${id}&tratamiento_id=${tratamiento.id}&fecha=${fecha}`)
      .then(r => setSlots(r.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [tratamiento, fecha, id]);

  const seleccionarTratamiento = (t) => {
    setTratamiento(t);
    setFecha('');
    setSlots([]);
    setSlot(null);
    setError('');
  };

  const confirmar = async () => {
    if (!slot) return;
    setError('');
    setLoadingCita(true);
    try {
      const { data } = await api.post('/citas', {
        consultorio_id: parseInt(id),
        tratamiento_id: tratamiento.id,
        fecha,
        hora_inicio: slot.hora_inicio,
        notas: notas.trim() || null,
      });
      setCitaCreada(data);
    } catch (err) {
      setError(err.message || 'No se pudo agendar la cita.');
    } finally {
      setLoadingCita(false);
    }
  };

  if (loadingPage) return <div className="py-5"><LoadingSpinner /></div>;
  if (!consultorio) return <AppAlert type="danger" message={error || 'Consultorio no encontrado.'} />;

  // Pantalla de éxito
  if (citaCreada) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3.5rem' }} />
        </div>
        <h4 className="fw-bold mb-1">¡Cita agendada correctamente!</h4>
        <p className="text-muted mb-4">
          {citaCreada.tratamiento?.nombre} · {citaCreada.fecha} a las {citaCreada.hora_inicio}
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link className="btn btn-primary" href="/paciente/citas">
            <i className="bi bi-calendar3 me-2" />
            Ver mis citas
          </Link>
          <Link className="btn btn-outline-secondary" href="/paciente/consultorios">
            <i className="bi bi-arrow-left me-2" />
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const tratamientosActivos = consultorio.tratamientos?.filter(t => t.activo) ?? [];

  return (
    <>
      {/* Encabezado */}
      <div className="mb-4">
        <Link className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-3" href="/paciente/consultorios">
          <i className="bi bi-arrow-left" /> Consultorios
        </Link>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-1">{consultorio.nombre}</h3>
            <p className="text-muted mb-0">
              <i className="bi bi-geo-alt me-1" />
              {consultorio.direccion}, {consultorio.ciudad}
            </p>
          </div>
          <AppBadge text={consultorio.membrecia?.plan ?? 'gratuito'} />
        </div>
        {consultorio.descripcion && (
          <p className="text-muted small mt-2 mb-0">{consultorio.descripcion}</p>
        )}
      </div>

      <AppAlert type="danger" message={error} onClose={() => setError('')} />

      <div className="row g-4">
        {/* Columna izquierda — pasos 1 y 2 */}
        <div className="col-lg-7">

          {/* Paso 1 — Tratamiento */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-bottom py-3">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: 24, height: 24, lineHeight: '24px', fontSize: '0.75rem' }}>1</span>
                Selecciona un tratamiento
              </span>
            </div>
            <div className="card-body p-3">
              {tratamientosActivos.length === 0 ? (
                <p className="text-muted text-center py-3 mb-0">Este consultorio aún no tiene tratamientos registrados.</p>
              ) : (
                <div className="row g-2">
                  {tratamientosActivos.map(t => (
                    <div key={t.id} className="col-12">
                      <button
                        type="button"
                        onClick={() => seleccionarTratamiento(t)}
                        className={`w-100 text-start border rounded-3 p-3 d-flex justify-content-between align-items-center ${
                          tratamiento?.id === t.id
                            ? 'border-primary bg-primary bg-opacity-10'
                            : 'border-secondary-subtle'
                        }`}
                        style={{ background: 'none', cursor: 'pointer', transition: 'all .15s' }}
                      >
                        <div>
                          <div className="fw-semibold">{t.nombre}</div>
                          <div className="text-muted small">
                            <i className="bi bi-clock me-1" />{t.duracion_minutos} min
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">${parseFloat(t.precio).toFixed(2)}</div>
                          {tratamiento?.id === t.id && (
                            <i className="bi bi-check-circle-fill text-primary small" />
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paso 2 — Fecha */}
          <div className={`card border-0 shadow-sm mb-4 ${!tratamiento ? 'opacity-50' : ''}`}>
            <div className="card-header bg-transparent border-bottom py-3">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: 24, height: 24, lineHeight: '24px', fontSize: '0.75rem' }}>2</span>
                Elige una fecha
              </span>
            </div>
            <div className="card-body p-3">
              <input
                type="date"
                className="form-control"
                min={HOY}
                value={fecha}
                onChange={e => { setFecha(e.target.value); setSlot(null); }}
                disabled={!tratamiento}
              />
            </div>
          </div>

          {/* Paso 3 — Slots */}
          <div className={`card border-0 shadow-sm ${(!tratamiento || !fecha) ? 'opacity-50' : ''}`}>
            <div className="card-header bg-transparent border-bottom py-3">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: 24, height: 24, lineHeight: '24px', fontSize: '0.75rem' }}>3</span>
                Selecciona un horario
              </span>
            </div>
            <div className="card-body p-3">
              {loadingSlots ? (
                <LoadingSpinner />
              ) : !tratamiento || !fecha ? (
                <p className="text-muted text-center py-2 mb-0 small">Selecciona un tratamiento y una fecha primero.</p>
              ) : slots.length === 0 ? (
                <p className="text-muted text-center py-2 mb-0 small">
                  <i className="bi bi-calendar-x me-1" />
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {slots.map(s => (
                    <button
                      key={s.hora_inicio}
                      type="button"
                      disabled={!s.disponible}
                      onClick={() => setSlot(s)}
                      className={`btn btn-sm px-3 ${
                        !s.disponible
                          ? 'btn-outline-secondary disabled text-decoration-line-through'
                          : slot?.hora_inicio === s.hora_inicio
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                    >
                      {s.hora_inicio}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha — resumen y confirmación */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm position-sticky" style={{ top: '1.5rem' }}>
            <div className="card-header bg-transparent border-bottom py-3">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <i className="bi bi-clipboard2-check" />
                Resumen de la cita
              </span>
            </div>
            <div className="card-body p-3">
              {/* Detalles */}
              <ul className="list-unstyled mb-3">
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Consultorio</span>
                  <span className="fw-semibold small text-end">{consultorio.nombre}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Tratamiento</span>
                  <span className="fw-semibold small text-end">{tratamiento?.nombre ?? '—'}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Duración</span>
                  <span className="fw-semibold small">{tratamiento ? `${tratamiento.duracion_minutos} min` : '—'}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Fecha</span>
                  <span className="fw-semibold small">{fecha || '—'}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Hora</span>
                  <span className="fw-semibold small">{slot ? `${slot.hora_inicio} – ${slot.hora_fin}` : '—'}</span>
                </li>
                <li className="d-flex justify-content-between py-2">
                  <span className="text-muted small">Precio</span>
                  <span className="fw-bold">{tratamiento ? `$${parseFloat(tratamiento.precio).toFixed(2)}` : '—'}</span>
                </li>
              </ul>

              {/* Notas */}
              <div className="mb-3">
                <label className="form-label small">Notas para el consultorio <span className="text-muted">(opcional)</span></label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  maxLength={500}
                  placeholder="Ej. soy alérgico a la penicilina…"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                />
              </div>

              {/* Botón */}
              <button
                type="button"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={!tratamiento || !fecha || !slot || loadingCita}
                onClick={confirmar}
              >
                {loadingCita
                  ? <><span className="spinner-border spinner-border-sm" /> Agendando…</>
                  : <><i className="bi bi-calendar-check" /> Confirmar cita</>
                }
              </button>

              {(!tratamiento || !fecha || !slot) && (
                <p className="text-muted text-center small mt-2 mb-0">
                  Completa los 3 pasos para confirmar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
