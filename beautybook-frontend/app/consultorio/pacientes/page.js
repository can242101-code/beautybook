'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppBadge from '@/components/ui/AppBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fmtFechaCorta as fmtFecha } from '@/lib/utils';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [loadingH,  setLoadingH]  = useState(false);

  useEffect(() => {
    api.get('/consultorio/pacientes')
      .then(r => setPacientes(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verHistorial = async (p) => {
    setSelected(p);
    setHistorial(null);
    setLoadingH(true);
    try {
      const { data } = await api.get(`/consultorio/pacientes/${p.id}`);
      setHistorial(data);
    } catch {
      setHistorial({ citas: [] });
    } finally {
      setLoadingH(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold mb-0">Historial de pacientes</h3>
        <p className="text-muted mb-0 small">{pacientes.length} pacientes únicos registrados</p>
      </div>

      <div className="row g-4">
        {/* Lista de pacientes */}
        <div className={selected ? 'col-12 col-lg-5' : 'col-12'}>
          {pacientes.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5 text-muted">
                <i className="bi bi-people d-block mb-2" style={{ fontSize: '2rem' }} />
                Aún no hay pacientes con citas en tu consultorio.
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm" style={{ borderRadius: '0.875rem' }}>
              <div className="list-group list-group-flush rounded-3">
                {pacientes.map(p => (
                  <button
                    key={p.id}
                    className={`list-group-item list-group-item-action px-4 py-3 border-0 ${selected?.id === p.id ? 'active' : ''}`}
                    onClick={() => verHistorial(p)}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 ${selected?.id === p.id ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                        style={{ width: 40, height: 40 }}>
                        {(p.name ?? 'P')[0].toUpperCase()}
                      </div>
                      <div className="text-start min-w-0">
                        <div className="fw-semibold text-truncate">{p.name}</div>
                        <div className={`small text-truncate ${selected?.id === p.id ? 'opacity-75' : 'text-muted'}`}>{p.email}</div>
                      </div>
                      <div className="ms-auto text-end flex-shrink-0">
                        <div className="small fw-semibold">{p.total_citas} cita{p.total_citas !== 1 ? 's' : ''}</div>
                        <div className={`small ${selected?.id === p.id ? 'opacity-75' : 'text-muted'}`}>{fmtFecha(p.ultima_visita)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Historial del paciente seleccionado */}
        {selected && (
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '0.875rem' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold flex-shrink-0"
                    style={{ width: 48, height: 48 }}>
                    {(selected.name ?? 'P')[0].toUpperCase()}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">{selected.name}</h6>
                    <p className="text-muted small mb-0">{selected.email}{selected.telefono ? ` · ${selected.telefono}` : ''}</p>
                  </div>
                  <button className="btn btn-link btn-sm ms-auto text-muted p-0" onClick={() => setSelected(null)}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>

                {loadingH ? <LoadingSpinner /> : historial?.citas?.length === 0 ? (
                  <p className="text-muted text-center small py-3 mb-0">Sin citas registradas.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {historial?.citas?.map(c => (
                      <div key={c.id} className="d-flex align-items-center gap-3 p-3 rounded-3 bg-body-secondary">
                        <div className="text-center" style={{ minWidth: '3.5rem' }}>
                          <div className="fw-bold small">{fmtFecha(c.fecha)}</div>
                          <div className="text-muted" style={{ fontSize: '.7rem' }}>{c.hora_inicio}</div>
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="fw-medium small text-truncate">{c.tratamiento?.nombre}</div>
                          {c.calificacion && (
                            <div className="text-warning small">
                              {'★'.repeat(c.calificacion)}{'☆'.repeat(5 - c.calificacion)}
                            </div>
                          )}
                        </div>
                        <AppBadge text={c.estado} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
