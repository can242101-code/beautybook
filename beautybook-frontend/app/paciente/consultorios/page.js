'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { DIAS_ABBR as DIAS_ES, DIAS_ORDEN } from '@/lib/constants';

const PLAN_STYLE = {
  pro:      { color: '#7c3aed', bg: 'rgba(124,58,237,.1)',  icon: 'bi-gem',                   label: 'Pro'      },
  premium:  { color: '#d97706', bg: 'rgba(217,119,6,.1)',   icon: 'bi-lightning-charge-fill', label: 'Premium'  },
  basico:   { color: 'var(--bb-p)', bg: 'rgba(var(--bb-p-rgb),.1)', icon: 'bi-star-fill',    label: 'Básico'   },
  gratuito: { color: '#64748b', bg: 'rgba(100,116,139,.08)', icon: 'bi-star',                label: 'Gratuito' },
};

export default function ConsultoriosPublicosPage() {
  const [consultorios, setConsultorios] = useState([]);
  const [ciudad,   setCiudad]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const buscar = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get(`/consultorios${ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : ''}`);
      setConsultorios(data);
    } catch {
      setConsultorios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscar(); }, []);

  return (
    <>
      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-0">Consultorios</h3>
          <p className="text-muted mb-0 small">Todos los consultorios son verificados antes de publicarse</p>
        </div>
        <span className="badge bg-body-secondary text-body border fs-6 fw-normal px-3 py-2">
          <i className="bi bi-building me-1" />{consultorios.length} disponibles
        </span>
      </div>

      {/* Buscador */}
      <form onSubmit={buscar} className="mb-4">
        <div className="input-group shadow-sm">
          <span className="input-group-text border-0 bg-body-secondary">
            <i className="bi bi-search text-muted" />
          </span>
          <input className="form-control border-0 bg-body-secondary"
            placeholder="Buscar por ciudad…"
            value={ciudad}
            onChange={e => setCiudad(e.target.value)} />
          <button type="submit" className="btn btn-primary px-4 fw-medium" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Buscar
          </button>
        </div>
      </form>

      {loading ? <LoadingSpinner /> : consultorios.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{ width: 64, height: 64, background: 'rgba(var(--bb-p-rgb),.08)' }}>
              <i className="bi bi-building-slash" style={{ fontSize: '1.75rem', color: 'var(--bb-p)' }} />
            </div>
            <h6 className="fw-semibold mb-1">No se encontraron consultorios</h6>
            <p className="text-muted small mb-0">Intenta con otra ciudad o limpia el filtro.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {consultorios.map(c => {
            const plan  = c.membrecia?.plan ?? 'basico';
            const ps    = PLAN_STYLE[plan] ?? PLAN_STYLE.basico;
            const dias  = (c.horarios ?? []).filter(h => h.activo).map(h => h.dia_semana);
            const calificaciones = (c.citas ?? []).filter(ci => ci.calificacion);
            const prom  = calificaciones.length
              ? (calificaciones.reduce((a, ci) => a + ci.calificacion, 0) / calificaciones.length).toFixed(1)
              : null;

            return (
              <div key={c.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem', overflow: 'hidden' }}>

                  {/* Franja de color del plan */}
                  <div style={{ height: 4, background: ps.color }} />

                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 fw-bold"
                        style={{ width: 48, height: 48, background: ps.bg, color: ps.color, fontSize: '1.2rem' }}>
                        {c.nombre?.[0]?.toUpperCase() ?? 'C'}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                          <h6 className="fw-bold mb-0 text-truncate">{c.nombre}</h6>
                          <i className="bi bi-patch-check-fill text-success flex-shrink-0" title="Consultorio verificado" />
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '.78rem' }}>
                          <i className="bi bi-geo-alt-fill me-1 text-primary" />
                          {c.ciudad}{c.direccion ? `, ${c.direccion}` : ''}
                        </div>
                      </div>
                      <span className="badge d-flex align-items-center gap-1 flex-shrink-0"
                        style={{ background: ps.bg, color: ps.color, fontSize: '.7rem', fontWeight: 600 }}>
                        <i className={`bi ${ps.icon}`} />{ps.label}
                      </span>
                    </div>

                    {/* Descripción */}
                    {c.descripcion && (
                      <p className="text-muted small mb-3" style={{
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5,
                      }}>
                        {c.descripcion}
                      </p>
                    )}

                    {/* Días de atención */}
                    {dias.length > 0 && (
                      <div className="d-flex gap-1 mb-3">
                        {DIAS_ORDEN.map(d => (
                          <span key={d} className={`d-flex align-items-center justify-content-center rounded-1 fw-semibold`}
                            style={{
                              width: 26, height: 26, fontSize: '.68rem',
                              background: dias.includes(d) ? 'rgba(var(--bb-p-rgb),.12)' : 'rgba(var(--bs-secondary-rgb),.06)',
                              color: dias.includes(d) ? 'var(--bb-p)' : 'var(--bs-secondary-color)',
                              opacity: dias.includes(d) ? 1 : .4,
                            }}>
                            {DIAS_ES[d]}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="d-flex align-items-center gap-3 mb-4 flex-wrap" style={{ fontSize: '.78rem' }}>
                      <span className="text-muted">
                        <i className="bi bi-tooth me-1 text-primary" />
                        {c.tratamientos?.length ?? 0} tratamientos
                      </span>
                      {prom ? (
                        <span className="fw-semibold">
                          <i className="bi bi-star-fill text-warning me-1" />{prom}
                          <span className="text-muted fw-normal ms-1">({calificaciones.length})</span>
                        </span>
                      ) : (
                        <span className="text-muted">Sin calificaciones aún</span>
                      )}
                    </div>

                    <Link className="btn btn-primary w-100 fw-medium" href={`/paciente/consultorios/${c.id}`}>
                      <i className="bi bi-calendar-plus me-2" />Ver y agendar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
